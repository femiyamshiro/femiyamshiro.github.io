import assert from "node:assert/strict";
import { gunzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";

const rulesText=gunzipSync(await readFile(new URL("../native/Data/rules.pack.json.gz",import.meta.url))).toString("utf8");
const source=(await readFile(new URL("./ipad-model.ts",import.meta.url),"utf8")).replace(/const rawRules=\(await import\("virtual:juance-rules-pack"\)\)\.default;\s*/,`const rawRules=JSON.parse(Buffer.from("${Buffer.from(rulesText).toString("base64")}","base64").toString("utf8"));\n`);
const javascript=stripTypeScriptTypes(source,{mode:"strip"});
const model=await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

const character=(patch={})=>({...model.defaultCharacter(),...patch,abilities:{...model.defaultCharacter().abilities,...patch.abilities}});

test("body armor excludes shields and AC follows current Windows formulas",()=>{
  const defaults=model.defaultCharacter();
  const base=character({armorName:"无甲",abilities:{敏捷:16,魅力:18}});
  assert.equal(model.BASE_WEAPONS.some(weapon=>weapon.Name===defaults.attacks[0].name),true);
  assert.equal(defaults.equipment[0].itemCategory,model.EQUIPMENT.find(item=>item.Name===defaults.equipment[0].name)?.Category);
  assert.match(defaults.equipment[0].detail,/工具/);
  assert.equal(model.armorOptions(base).some(armor=>armor.Type==="盾牌"||armor.Name==="盾牌"),false);
  assert.equal(model.shieldOptions(base).length>0,true);
  assert.equal(model.armorClass({...base,className:"吟游诗人",subclass:"舞蹈学院"}).value,17);
  assert.equal(model.armorClass({...base,className:"术士",subclass:"龙族术法"}).value,16);
});

test("named shields, enhancement and attunement survive Windows import",()=>{
  const shield=model.shieldOptions(character())[0];
  const imported=model.normalizeWorkspace({Characters:[{Name:"盾牌测试",ArmorName:"皮甲",ShieldName:shield.Name,ArmorEnhancement:4,ShieldEnhancement:3,ArmorAttuned:true,ShieldAttuned:true}],ActiveIndex:0}).characters[0];
  assert.equal(imported.shieldName,shield.Name);
  assert.equal(imported.shield,true);
  assert.equal(imported.armorEnhancement,4);
  assert.equal(imported.shieldEnhancement,3);
  assert.equal(imported.armorAttuned,true);
  assert.equal(imported.shieldAttuned,true);
  assert.equal(model.armorClass(imported).value>=15,true);
});

test("skill disadvantage sources include worn armor and matching equipment text",()=>{
  const heavyArmor=model.armorOptions(character()).find(armor=>armor.StealthDisadvantage);
  assert.ok(heavyArmor);
  const c=character({armorName:heavyArmor.Name,equipment:[
    {id:"boots",name:"沉重靴子",detail:"穿戴时隐匿检定具有劣势",note:"",quantity:1},
    {id:"kit",name:"破损工具",detail:"",note:"使用它进行巧手检定时具有劣势",quantity:1},
    {id:"cloak",name:"",detail:"",note:"隐匿检定劣势",quantity:1}
  ]});
  assert.deepEqual(model.skillDisadvantageSources(c,"隐匿"),[heavyArmor.Name,"沉重靴子","装备"]);
  assert.deepEqual(model.skillDisadvantageSources(c,"巧手"),["破损工具"]);
  assert.deepEqual(model.skillDisadvantageSources(c,"察觉"),[]);
});

test("third casters, ranger cantrips and pact slots use the correct progression",()=>{
  const fireball=model.RULES.Spells.find(spell=>spell.Name==="火球术"&&spell.Source==="玩家手册2024");
  assert.equal(fireball.Level,3);
  assert.deepEqual(fireball.Classes,["术士","法师"]);
  assert.equal(model.RULES.Spells.filter(spell=>spell.Level<0||spell.Level>9||!spell.Classes?.length).length,0);
  assert.deepEqual(model.spellSlots("战士","奥法骑士",6),{"1":3});
  assert.deepEqual(model.spellSlots("游荡者","诡术师",7),{"1":4,"2":2});
  assert.equal(model.spellListClass("游侠","",0),"德鲁伊");
  assert.equal(model.spellListClass("战士","奥法骑士",1),"法师");
  assert.equal(model.maximumPreparedSpellLevel("战士","奥法骑士",6),1);
  assert.equal(model.maximumPreparedSpellLevel("魔契师","",11),5);
  assert.deepEqual(model.spellSlots("魔契师","",11),{"5":3,"6":1});
});

test("wizard spellbook progression and savant grants match Windows",()=>{
  assert.equal(model.wizardSpellbookSlots(character({className:"法师",level:1})).length,6);
  assert.equal(model.wizardSpellbookSlots(character({className:"法师",level:3})).length,10);
  assert.equal(model.wizardSpellbookSlots(character({className:"法师",level:20})).length,44);
  const diviner=character({className:"法师",subclass:"预言师",level:5});
  assert.equal(model.wizardSavantSchool(diviner),"预言");
  const subclassSlots=model.wizardSpellbookSlots(diviner).filter(slot=>slot.kind.startsWith("subclass"));
  assert.equal(subclassSlots.length,3);
  assert.equal(subclassSlots[0].key,"spellbook:subclass:预言师:3:1");
  assert.equal(subclassSlots[2].key,"spellbook:subclass:预言师:5:1");
  assert.deepEqual(subclassSlots.map(slot=>[slot.minimumSpellLevel,slot.maximumSpellLevel]),[[1,2],[1,2],[3,3]]);
});

test("wizard prepared and special spells must exist in the current spellbook",()=>{
  const shield=model.RULES.Spells.find(spell=>spell.Name==="护盾术"&&spell.Source==="玩家手册2024");
  assert.ok(shield);
  const prepared={id:"prepared",name:shield.Name,detail:"",note:shield.Description,quantity:1,level:1,source:shield.Source,spellRole:"手动准备",spellContext:"法师",slotKey:"prepared:1"};
  const book={...prepared,id:"book",spellRole:"法术书·升级",slotKey:"spellbook:class:1:1"};
  const mastery={...prepared,id:"mastery",spellRole:"法术精通",slotKey:"grant:spell-mastery:1"};
  const wizard=character({className:"法师",level:18,spells:[prepared,mastery]});
  assert.deepEqual(model.currentCharacterSpells(wizard),[]);
  assert.deepEqual(model.currentCharacterSpells({...wizard,spells:[book,prepared,mastery]}).map(spell=>spell.id),["prepared","mastery"]);
  assert.deepEqual(model.wizardSpellbookEntries({...wizard,spells:[book,prepared,mastery]}).map(spell=>spell.id),["book"]);
  const imported=model.normalizeWorkspace({Characters:[{ClassName:"法师",Level:1,Spells:[{Name:shield.Name,Source:shield.Source,Level:1,SpellRole:"法术书·升级",SpellContext:"法师",SlotKey:"spellbook:class:1:1"}]}],ActiveIndex:0}).characters[0];
  assert.equal(imported.spells.some(spell=>spell.spellRole==="法术书·升级"),true);
});

test("permanent features affect maximum HP without double counting",()=>{
  const dwarf=character({className:"战士",level:3,species:"矮人",background:"",manualFeatures:[],abilities:{体质:14}});
  assert.equal(model.maxHp(dwarf),31);
  const tough=character({className:"战士",level:3,species:"人类",background:"",manualFeatures:[{id:"tough",name:"健壮",detail:"专长",note:"生命上限额外增加人物等级的两倍。",quantity:1}],abilities:{体质:14}});
  assert.equal(model.maxHp(tough),34);
});

test("long rest restores health, spell slots and tracked combat resources",()=>{
  const spells=[{id:"prepared",name:"护盾术",detail:"",note:"",quantity:1,level:1,source:"玩家手册2024",spellRole:"手动准备",spellContext:"法师",slotKey:"prepared:1"}];
  const exhausted=character({
    className:"法师",level:5,hp:2,tempHp:7,
    resourceMarks:{hitDice:3,"feat:lucky":2},slotMarks:{"1":4,"2":3,"3":1},
    activeSpellEffects:["典礼术"],spells,coins:{cp:1,sp:2,gp:3,pp:4}
  });
  const rested=model.completeLongRest(exhausted);
  assert.equal(rested.hp,model.maxHp(exhausted));
  assert.equal(rested.tempHp,0);
  assert.deepEqual(rested.resourceMarks,{});
  assert.deepEqual(rested.slotMarks,{});
  assert.deepEqual(rested.activeSpellEffects,["典礼术"]);
  assert.deepEqual(rested.spells,spells);
  assert.deepEqual(rested.coins,{cp:1,sp:2,gp:3,pp:4});
  assert.notEqual(rested,exhausted);
});

test("conditions, exhaustion and concentration follow current Windows tracking rules",()=>{
  let c=character({activeConditions:["中毒"],exhaustionLevel:3});
  c=model.setCondition(c,"专注",true);
  assert.deepEqual(c.activeConditions,["中毒","专注"]);
  c=model.setCondition(c,"麻痹",true);
  assert.deepEqual(c.activeConditions,["中毒","麻痹"]);
  assert.deepEqual(model.setCondition(c,"专注",true).activeConditions,c.activeConditions);
  assert.deepEqual(model.normalizeConditions([" 专注 ","麻痹","麻痹"]),["麻痹"]);
  assert.equal(model.exhaustionD20Penalty(3),6);
  assert.equal(model.exhaustionSpeedPenalty(3),15);
  assert.equal(model.normalizeExhaustion(9),6);
  assert.equal(model.concentrationSaveDifficulty(18),10);
  assert.equal(model.concentrationSaveDifficulty(46),23);
  assert.equal(model.concentrationSaveDifficulty(100),30);
  assert.equal(model.speedValue(c).value,0);
  assert.equal(model.speedValue({...c,activeConditions:[]}).value,15);
});

test("HP expressions validate and resolve each event in order",()=>{
  const c=character({hp:20,tempHp:5,abilities:{体质:10},level:1});
  const maximum=model.maxHp(c);
  const full={...c,hp:maximum};
  assert.deepEqual(model.previewHitPointExpression(full,"+4-5"),{valid:true,hp:maximum,tempHp:0,damages:[5]});
  assert.deepEqual(model.previewHitPointExpression(full,"-5+4-2"),{valid:true,hp:maximum-2,tempHp:0,damages:[5,2]});
  assert.deepEqual(model.previewHitPointExpression(full,"abc-5"),{valid:false,hp:maximum,tempHp:5,damages:[]});
});

test("short rest restores only eligible resources and pact slots; long rest retains exhaustion and feat use",()=>{
  const fighter=character({className:"战士",level:5,hp:2,tempHp:4,exhaustionLevel:2,resourceMarks:{secondWind:2,actionSurge:1,hitDice:3,"feat:lucky":2},slotMarks:{"1":2},spells:[{id:"free",name:"疗伤术",detail:"",note:"",quantity:1,spellRole:"魔法学徒",used:true}]});
  const short=model.completeShortRest(fighter);
  assert.deepEqual(short.resourceMarks,{secondWind:1,actionSurge:0,hitDice:3,"feat:lucky":2});
  assert.deepEqual(short.slotMarks,{"1":2});
  assert.equal(short.hp,2);
  assert.equal(short.tempHp,4);
  assert.equal(short.exhaustionLevel,2);
  const long=model.completeLongRest(fighter);
  assert.equal(long.exhaustionLevel,2);
  assert.equal(long.spells[0].used,true);
  const pact=model.completeShortRest(character({className:"魔契师",level:5,slotMarks:{"3":2},resourceMarks:{hitDice:2}}));
  assert.deepEqual(pact.slotMarks,{"3":0});
  assert.equal(pact.resourceMarks.hitDice,2);
  assert.equal(model.completeShortRest(character({className:"吟游诗人",level:5,resourceMarks:{bardic:2}})).resourceMarks.bardic,0);
  assert.equal(model.completeShortRest(character({className:"战士",subclass:"战斗大师",level:7,resourceMarks:{"subclass:superiority":4}})).resourceMarks["subclass:superiority"],0);
  assert.equal(model.completeShortRest(character({className:"游荡者",subclass:"魂刃",level:5,resourceMarks:{"subclass:psionic":4}})).resourceMarks["subclass:psionic"],3);
});

test("manual AC and custom armor survive normalization without formula leakage",()=>{
  assert.equal(character().manualAc,0);
  const input={schemaVersion:1,characters:[{...character(),armorName:"旅行甲",customArmors:[{id:"custom",name:"旅行甲",category:"中甲",baseAc:14,dexterityRule:"最多+2",strengthRequirement:13,stealthDisadvantage:true,description:"手制"}],useManualAc:true,manualAc:19}],activeCharacterId:"missing"};
  const c=model.normalizeWorkspace(input).characters[0];
  assert.equal(model.armorOptions(c).find(x=>x.Name==="旅行甲")?.BaseAc,"14");
  assert.equal(c.armorName,"旅行甲");
  assert.equal(model.armorClass(c).value,19);
  assert.equal(model.armorClass({...c,useManualAc:false}).value,16);
  assert.equal(model.armorClass({...c,useManualAc:false,customArmors:[{...c.customArmors[0],baseAc:0}]}).value,2);
  assert.equal(model.skillDisadvantageSources(c,"隐匿").includes("旅行甲"),true);
  const windows=model.normalizeWorkspace({Characters:[{Name:"Windows 新字段",ArmorName:"旅行甲",UseManualAc:true,ManualAc:18,CustomArmors:[{Id:"windows",Name:"旅行甲",Category:"中甲",BaseAc:14,DexterityRule:"最多+2",StrengthRequirement:13,StealthDisadvantage:true,Description:"手制"}],ActiveConditions:["专注","失能"],ExhaustionLevel:2,MagicInitiateClass:"牧师",DivineOrder:"奇术使",PrimalOrder:"术师",AlternateFightingStyle:"受祝福的勇士",AdditionalWeaponProficiencies:["长剑"]}],ActiveIndex:0}).characters[0];
  assert.equal(windows.armorName,"旅行甲");
  assert.equal(model.armorClass(windows).value,18);
  assert.deepEqual(windows.activeConditions,["失能"]);
  assert.equal(windows.exhaustionLevel,2);
  assert.equal(windows.magicInitiateClass,"牧师");
  assert.equal(windows.divineOrder,"奇术使");
  assert.deepEqual(windows.additionalWeaponProficiencies,["长剑"]);
});

test("weapon proficiency and mastery remain separate",()=>{
  const sword=model.BASE_WEAPONS.find(x=>x.Name==="长剑")||model.RULES.Weapons.find(x=>x.Name==="长剑");
  assert.ok(sword);
  const wizard=character({className:"法师",level:3,abilities:{力量:16},exhaustionLevel:1});
  const untrained=model.weaponAttackResolution(wizard,sword,1);
  assert.equal(untrained.proficient,false);
  assert.equal(untrained.attackBonus,2);
  assert.equal(untrained.damageBonus,4);
  assert.equal(untrained.masteryState,"notProficient");
  const trained=model.weaponAttackResolution({...wizard,additionalWeaponProficiencies:["长剑"]},sword,1);
  assert.equal(trained.proficient,true);
  assert.equal(trained.attackBonus,4);
  assert.equal(trained.masteryState,"noMasteryFeature");
  const fighter={...wizard,className:"战士"};
  assert.equal(model.weaponAttackResolution(fighter,sword,0).masteryState,"requiresSelection");
  assert.equal(model.weaponAttackResolution(fighter,sword,0,true).masteryState,"enabled");
});

test("character option choices and supplemental spells activate only in their selected branch",()=>{
  const magic={id:"magic",name:"疗伤术",detail:"",note:"",quantity:1,level:1,spellRole:"魔法学徒",spellContext:"牧师",slotKey:"magic-initiate:level1",used:true};
  const divine={...magic,id:"divine",name:"圣光术",level:0,spellRole:"圣职戏法",slotKey:"grant:divine-order:1"};
  const cleric=character({className:"牧师",divineOrder:"奇术使",magicInitiateClass:"牧师",manualFeatures:[{id:"feat",name:"魔法学徒",detail:"专长",note:"",quantity:1}],spells:[magic,divine]});
  assert.deepEqual(model.grantedCantripChoices(cleric),[{role:"圣职戏法",spellList:"牧师",count:1}]);
  assert.deepEqual(model.currentCharacterSpells(cleric).map(x=>x.id),["magic","divine"]);
  assert.deepEqual(model.currentCharacterSpells({...cleric,divineOrder:"保护者",magicInitiateClass:"法师"}),[]);
  assert.equal(model.alternateFightingStyleFor("圣武士"),"受祝福的勇士");
  assert.deepEqual(model.grantedCantripChoices(character({className:"圣武士",alternateFightingStyle:"受祝福的勇士"})),[{role:"替代战斗风格",spellList:"牧师",count:2}]);
  const restored=model.normalizeWorkspace({schemaVersion:1,activeCharacterId:"",characters:[{...cleric,exhaustionLevel:9,activeConditions:["专注","失能"],additionalWeaponProficiencies:[" 长剑 ","长剑"],attacks:[{...cleric.attacks[0],masterySelected:true}]}]}).characters[0];
  assert.equal(restored.exhaustionLevel,6);
  assert.deepEqual(restored.activeConditions,["失能"]);
  assert.deepEqual(restored.additionalWeaponProficiencies,["长剑"]);
  assert.equal(restored.attacks[0].masterySelected,true);
  assert.equal(restored.spells.find(x=>x.id==="magic")?.used,true);
});

test("background and subclass features feed combat resources",()=>{
  const lucky=model.defaultCharacter();
  assert.ok(model.resourceCaps(lucky).some(resource=>resource.label==="幸运点"&&resource.max===2));
  const diviner={...model.defaultCharacter(),className:"法师",subclass:"预言师",level:14};
  assert.ok(model.resourceCaps(diviner).some(resource=>resource.label==="预言骰"&&resource.max===3));
});

test("background origin feat choices remain explicit and select only one option",()=>{
  const background=model.RULES.Backgrounds.find(entry=>entry.OriginFeatOptions?.length>1);
  assert.ok(background,"规则包应包含至少一个多选起源专长背景");
  assert.equal(model.EXPANSIONS.includes(background.Source),true,"多选背景所属规则来源必须能在 Web 中启用");
  const options=background.OriginFeatOptions;
  const enabledSources=background.Source==="玩家手册2024"?[]:[background.Source];
  const unchosen=model.automaticFeatures(character({background:background.Name,backgroundOriginFeatChoice:"",enabledSources}));
  assert.equal(unchosen.some(feature=>options.includes(feature.name)),false);
  const invalid=model.automaticFeatures(character({background:background.Name,backgroundOriginFeatChoice:"不存在的专长",enabledSources}));
  assert.equal(invalid.some(feature=>options.includes(feature.name)),false);
  const chosen=model.automaticFeatures(character({background:background.Name,backgroundOriginFeatChoice:options[0],enabledSources}));
  assert.equal(chosen.some(feature=>feature.name===options[0]),true);
  assert.equal(chosen.some(feature=>options.slice(1).includes(feature.name)),false);
});

test("class features unlock automatically while feat choices use class-bound nodes",()=>{
  const rogue3=character({className:"游荡者",subclass:"",level:3,background:"",species:"人类"});
  const rogue4={...rogue3,level:4};
  assert.equal(model.automaticFeatures(rogue3).some(feature=>feature.source==="游荡者 4级"),false);
  assert.equal(model.automaticFeatures(rogue4).some(feature=>feature.source==="游荡者 4级"),true);
  assert.deepEqual(model.featAdvancementNodes({...rogue4,level:10}).map(node=>node.level),[4,8,10]);
  const fighter6={...rogue4,className:"战士",level:6};
  const fighterNode=model.featAdvancementNodes(fighter6)[0];
  assert.ok(model.featAdvancementNodes(fighter6).every(node=>node.key.includes("|战士|")));
  const stale=[
    {id:"old-picker",name:"盗贼黑话",detail:"游荡者 · 1级",note:"",quantity:1},
    {id:"fighter-feat",name:"警戒",detail:`专长选择·${fighterNode.level}级`,note:"",quantity:1,slotKey:fighterNode.key}
  ];
  assert.deepEqual(model.sanitizeManualFeatures({...rogue4,manualFeatures:stale}),[]);
});

test("spell effects apply minimums and additions before speed multipliers",()=>{
  const base=character({armorName:"无甲",className:"战士",abilities:{敏捷:14},activeSpellEffects:["护盾术","加速术","大步奔行"]});
  assert.equal(model.armorClass(base).value,19);
  assert.equal(model.speedValue(base).value,80);
});

test("language caps and spell contexts remain isolated by class",()=>{
  const rogue=character({className:"游荡者",species:"人类",languages:[]});
  const languages=model.languageRules(rogue);
  assert.equal(languages.automatic.has("通用语"),true);
  assert.equal(languages.automatic.has("盗贼黑话"),true);
  assert.equal(languages.totalCap,3);
  assert.equal(languages.rareCap,1);
  assert.deepEqual(model.sanitizeLanguageSelections({...rogue,className:"战士",subclass:"",languages:["龙语","精灵语","矮人语","深渊语"]}),["龙语","精灵语"]);
  const spells=[
    {id:"wizard",name:"法师之手",detail:"",note:"",quantity:1,level:0,spellRole:"戏法",spellContext:"法师",slotKey:"cantrip:1"},
    {id:"rogue",name:"法师之手",detail:"",note:"",quantity:1,level:0,spellRole:"戏法",spellContext:"游荡者",slotKey:"cantrip:1"}
  ];
  assert.deepEqual(model.currentCharacterSpells({...rogue,subclass:"诡术师",level:3,spells}).map(spell=>spell.id),["rogue"]);
});

test("bard jack of all trades grants half proficiency only to untrained skills",()=>{
  const bard=character({className:"吟游诗人",level:5});
  assert.equal(model.skillTrainingBonus(bard,0),1);
  assert.equal(model.skillTrainingBonus(bard,1),3);
  assert.equal(model.skillTrainingBonus(bard,2),6);
});

test("iPad sidebar swipe gestures ignore vertical motion and respect breakpoints",()=>{
  assert.equal(model.sidebarSwipeAction(90,12,768,null),"open-navigation");
  assert.equal(model.sidebarSwipeAction(-90,10,1024,null),"open-features");
  assert.equal(model.sidebarSwipeAction(90,10,1024,null),null);
  assert.equal(model.sidebarSwipeAction(90,100,768,null),null);
  assert.equal(model.sidebarSwipeAction(-90,8,768,"navigation"),"close-navigation");
  assert.equal(model.sidebarSwipeAction(90,8,768,"right"),"close-right");
});

test("compact metrics and spellcasting overview follow character rules",()=>{
  const alertFighter=character({className:"战士",level:5,abilities:{敏捷:16,感知:14},skillRanks:{察觉:2},background:"",manualFeatures:[{id:"alert",name:"警戒",detail:"专长",note:"",quantity:1}]});
  assert.equal(model.initiative(alertFighter),6);
  assert.equal(model.initiative({...alertFighter,exhaustionLevel:2}),2);
  assert.equal(model.passivePerception(alertFighter),18);
  const paladin=character({className:"圣武士",level:5,abilities:{魅力:18}});
  assert.equal(model.spellcastingAbility(paladin),"魅力");
});

test("wizard special spells use fixed slots and summoning data is parsed",()=>{
  const base={id:"mastery",name:"护盾术",detail:"",note:"",quantity:1,level:1,source:"玩家手册2024",spellRole:"法术精通",spellContext:"法师",slotKey:"grant:spell-mastery:1"};
  const book={...base,id:"book",spellRole:"法术书·升级",slotKey:"spellbook:class:1:1"};
  const wizard=character({className:"法师",level:18,spells:[book,base,{...base,id:"bad",slotKey:"grant:spell-mastery:9"}]});
  assert.deepEqual(model.currentCharacterSpells(wizard).map(spell=>spell.id),["mastery"]);
  const summon={Name:"测试召唤术",Source:"测试",Level:3,Classes:["法师"],Description:"召唤一个生物，使用以下数据。中型 AC 14 HP 30 速度 40尺 力量 16（+3） 敏捷 12（+1） 体质 14（+2） 智力 8（-1） 感知 10（+0） 魅力 6（-2） 动作：挥击。"};
  assert.equal(model.isSummoningSpell(summon),true);
  assert.equal(model.summonStats(summon).ac,"14");
  assert.equal(model.summonStats(summon).abilities.力量,"16（+3）");
  assert.equal(model.isSummoningSpell({...summon,Name:"测试法术",Description:"你唤来一个灵体。\n该灵体使用以下数据。"}),true);
  assert.equal(model.pricedSpellMaterial("法术成分：V、S、M（一个价值300 GP的镀金头骨）\n持续时间：专注，至多1小时"),"一个价值300 GP的镀金头骨");
});
