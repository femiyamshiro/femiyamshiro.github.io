const rawRules=(await import("virtual:juance-rules-pack")).default;

export const EXPANSIONS = ["珊娜萨的万事指南", "塔莎的万事坩埚", "魔邓肯巨献", "费兹本的巨龙宝库", "毕哥比的巨献", "万象无常书", "破解奥秘（UA）"] as const;
export const ABILITIES = ["力量", "敏捷", "体质", "智力", "感知", "魅力"] as const;
export const SKILL_ABILITY: Record<string, string> = { 运动:"力量", 杂技:"敏捷", 巧手:"敏捷", 隐匿:"敏捷", 奥秘:"智力", 历史:"智力", 调查:"智力", 自然:"智力", 宗教:"智力", 驯兽:"感知", 洞悉:"感知", 医药:"感知", 察觉:"感知", 求生:"感知", 欺瞒:"魅力", 威吓:"魅力", 表演:"魅力", 说服:"魅力" };

export type RuleFeature = { Level:number; Name:string; Description:string };
export type SpeciesRule = { Name:string; Source:string; Speed:number; Movement:string; Features:RuleFeature[]; Variants:Array<{Name:string;Speed:number;Movement:string;Features:RuleFeature[]}> };
export type BackgroundRule = { Name:string; Source:string; OriginFeat:string; OriginFeatOptions?:string[] };
export type ClassFeatureRule = { ClassName:string; Source:string; Level:number; Name:string; Description:string };
export type SubclassRule = { ClassName:string; Name:string; Source:string; Features:RuleFeature[] };
export type SpellRule = { Name:string; Source:string; Level:number; Description:string; Classes?:string[] };
export type FeatRule = { Name:string; Source:string; Category:string; Prerequisite:string; Description:string };
export type WeaponRule = { Name:string; Source:string; RequiredSpecies?:string; Category:string; Damage:string; DamageType:string; Properties:string; Mastery:string; Attribute:string; MasteryEffect:string };
export type ArmorRule = { Name:string; Source:string; RequiredSpecies?:string; BaseAc:string; Dexterity:string; Type:string; Properties:string; StrengthRequirement?:number; StealthDisadvantage?:boolean };
export type EquipmentRule = { Name:string; Source:string; Category:string; Price:string; Weight:string; Description:string };
type RulePack = { Species:SpeciesRule[]; Backgrounds:BackgroundRule[]; ClassFeatures:ClassFeatureRule[]; Subclasses:SubclassRule[]; Spells:SpellRule[]; Feats:FeatRule[]; Weapons:WeaponRule[]; Armors:ArmorRule[]; EquipmentItems:EquipmentRule[]; BaseWeapons:WeaponRule[]; BaseArmors:ArmorRule[] };
const SPELL_CLASSES=new Set(["吟游诗人","牧师","德鲁伊","游侠","圣武士","术士","魔契师","法师","奇械师","灵能使"]);
const SPELL_LEVELS:Record<string,number>={一:1,二:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
const normalizeSpellRule=(spell:SpellRule):SpellRule=>{const header=(spell.Description?.split(/[\r\n]+/).map(x=>x.trim()).filter(Boolean).slice(0,3)||[]).join(" ");const levelMatch=header.match(/([一二三四五六七八九1-9])环/);const level=header.includes("戏法")?0:levelMatch?(Number(levelMatch[1])||SPELL_LEVELS[levelMatch[1]]):spell.Level;const classText=header.match(/[（(]([^）)]+)[）)]/)?.[1]||"";const classes=spell.Classes?.length?spell.Classes:classText.split(/[、，,]/).map(x=>x.trim()).filter(x=>SPELL_CLASSES.has(x));return {...spell,Level:level,Classes:[...new Set(classes)]}};
const RAW_RULES=rawRules as RulePack;
export const RULES:RulePack={...RAW_RULES,Spells:RAW_RULES.Spells.map(normalizeSpellRule)};
export const EQUIPMENT = RULES.EquipmentItems;

export type RowEntry = { id:string; name:string; detail:string; note:string; quantity:number; price?:string; weight?:string; itemCategory?:string; enhancement?:number; attuned?:boolean; used?:boolean; masterySelected?:boolean; level?:number; source?:string; attackRoll?:string; damage?:string; damageType?:string; properties?:string; mastery?:string; spellRole?:string; slotKey?:string; spellContext?:string; showSummonPanel?:boolean };
export type CustomArmor = { id:string; name:string; category:"轻甲"|"中甲"|"重甲"; baseAc:number; dexterityRule:"全部敏捷调整值"|"最多+2"|"不计敏捷"; strengthRequirement:number; stealthDisadvantage:boolean; description:string };
export type Character = {
  id:string; createdAt:string; name:string; player:string; className:string; subclass:string; level:number; species:string; subspecies:string; background:string; backgroundOriginFeatChoice:string; alignment:string;
  hp:number; tempHp:number; inspiration:number; abilities:Record<string,number>; skillRanks:Record<string,number>; armorName:string; shieldName:string; shield:boolean; armorEnhancement:number; shieldEnhancement:number; armorAttuned:boolean; shieldAttuned:boolean; useManualAc:boolean; manualAc:number; customArmors:CustomArmor[];
  coins:{cp:number;sp:number;gp:number;pp:number}; attacks:RowEntry[]; equipment:RowEntry[]; manualFeatures:RowEntry[]; spells:RowEntry[]; notes:string; languages:string[]; allowRareLanguageSelection:boolean;
  activeSpellEffects:string[]; activeConditions:string[]; exhaustionLevel:number; additionalWeaponProficiencies:string[]; magicInitiateClass:string; alternateFightingStyle:string; divineOrder:string; primalOrder:string; resourceMarks:Record<string,number>; slotMarks:Record<string,number>; enabledSources:string[]; compactFeatureDisplay:boolean; activePage:"character"|"spells"|"notes"; updatedAt:string;
};
export type Workspace = { schemaVersion:1; activeCharacterId:string; characters:Character[] };

export const uid = () => globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export const modNumber = (score:number) => Math.floor((score-10)/2);
export const signed = (value:number) => value >= 0 ? `+${value}` : String(value);
export const CONDITION_DEFINITIONS:Record<string,string>={
  目盲:"不能视物，自动未通过任何需要视觉的属性检定。对目盲生物的攻击检定具有优势，目盲生物的攻击检定具有劣势。",魅惑:"不能攻击魅惑者，也不能对魅惑者使用伤害性能力或魔法效应。魅惑者对受术者的任何社交属性检定具有优势。",耳聋:"不能听见声音，自动未通过任何需要听觉的属性检定。",恐慌:"只要恐慌源在其视线内，其属性检定和攻击检定具有劣势，且不能自愿向恐慌源移动。",擒抱:"速度变为 0 且不能提高。除擒抱者外，对其他目标的攻击检定具有劣势。",失能:"不能执行动作、附赠动作或反应；专注立即中断；不能说话；投掷先攻时具有劣势。",隐形:"投掷先攻时具有优势。需要看见目标的效应通常不能影响你；对你的攻击具有劣势，你的攻击具有优势。",麻痹:"同时陷入失能，速度为 0。力量和敏捷豁免自动失败；5 尺内命中你的攻击自动造成重击。",石化:"同时陷入失能，速度为 0，力量和敏捷豁免自动失败；对所有伤害具有抗性，并免疫中毒状态。",中毒:"攻击检定和属性检定具有劣势。",倒地:"只能爬行或花费相当于一半速度的移动站起。你的攻击具有劣势；5 尺内的攻击者对你具有优势，否则具有劣势。",束缚:"速度变为 0，不能受益于任何速度加值。对其的攻击具有优势，其攻击和敏捷豁免具有劣势。",震慑:"同时陷入失能。力量和敏捷豁免自动失败，对你的攻击具有优势。",昏迷:"同时陷入失能和倒地，掉落手中物品，速度为 0；5 尺内命中你的攻击自动造成重击。",专注:"规则追踪项，并非人物状态。受到伤害时进行体质豁免，DC 为 10 或所受伤害的一半，取较高者，最高 DC 30；失能或死亡会立即中断专注。"
};
const INCAPACITATING_CONDITIONS=new Set(["失能","麻痹","石化","震慑","昏迷"]);
const MOVEMENT_BLOCKING_CONDITIONS=new Set(["擒抱","麻痹","石化","束缚","震慑","昏迷"]);
export const normalizeExhaustion=(level:number)=>Math.max(0,Math.min(6,Math.trunc(Number.isFinite(level)?level:0)));
export const exhaustionD20Penalty=(level:number)=>2*normalizeExhaustion(level);
export const exhaustionSpeedPenalty=(level:number)=>5*normalizeExhaustion(level);
export const concentrationSaveDifficulty=(damage:number)=>Math.min(30,Math.max(10,Math.floor(Math.max(0,damage)/2)));
export function previewHitPointExpression(c:Character,expression:string){
  const compact=(expression||"").replace(/\s+/g,"");let hp=Math.max(0,Math.min(maxHp(c),c.hp)),tempHp=Math.max(0,c.tempHp);const damages:number[]=[];
  if(!compact)return {valid:true,hp,tempHp,damages};
  if(!/^(?:[+-]\d+)+$/.test(compact))return {valid:false,hp,tempHp,damages};
  for(const token of compact.match(/[+-]\d+/g)||[]){const delta=Number(token);if(delta<0){const damage=-delta,absorbed=Math.min(tempHp,damage);damages.push(damage);tempHp-=absorbed;hp=Math.max(0,hp-(damage-absorbed))}else hp=Math.min(maxHp(c),hp+delta)}
  return {valid:true,hp,tempHp,damages};
}
export function normalizeConditions(conditions:string[]):string[]{let result:string[]=[];for(const condition of conditions||[])result=setConditionNames(result,condition,true);return result}
function setConditionNames(conditions:string[],name:string,active:boolean):string[]{const result=[...new Set((conditions||[]).filter(x=>typeof x==="string").map(x=>x.trim()).filter(Boolean))];name=(name||"").trim();if(!name)return result;if(!active)return result.filter(x=>x!==name);if(name==="专注"&&result.some(x=>INCAPACITATING_CONDITIONS.has(x)))return result;if(!result.includes(name))result.push(name);return INCAPACITATING_CONDITIONS.has(name)?result.filter(x=>x!=="专注"):result}
export function setCondition(c:Character,name:string,active:boolean):Character{return {...c,activeConditions:setConditionNames(c.activeConditions,name,active)}}
export const movementBlockingCondition=(conditions:string[])=>(conditions||[]).map(x=>x.trim()).find(x=>MOVEMENT_BLOCKING_CONDITIONS.has(x))||"";
export const proficiency = (level:number) => 2 + Math.floor((Math.max(1,Math.min(20,level))-1)/4);
export const skillTrainingBonus=(c:Character,rank:number)=>rank>=2?2*proficiency(c.level):rank===1?proficiency(c.level):c.className==="吟游诗人"&&c.level>=2?Math.floor(proficiency(c.level)/2):0;
export const initiative=(c:Character)=>modNumber(c.abilities.敏捷)+([...automaticFeatures(c).map(x=>x.name),...c.manualFeatures.map(x=>x.name)].includes("警戒")?proficiency(c.level):0)-exhaustionD20Penalty(c.exhaustionLevel);
export const passivePerception=(c:Character)=>10+modNumber(c.abilities.感知)+skillTrainingBonus(c,c.skillRanks.察觉||0);
export function skillDisadvantageSources(c:Character,skillName:string){
  const sources:string[]=[];
  const armor=armorOptions(c).find(option=>option.Name===c.armorName);
  if(skillName==="隐匿"&&armor?.StealthDisadvantage)sources.push(armor.Name);
  for(const item of c.equipment){
    const text=`${item.detail||""} ${item.note||""} ${item.properties||""}`;
    if(text.includes("劣势")&&text.includes(skillName))sources.push(item.name.trim()||"装备");
  }
  return [...new Set(sources)];
}
export const spellcastingAbility=(c:Character)=>["吟游诗人","术士","魔契师","圣武士"].includes(c.className)?"魅力":["牧师","德鲁伊","游侠"].includes(c.className)?"感知":"智力";
export const monkUnarmoredMovementBonus = (level:number) => level>=18?30:level>=14?25:level>=10?20:level>=6?15:level>=2?10:0;
export type SidebarSwipeAction="open-navigation"|"open-features"|"close-navigation"|"close-right"|null;
export function sidebarSwipeAction(dx:number,dy:number,viewportWidth:number,open:"navigation"|"right"|null):SidebarSwipeAction{
  if(Math.abs(dx)<72||Math.abs(dx)<Math.abs(dy)*1.35)return null;
  if(open==="navigation")return dx<0?"close-navigation":null;
  if(open==="right")return dx>0?"close-right":null;
  if(dx>0&&viewportWidth<=820)return "open-navigation";
  if(dx<0&&viewportWidth<=1050)return "open-features";
  return null;
}

export const CLASS_HIT_DIE:Record<string,number> = { 野蛮人:12, 战士:10, 圣武士:10, 游侠:10, 吟游诗人:8, 牧师:8, 德鲁伊:8, 武僧:8, 游荡者:8, 魔契师:8, 术士:6, 法师:6, 奇械师:8 };
export const CLASS_SAVE:Record<string,string[]> = { 野蛮人:["力量","体质"], 吟游诗人:["敏捷","魅力"], 牧师:["感知","魅力"], 德鲁伊:["智力","感知"], 战士:["力量","体质"], 武僧:["力量","敏捷"], 圣武士:["感知","魅力"], 游侠:["力量","敏捷"], 游荡者:["敏捷","智力"], 术士:["体质","魅力"], 魔契师:["感知","魅力"], 法师:["智力","感知"], 奇械师:["体质","智力"] };

export const BASE_ARMORS:ArmorRule[] = [{Name:"无甲",Source:"玩家手册2024",BaseAc:"10",Dexterity:"敏捷调整值",Type:"无甲",Properties:"基础AC 10＋敏捷调整值。"},...RULES.BaseArmors];
export const BASE_WEAPONS:WeaponRule[] = RULES.BaseWeapons;
export const MAGIC_INITIATE_LISTS=["牧师","德鲁伊","法师"] as const;
export const DIVINE_ORDERS=["保护者","奇术使"] as const;
export const PRIMAL_ORDERS=["术师","卫士"] as const;
export const alternateFightingStyleFor=(className:string)=>className==="圣武士"?"受祝福的勇士":className==="游侠"?"德鲁伊教战士":"";
export const alternateFightingStyleSpellList=(style:string)=>style==="受祝福的勇士"?"牧师":style==="德鲁伊教战士"?"德鲁伊":"";
export type GrantedCantripChoice={role:string;spellList:string;count:number};
export function grantedCantripChoices(c:Character):GrantedCantripChoice[]{
  const choices:GrantedCantripChoice[]=[];
  if(c.className==="牧师"&&c.divineOrder==="奇术使")choices.push({role:"圣职戏法",spellList:"牧师",count:1});
  if(c.className==="德鲁伊"&&c.primalOrder==="术师")choices.push({role:"原初职能戏法",spellList:"德鲁伊",count:1});
  if(c.alternateFightingStyle&&c.alternateFightingStyle===alternateFightingStyleFor(c.className))choices.push({role:"替代战斗风格",spellList:alternateFightingStyleSpellList(c.alternateFightingStyle),count:2});
  return choices;
}
export const hasMagicInitiateFeat=(c:Character)=>[...automaticFeatures(c).map(x=>x.name),...c.manualFeatures.map(x=>x.name)].includes("魔法学徒");
export function isSupplementalSpellActive(c:Character,entry:RowEntry){
  if(entry.spellRole==="魔法学徒")return hasMagicInitiateFeat(c)&&MAGIC_INITIATE_LISTS.includes(c.magicInitiateClass as typeof MAGIC_INITIATE_LISTS[number])&&entry.spellContext===c.magicInitiateClass;
  return grantedCantripChoices(c).some(choice=>choice.role===entry.spellRole&&choice.spellList===entry.spellContext);
}
export type WeaponMasteryState="none"|"notProficient"|"noMasteryFeature"|"requiresSelection"|"enabled";
export function weaponAttackResolution(c:Character,rule:WeaponRule,enhancement:number,masteryWeaponSelected=false){
  const properties=rule.Properties||"",category=rule.Category||"",name=rule.Name.trim();
  const manualMartial=c.manualFeatures.some(x=>`${x.name} ${x.note}`.includes("军用武器熟练"));
  const allMartial=["野蛮人","战士","圣武士","游侠"].includes(c.className)||(c.className==="牧师"&&c.divineOrder==="保护者")||(c.className==="德鲁伊"&&c.primalOrder==="卫士")||manualMartial;
  const additional=(c.additionalWeaponProficiencies||[]).some(x=>x.trim().toLowerCase()===name.toLowerCase());
  const proficient=additional||category.includes("天生武器")||category.includes("简易")||(category.includes("军用")&&(allMartial||c.className==="武僧"&&category.includes("近战")&&properties.includes("轻型")||c.className==="游荡者"&&(properties.includes("灵巧")||properties.includes("轻型"))));
  const attribute=rule.Attribute||"力量";const abilityModifier=attribute.includes("敏捷")&&attribute.includes("力量")?Math.max(modNumber(c.abilities.敏捷),modNumber(c.abilities.力量)):modNumber(c.abilities[attribute]??c.abilities.力量);
  const masteryFeature=RULES.ClassFeatures.some(x=>x.ClassName===c.className&&x.Level<=c.level&&allowed(x.Source,c.enabledSources)&&x.Name.includes("武器精通"))||c.manualFeatures.some(x=>x.name.includes("武器精通"));
  const masteryState:WeaponMasteryState=!rule.Mastery?"none":!proficient?"notProficient":!masteryFeature?"noMasteryFeature":!masteryWeaponSelected?"requiresSelection":"enabled";
  const enhancementBonus=Math.max(0,Math.min(9,Math.trunc(enhancement)||0));const exhaustion=exhaustionD20Penalty(c.exhaustionLevel);
  const attackBonus=abilityModifier+(proficient?proficiency(c.level):0)+enhancementBonus-exhaustion;
  const damageBonus=abilityModifier+enhancementBonus;
  const masteryText=masteryState==="notProficient"?`未熟练，${rule.Mastery}不生效`:masteryState==="noMasteryFeature"?`没有武器精通特性，${rule.Mastery}不生效`:masteryState==="requiresSelection"?`拥有武器精通特性，${rule.Mastery}仍须选择此武器种类`:masteryState==="enabled"?`${rule.Mastery}已启用`:"无精通词条";
  const tooltip=`攻击加值 ${signed(attackBonus)} = 属性 ${signed(abilityModifier)}${proficient?` ＋ 熟练 ${signed(proficiency(c.level))}`:"（未熟练，不加熟练）"}${enhancementBonus?` ＋ 强化 +${enhancementBonus}`:""}${exhaustion?` − 力竭 ${exhaustion}`:""}。${masteryText}。`;
  return {proficient,attackBonus,damageBonus,masteryState,tooltip};
}

const normalizeFeatureName=(name:string)=>({
  "时所选择的神圣誓言":"背弃誓言",
  "之后每当你获得一个法师等级时":"法术书：升级、准备与抄录",
}[name]||name);

const FULL_SLOTS:number[][] = [
  [2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]
];
const THIRD_SLOTS:number[][] = [[2],[3],[3],[3],[4,2],[4,2],[4,2],[4,3],[4,3],[4,3],[4,3,2],[4,3,2],[4,3,2],[4,3,3],[4,3,3],[4,3,3],[4,3,3,1],[4,3,3,1]];
export function spellSlots(className:string, subclass:string, level:number){
  const full=["吟游诗人","牧师","德鲁伊","术士","法师"].includes(className);
  const half=["圣武士","游侠","奇械师"].includes(className);
  const third=(className==="战士"&&subclass==="奥法骑士")||(className==="游荡者"&&subclass==="诡术师");
  if(className==="魔契师") { const ring=level<3?1:level<5?2:level<7?3:level<9?4:5; const count=level===1?1:level<11?2:level<17?3:4; const slots:Record<string,number>={[String(ring)]:count};for(let r=6;r<=9;r++)if(level>=11+(r-6)*2)slots[String(r)]=1;return slots; }
  if(third){if(level<3)return {};return Object.fromEntries((THIRD_SLOTS[Math.min(20,level)-3]||[]).map((n,i)=>[String(i+1),n]));}
  const casterLevel=full?level:half?Math.max(1,Math.ceil(level/2)):0;
  if(!casterLevel)return {};
  return Object.fromEntries((FULL_SLOTS[Math.min(20,casterLevel)-1]||[]).map((n,i)=>[String(i+1),n]));
}
export function maximumPreparedSpellLevel(className:string,subclass:string,level:number){const rings=Object.keys(spellSlots(className,subclass,level)).map(Number);const maximum=rings.length?Math.max(...rings):0;return className==="魔契师"?Math.min(5,maximum):maximum;}

export function grantedSpells(c:Character){
  const result:Array<{spell:SpellRule;feature:string;level:number;source:string}>=[];
  const spells=[...RULES.Spells].filter(x=>allowed(x.Source,c.enabledSources)).sort((a,b)=>b.Name.length-a.Name.length);
  const addFrom=(description:string,feature:string,unlock:number,source:string,derive:boolean)=>{for(const spell of spells){if(!description?.includes(spell.Name))continue;const level=derive?(spell.Level===0?unlock:["圣武士","游侠"].includes(c.className)?Math.max(unlock,4*spell.Level-3):Math.max(unlock,2*spell.Level-1)):unlock;if(level<=c.level&&!result.some(x=>x.spell.Name===spell.Name&&x.feature===feature))result.push({spell,feature,level,source})}};
  RULES.ClassFeatures.filter(x=>x.ClassName===c.className&&x.Level<=c.level&&x.Name!=="施法"&&allowed(x.Source,c.enabledSources)&&(x.Description.includes("始终准备")||x.Description.includes("总是准备"))).forEach(x=>addFrom(x.Description,x.Name,x.Level,x.Source,false));
  RULES.Subclasses.find(x=>x.ClassName===c.className&&x.Name===c.subclass&&allowed(x.Source,c.enabledSources))?.Features.filter(x=>x.Description.includes("始终准备")||x.Description.includes("一直准备")).forEach(x=>addFrom(x.Description,x.Name,x.Level,RULES.Subclasses.find(s=>s.ClassName===c.className&&s.Name===c.subclass)!.Source,true));
  return result.sort((a,b)=>a.level-b.level||a.spell.Level-b.spell.Level||a.spell.Name.localeCompare(b.spell.Name,"zh-CN"));
}

export function resourceCaps(c:Character){
  const p=proficiency(c.level); const out:Array<{key:string;label:string;max:number;unit?:string}> = [];
  const upsert=(key:string,label:string,max:number,unit?:string)=>{const current=out.find(resource=>resource.key===key);if(current){current.max=Math.max(current.max,max);current.label=label;current.unit=unit;return}out.push({key,label,max,unit})};
  if(c.species==="人类") out.push({key:"heroic",label:"英雄激励",max:1});
  if(c.species==="阿斯莫") out.push({key:"healingHands",label:"治愈之手",max:1});
  if(c.species==="矮人") out.push({key:"stonecunning",label:"石中精妙",max:p});
  if(c.className==="野蛮人") out.push({key:"rage",label:"狂暴",max:c.level<3?2:c.level<6?3:c.level<12?4:c.level<17?5:6});
  if(c.className==="吟游诗人") out.push({key:"bardic",label:`吟游激励 d${c.level<5?6:c.level<10?8:c.level<15?10:12}`,max:Math.max(1,modNumber(c.abilities.魅力))});
  if(c.className==="德鲁伊"&&c.level>=2) out.push({key:"wildShape",label:"荒野变形",max:c.level>=17?4:c.level>=6?3:2});
  if(c.className==="战士") { out.push({key:"secondWind",label:"回气",max:c.level<4?2:c.level<10?3:4}); if(c.level>=2)out.push({key:"actionSurge",label:"动作如潮",max:c.level>=17?2:1}); }
  if(c.className==="武僧"&&c.level>=2) out.push({key:"focus",label:"功力",max:c.level});
  if(c.className==="牧师"&&c.level>=2) out.push({key:"channel",label:"引导神力",max:c.level>=18?4:c.level>=6?3:2});
  if(c.className==="圣武士"&&c.level>=3) out.push({key:"channel",label:"引导神力",max:c.level>=11?3:2});
  if(c.className==="圣武士") out.push({key:"layHands",label:"圣疗池",max:c.level*5,unit:"点"});
  if(c.className==="术士"&&c.level>=2) out.push({key:"sorceryPoints",label:"术法点",max:c.level,unit:"点"});
  if(c.className==="游荡者") out.push({key:"sneak",label:`偷袭 ${Math.ceil(c.level/2)}d6`,max:1});
  const manualNames=["狂暴","吟游诗人激励","吟游激励","引导神力","圣疗","功力","武僧武功","回气","动作如潮","偷袭","施法","足智多谋","精灵血系"];
  const seen=new Set<string>();
  const inferUses=(description:string)=>{
    if(!description||(!description.includes("长休")&&!description.includes("短休")))return 0;
    if(["次数等于你的熟练加值","次数等同于你的熟练加值","次数等于熟练加值","次数等同于熟练加值"].some(text=>description.includes(text)))return p;
    for(const ability of ABILITIES)if(description.includes(`次数等于你的${ability}调整值`)||description.includes(`次数等同于你的${ability}调整值`))return Math.max(1,modNumber(c.abilities[ability]));
    const match=description.match(/(?:使用|发动|执行|施展|召唤)[^。；\n]{0,45}?(一|两|二|三|四|五|六|\d+)次/);if(match){const words:Record<string,number>={一:1,两:2,二:2,三:3,四:4,五:5,六:6};return Number(match[1])||words[match[1]]||0}
    return description.includes("一经使用")&&description.includes("无法再次使用")?1:0;
  };
  const addUnique=(rawName:string,description:string,scope:string)=>{const name=normalizeFeatureName(rawName);const seenKey=`${scope}|${name}`;if(!name||seen.has(seenKey))return;seen.add(seenKey);
    if(name==="幸运"){upsert("feat:lucky","幸运点",p);return}
    if(name==="预兆"||name==="高等预兆"){upsert("subclass:portent","预言骰",name==="高等预兆"||c.level>=14?3:2);return}
    if(name==="卓越战技"){const die=c.level>=18?12:c.level>=10?10:8;upsert("subclass:superiority",`卓越骰 d${die}`,c.level>=15?6:c.level>=7?5:4);return}
    if(name==="灵能力量"){const die=c.level>=17?12:c.level>=11?10:c.level>=5?8:6;upsert("subclass:psionic",`灵能骰 d${die}`,2*p);return}
    if(name==="治愈之光"){upsert("subclass:healing-light","治愈之光 d6",1+c.level);return}
    if(manualNames.some(manual=>name.includes(manual))||out.some(resource=>resource.label===name))return;const max=inferUses(description);if(max>0)upsert(`${scope}:${name}`,name,Math.min(30,max))};
  const species=RULES.Species.find(x=>x.Name===c.species&&allowed(x.Source,c.enabledSources));
  species?.Features.filter(x=>x.Level<=c.level).forEach(x=>addUnique(x.Name,x.Description,"species"));
  species?.Variants.find(x=>x.Name===c.subspecies)?.Features.filter(x=>x.Level<=c.level).forEach(x=>addUnique(x.Name,x.Description,"species-variant"));
  RULES.ClassFeatures.filter(x=>x.ClassName===c.className&&x.Level<=c.level&&allowed(x.Source,c.enabledSources)).forEach(x=>addUnique(x.Name,x.Description,"class"));
  RULES.Subclasses.find(x=>x.ClassName===c.className&&x.Name===c.subclass&&allowed(x.Source,c.enabledSources))?.Features.filter(x=>x.Level<=c.level).forEach(x=>addUnique(x.Name,x.Description,"subclass"));
  const background=RULES.Backgrounds.find(x=>x.Name===c.background&&allowed(x.Source,c.enabledSources));const originFeat=background?.OriginFeat||(background?.OriginFeatOptions?.includes(c.backgroundOriginFeatChoice)?c.backgroundOriginFeatChoice:"");const originRule=RULES.Feats.find(x=>x.Name===originFeat&&allowed(x.Source,c.enabledSources));if(originRule)addUnique(originRule.Name,originRule.Description,"background-feat");
  c.manualFeatures.forEach(feature=>addUnique(feature.name,feature.note||"","recorded"));
  out.push({key:"hitDice",label:`生命骰 d${CLASS_HIT_DIE[c.className]||8}`,max:c.level});
  return out;
}

const FEATURE_FALLBACKS:Record<string,Array<[string,string]>>={
  幸运:[["幸运点：优势","消耗一个幸运点，使自己的一次 D20 检定具有优势。"],["幸运点：劣势","消耗一个幸运点，使其他生物对你发动的一次攻击检定具有劣势。"]],
  酒馆斗殴者:[["强化徒手打击","徒手打击伤害可改为 1d4＋力量调整值的钝击伤害。"],["伤害重掷","徒手打击伤害骰掷出 1 时可以重掷，但必须使用新结果。"],["临时武器专家","获得临时武器熟练。"],["推离","每回合一次，徒手打击命中时可将目标推离 5 尺。"]],
  警戒:[["警戒","先攻检定加入熟练加值。"]],熟习:[["熟习","自选一项技能获得熟练或专精。"]],健壮:[["健壮","生命上限额外增加人物等级的两倍。"]]
};
export function featureBenefits(name:string,description:string){
  const matches=[...description.matchAll(/^([\p{Script=Han}]{2,12})[A-Za-z][A-Za-z '-]{1,60}[。．.]/gmu)];
  const sections=matches.map((match,index)=>({name:match[1].replace(/\s/g,"")==="临时武器熟练"?"临时武器专家":match[1].replace(/\s/g,""),description:description.slice(match.index!,matches[index+1]?.index??description.length).trim()})).filter(x=>!["属性值提升","前置条件","起源专长","通用专长","战斗风格专长","幸运点"].includes(x.name));
  return sections.length?sections:(FEATURE_FALLBACKS[name]||[[name,description]]).map(([sectionName,text])=>({name:sectionName,description:text}));
}

export function pricedSpellMaterial(text:string){
  const section=text.match(/法术成分\s*[：:]\s*([\s\S]*?)(?=\s*持续时间\s*[：:]|$)/i)?.[1]||text;
  if(!/(?:\d[\d,\s]*(?:\+)?\s*gp|\d[\d,\s]*\s*金币|金币\s*\d)/i.test(section))return "—";
  return section.match(/\bM\s*[（(]([\s\S]*)[）)]/i)?.[1]?.trim()||section.replace(/\s+/g," ").trim();
}

export function allowed(source:string, enabled:string[]){ return source==="玩家手册2024" || enabled.includes(source) || (source.includes("破誓者") && source.includes("玩家手册")); }
export function classes(enabled:string[]){ return [...new Set(RULES.ClassFeatures.filter(x=>allowed(x.Source,enabled)).map(x=>x.ClassName))].sort(); }
export type FeatAdvancementNode={key:string;level:number;source:string;label:string};
export function featAdvancementNodes(c:Character):FeatAdvancementNode[]{
  const nodes:FeatAdvancementNode[]=[];
  const add=(node:FeatAdvancementNode)=>{if(node.level>=1&&node.level<=c.level&&!nodes.some(x=>x.key===node.key))nodes.push(node)};
  const grantsOpenGeneralFeat=(description:string)=>description.includes("通用专长")&&/(自选|选择.{0,12}(一项|一个)|任意).{0,12}通用专长|通用专长.{0,12}(自选|选择)/.test(description);
  RULES.ClassFeatures.filter(x=>x.ClassName===c.className&&allowed(x.Source,c.enabledSources)).forEach(feature=>{
    const source=feature.Source||"玩家手册2024";
    if(feature.Name.includes("属性值提升")){
      const levels=[feature.Level,...[...feature.Description.matchAll(/第\s*(\d{1,2})/g)].map(match=>Number(match[1]))];
      [...new Set(levels)].forEach(level=>add({key:`class|${source}|${c.className}|${level}|asi`,level,source,label:`${level}级职业选择`}));
    }else if(feature.Level<=c.level&&grantsOpenGeneralFeat(feature.Description))add({key:`class|${source}|${c.className}|${feature.Level}|${feature.Name}`,level:feature.Level,source,label:`${feature.Level}级 · ${feature.Name}`});
  });
  const subclass=RULES.Subclasses.find(x=>x.ClassName===c.className&&x.Name===c.subclass&&allowed(x.Source,c.enabledSources));
  subclass?.Features.filter(x=>x.Level<=c.level&&grantsOpenGeneralFeat(x.Description)).forEach(feature=>add({key:`subclass|${subclass.Source||"玩家手册2024"}|${c.className}|${c.subclass}|${feature.Level}|${feature.Name}`,level:feature.Level,source:subclass.Source||"玩家手册2024",label:`${feature.Level}级子职 · ${feature.Name}`}));
  return nodes.sort((a,b)=>a.level-b.level||a.label.localeCompare(b.label,"zh-CN"));
}
export function sanitizeManualFeatures(c:Character):RowEntry[]{
  const activeFeatKeys=new Set(featAdvancementNodes(c).map(node=>node.key));
  const automaticClassEntries=new Set(RULES.ClassFeatures.filter(feature=>feature.ClassName===c.className&&feature.Level<=c.level&&allowed(feature.Source,c.enabledSources)).map(feature=>`${normalizeFeatureName(feature.Name)}\u001f${feature.ClassName} · ${feature.Level}级`));
  return c.manualFeatures.filter(row=>{
    if(row.detail.startsWith("专长选择·"))return Boolean(row.slotKey&&activeFeatKeys.has(row.slotKey));
    return !automaticClassEntries.has(`${normalizeFeatureName(row.name)}\u001f${row.detail}`);
  });
}
function permanentHpBonuses(c:Character){
  const features=[...automaticFeatures(c).map(x=>({name:x.name,description:x.description})),...c.manualFeatures.map(x=>({name:x.name,description:x.note||""}))];
  return [...new Map(features.filter(x=>x.name).map(x=>[x.name,x])).values()].reduce((sum,feature)=>{
    if(feature.name==="健壮"||feature.description.includes("当前角色等级两倍")||feature.description.includes("人物等级的两倍"))return sum+2*c.level;
    if(feature.name==="矮人刚毅"||feature.name==="龙族体魄"||feature.description.includes("此后每次升级时再加1")||feature.description.includes("每提升一个术士等级"))return sum+c.level;
    const fixed=feature.description.match(/生命值上限(?:提升|增加|加)\s*(\d+)/);return sum+(fixed?Number(fixed[1]):0);
  },0);
}
export function maxHp(c:Character){ const die=CLASS_HIT_DIE[c.className]||8; const con=modNumber(c.abilities.体质); return Math.max(1,die+con+(c.level-1)*(Math.floor(die/2)+1+con)+permanentHpBonuses(c)); }
type RestRecovery="none"|"one"|"all";
function recoveryFromDescription(description:string):RestRecovery{
  if(!description.includes("短休"))return "none";
  const clause=description.match(/短休[^。；，,]{0,30}/)?.[0]||"";
  if(/一枚|一次|一个/.test(clause))return "one";
  return /全部|全数|恢复/.test(clause)?"all":"none";
}
export function completeShortRest(c:Character):Character{
  const resourceMarks={...c.resourceMarks},slotMarks={...c.slotMarks};
  const recover=(key:string,recovery:RestRecovery)=>{if(recovery!=="none"&&resourceMarks[key]>0)resourceMarks[key]=recovery==="all"?0:resourceMarks[key]-1};
  if(c.className==="魔契师")for(const ring of Object.keys(spellSlots(c.className,c.subclass,c.level)))slotMarks[ring]=0;
  if(c.className==="野蛮人")recover("rage","one");
  if(c.className==="德鲁伊"&&c.level>=2)recover("wildShape","one");
  if((c.className==="牧师"&&c.level>=2)||(c.className==="圣武士"&&c.level>=3))recover("channel","one");
  if(c.className==="武僧"&&c.level>=2)recover("focus","all");
  if(c.className==="战士"){recover("secondWind","one");if(c.level>=2)recover("actionSurge","all")}
  if(c.className==="吟游诗人"&&c.level>=5)recover("bardic","all");
  if(c.className==="战士"&&c.subclass.includes("战斗大师"))recover("subclass:superiority","all");
  if((c.className==="战士"&&c.subclass.includes("灵能武士"))||(c.className==="游荡者"&&c.subclass.includes("魂刃")))recover("subclass:psionic","one");
  for(const resource of resourceCaps(c)){
    if(!/^(species|species-variant|class|subclass|background-feat|recorded):/.test(resource.key))continue;
    const name=resource.key.split(":").slice(1).join(":");
    const source=[...automaticFeatures(c).map(x=>({name:x.name,description:x.description})),...c.manualFeatures.map(x=>({name:x.name,description:x.note||""}))].find(x=>x.name===name);
    recover(resource.key,recoveryFromDescription(source?.description||""));
  }
  return {...c,resourceMarks,slotMarks};
}
export function completeLongRest(c:Character):Character{return {...c,hp:maxHp(c),tempHp:0,resourceMarks:{},slotMarks:{}};}
export function armorOptions(c:Character){
  const custom=(c.customArmors||[]).filter(x=>x.name.trim()).map(x=>({Name:x.name,Source:"自定义",BaseAc:String(Math.max(0,x.baseAc)),Dexterity:x.dexterityRule,Type:x.category,Properties:x.description,StrengthRequirement:Math.max(0,x.strengthRequirement),StealthDisadvantage:x.stealthDisadvantage}));
  const candidates=[...BASE_ARMORS,...RULES.Armors.filter(x=>allowed(x.Source,c.enabledSources)&&(!x.RequiredSpecies||x.RequiredSpecies===c.species)),...custom].filter(x=>x.Type!=="盾牌"&&x.Name!=="盾牌");
  return [...new Map(candidates.map(x=>[x.Name,x])).values()];
}
export function shieldOptions(c:Character){
  const candidates=[...RULES.BaseArmors,...RULES.Armors.filter(x=>allowed(x.Source,c.enabledSources)&&(!x.RequiredSpecies||x.RequiredSpecies===c.species))].filter(x=>x.Type==="盾牌"||x.Name==="盾牌");
  return [...new Map(candidates.map(x=>[x.Name,x])).values()];
}
export type SpellStatEffect={name:string;acKind:""|"mage"|"add"|"minimum";acValue:number;speedKind:""|"add"|"multiply";speedValue:number;movement?:string;note:string};
const ALL_SPELL_STAT_EFFECTS:SpellStatEffect[] = [
  {name:"法师护甲",acKind:"mage",acValue:0,speedKind:"",speedValue:0,note:"未着装护甲时，基础 AC 改为 13＋敏捷调整值。"},
  {name:"护盾术",acKind:"add",acValue:5,speedKind:"",speedValue:0,note:"持续至你的下一回合开始前。"},
  {name:"虔诚护盾",acKind:"add",acValue:2,speedKind:"",speedValue:0,note:"专注，至多 10 分钟。"},
  {name:"守护之链",acKind:"add",acValue:1,speedKind:"",speedValue:0,note:"角色作为法术目标且与施法者相距不超过 60 尺时生效。"},
  {name:"树肤术",acKind:"minimum",acValue:17,speedKind:"",speedValue:0,note:"若 AC 低于 17，则变为 17。"},
  {name:"加速术",acKind:"add",acValue:2,speedKind:"multiply",speedValue:2,note:"专注；AC +2，速度翻倍。"},
  {name:"典礼术",acKind:"add",acValue:2,speedKind:"",speedValue:0,note:"仅婚礼效应且两名目标相距不超过 30 尺时生效。"},
  {name:"塔莎超凡形态",acKind:"add",acValue:2,speedKind:"",speedValue:0,movement:"飞行 40 尺",note:"同时获得 40 尺飞行速度。"},
  {name:"大步奔行",acKind:"",acValue:0,speedKind:"add",speedValue:10,note:"目标速度增加 10 尺。"},
  {name:"西风打击",acKind:"",acValue:0,speedKind:"add",speedValue:30,note:"触发强化攻击后，步行速度增加 30 尺直到本回合结束。"},
  {name:"自然守卫",acKind:"",acValue:0,speedKind:"add",speedValue:10,note:"仅原始猛兽形态使步行速度增加 10 尺。"},
  {name:"阿莎德隆奔行",acKind:"",acValue:0,speedKind:"add",speedValue:20,note:"按三环基础效果计算；升环时每高一环再增加 5 尺。"},
  {name:"飞行术",acKind:"",acValue:0,speedKind:"",speedValue:0,movement:"飞行 60 尺（悬浮）",note:"获得 60 尺飞行速度。"},
  {name:"蛛行术",acKind:"",acValue:0,speedKind:"",speedValue:0,movement:"攀爬速度等于当前速度",note:"获得等同于当前速度的攀爬速度。"},
  {name:"变身术",acKind:"",acValue:0,speedKind:"",speedValue:0,movement:"游泳速度等于步行速度",note:"仅水生适应选项。"},
  {name:"行动自如",acKind:"",acValue:0,speedKind:"",speedValue:0,movement:"游泳速度等于当前速度",note:"同时防止魔法降低速度。"},
  {name:"龙类变形",acKind:"",acValue:0,speedKind:"",speedValue:0,movement:"飞行 60 尺",note:"仅飞翼增益。"},
  {name:"灵思形态",acKind:"",acValue:0,speedKind:"",speedValue:0,movement:"飞行 60 尺（悬浮）",note:"获得 60 尺飞行速度并可悬浮。"}
];
export const SPELL_STAT_EFFECTS=ALL_SPELL_STAT_EFFECTS.filter(effect=>RULES.Spells.some(spell=>spell.Name===effect.name));
export function armorClass(c:Character){
  if(c.useManualAc){const value=Math.max(0,Math.trunc(c.manualAc||0));return {value,detail:`手动 AC 覆盖 ${value}；自动护甲、盾牌、属性与法术 AC 效果已停用`,armor:armorOptions(c).find(x=>x.Name===c.armorName)||BASE_ARMORS[0]}}
  const dex=modNumber(c.abilities.敏捷); const armor=armorOptions(c).find(x=>x.Name===c.armorName)||BASE_ARMORS[0]; const shield=shieldOptions(c).find(x=>x.Name===c.shieldName); const hasShield=Boolean(shield)||c.shield; const parsedShield=shield?Number.parseInt(shield.BaseAc.replace(/[^\d-]/g,"")):2; const shieldBase=Number.isFinite(parsedShield)?parsedShield:2; const parsedBase=Number.parseInt(armor.BaseAc);let ac=Number.isFinite(parsedBase)?parsedBase:10; const parts=[`${armor.Name} ${ac}`];
  if(armor.Dexterity.includes("最多")){const d=Math.min(2,dex);ac+=d;parts.push(`敏捷 ${signed(d)}`)} else if(!armor.Dexterity.includes("不计")){ac+=dex;parts.push(`敏捷 ${signed(dex)}`)}
  if(c.armorName==="无甲"&&c.className==="武僧"&&!hasShield){const wis=modNumber(c.abilities.感知);ac+=wis;parts.push(`无甲防护 感知 ${signed(wis)}`)}
  if(c.armorName==="无甲"&&c.className==="野蛮人"){const con=modNumber(c.abilities.体质);ac+=con;parts.push(`无甲防护 体质 ${signed(con)}`)}
  if(c.armorName==="无甲"&&c.className==="吟游诗人"&&c.subclass.includes("舞蹈")){const cha=modNumber(c.abilities.魅力);ac+=cha;parts.push(`舞蹈学院 魅力 ${signed(cha)}`)}
  const draconicUnarmored=c.armorName==="无甲"&&c.className==="术士"&&c.subclass.includes("龙");
  if(draconicUnarmored){ac=13+dex;parts.splice(0,parts.length,"龙族韧性 13",`敏捷 ${signed(dex)}`)}
  if(c.armorName!=="无甲"){ac+=c.armorEnhancement;if(c.armorEnhancement)parts.push(`护甲强化 +${c.armorEnhancement}`)}
  if(hasShield&&!draconicUnarmored){ac+=shieldBase+c.shieldEnhancement;parts.push(`${c.shieldName||"盾牌"} +${shieldBase+c.shieldEnhancement}`)}
  const active=SPELL_STAT_EFFECTS.filter(effect=>c.activeSpellEffects.includes(effect.name));
  if(active.some(effect=>effect.acKind==="mage")&&c.armorName==="无甲"){const mage=13+dex+(hasShield?shieldBase+c.shieldEnhancement:0);if(mage>ac){ac=mage;parts.splice(0,parts.length,`法师护甲 13`,`敏捷 ${signed(dex)}`,...(hasShield?[`${c.shieldName||"盾牌"} +${shieldBase+c.shieldEnhancement}`]:[]))}}
  for(const effect of active.filter(effect=>effect.acKind==="minimum"))if(ac<effect.acValue){parts.push(`${effect.name}最低 ${effect.acValue}`);ac=effect.acValue}
  for(const effect of active.filter(effect=>effect.acKind==="add"&&effect.acValue)){ac+=effect.acValue;parts.push(`${effect.name} +${effect.acValue}`)}
  return {value:ac,detail:parts.join(" ＋ "),armor};
}
export function speedValue(c:Character){const species=RULES.Species.find(x=>x.Name===c.species);const variant=species?.Variants?.find(x=>x.Name===c.subspecies);let value=variant?.Speed||species?.Speed||30;const parts=[`${variant?.Movement||species?.Movement||`${value}尺`}`];const armor=armorOptions(c).find(x=>x.Name===c.armorName);if(c.className==="武僧"&&c.armorName==="无甲"&&!c.shield&&!c.shieldName){const bonus=monkUnarmoredMovementBonus(c.level);if(bonus){value+=bonus;parts.push(`武僧 ${c.level}级无甲移动 +${bonus}尺`)}}if(armor?.StrengthRequirement&&c.abilities.力量<armor.StrengthRequirement){value=Math.max(0,value-10);parts.push(`${armor.Name}力量不足 -10尺`)}const penalty=exhaustionSpeedPenalty(c.exhaustionLevel);if(penalty){value-=penalty;parts.push(`力竭 ${c.exhaustionLevel}级 -${penalty}尺`)}const active=SPELL_STAT_EFFECTS.filter(effect=>c.activeSpellEffects.includes(effect.name));for(const effect of active.filter(effect=>effect.speedKind==="add"&&effect.speedValue)){value+=effect.speedValue;parts.push(`${effect.name} +${effect.speedValue}尺`)}for(const effect of active.filter(effect=>effect.speedKind==="multiply"&&effect.speedValue>1)){value*=effect.speedValue;parts.push(`${effect.name} ×${effect.speedValue}`)}for(const effect of active.filter(effect=>effect.movement))parts.push(`${effect.name}：${effect.movement}`);const blocker=movementBlockingCondition(c.activeConditions);if(c.exhaustionLevel>=6||blocker){value=0;parts.push(c.exhaustionLevel>=6?"力竭 6 级：死亡，速度归零":`${blocker}状态：速度归零`)}return {value:Math.max(0,value),detail:parts.join(" · ")};}

export function automaticFeatures(c:Character){
  const result:Array<{name:string;source:string;description:string}> = [];
  const species=RULES.Species.find(x=>x.Name===c.species&&allowed(x.Source,c.enabledSources));
  species?.Features.filter(x=>x.Level<=c.level).forEach(x=>result.push({name:normalizeFeatureName(x.Name),source:`${species.Name} ${x.Level}级`,description:x.Description}));
  species?.Variants.find(x=>x.Name===c.subspecies)?.Features.filter(x=>x.Level<=c.level).forEach(x=>result.push({name:normalizeFeatureName(x.Name),source:c.subspecies,description:x.Description}));
  RULES.ClassFeatures.filter(x=>x.ClassName===c.className&&x.Level<=c.level&&allowed(x.Source,c.enabledSources)).forEach(x=>result.push({name:normalizeFeatureName(x.Name),source:`${c.className} ${x.Level}级`,description:x.Description}));
  RULES.Subclasses.find(x=>x.ClassName===c.className&&x.Name===c.subclass&&allowed(x.Source,c.enabledSources))?.Features.filter(x=>x.Level<=c.level).forEach(x=>result.push({name:normalizeFeatureName(x.Name),source:`${c.subclass} ${x.Level}级`,description:x.Description}));
  const bg=RULES.Backgrounds.find(x=>x.Name===c.background&&allowed(x.Source,c.enabledSources));const selectedFeat=bg?.OriginFeat||(bg?.OriginFeatOptions?.includes(c.backgroundOriginFeatChoice)?c.backgroundOriginFeatChoice:"");const feat=RULES.Feats.find(x=>x.Name===selectedFeat&&allowed(x.Source,c.enabledSources));if(feat)result.push({name:feat.Name,source:`${c.background} · 起源专长`,description:feat.Description});
  return result.filter((x,i,a)=>a.findIndex(y=>y.name===x.name&&y.source===x.source)===i);
}

export const defaultCharacter=():Character=>{
  const starterItem=EQUIPMENT.find(item=>item.Name==="盗贼工具");
  const starterDetail=[starterItem?.Category,starterItem?.Price,starterItem?.Weight].filter(Boolean).join(" · ");
  return {
  id:uid(),createdAt:new Date().toISOString(),name:"没头脑",player:"不高兴",className:"游荡者",subclass:"",level:3,species:"精灵",subspecies:"",background:"流浪者",backgroundOriginFeatChoice:"",alignment:"混乱善良",hp:21,tempHp:0,inspiration:0,
  abilities:{力量:8,敏捷:17,体质:14,智力:13,感知:12,魅力:10},skillRanks:{杂技:1,巧手:1,隐匿:1,调查:1,察觉:1},armorName:"皮甲",shieldName:"",shield:false,armorEnhancement:0,shieldEnhancement:0,armorAttuned:false,shieldAttuned:false,useManualAc:false,manualAc:0,customArmors:[],
  coins:{cp:0,sp:0,gp:15,pp:0},attacks:[{id:uid(),name:"刺剑",detail:"规则武器",note:"",quantity:1}],equipment:[{id:uid(),name:"盗贼工具",detail:starterDetail,note:starterItem?.Description||"",quantity:1,itemCategory:starterItem?.Category||"工具",price:starterItem?.Price||"",weight:starterItem?.Weight||""}],manualFeatures:[],spells:[],notes:"",languages:[],allowRareLanguageSelection:false,activeSpellEffects:[],activeConditions:[],exhaustionLevel:0,additionalWeaponProficiencies:[],magicInitiateClass:"",alternateFightingStyle:"",divineOrder:"",primalOrder:"",resourceMarks:{},slotMarks:{},enabledSources:[],compactFeatureDisplay:true,activePage:"character",updatedAt:new Date().toISOString()
  };
};
export const defaultWorkspace=():Workspace=>{const character=defaultCharacter();return {schemaVersion:1,activeCharacterId:character.id,characters:[character]}};

type UnknownRecord = Record<string,unknown>;
const asRecord=(value:unknown):UnknownRecord=>value!==null&&typeof value==="object"&&!Array.isArray(value)?value as UnknownRecord:{};
const pick=(record:UnknownRecord,...keys:string[])=>{for(const key of keys)if(record[key]!==undefined&&record[key]!==null)return record[key];return undefined};
const stringValue=(value:unknown,fallback="")=>typeof value==="string"?value:fallback;
const numberValue=(value:unknown,fallback=0)=>typeof value==="number"&&Number.isFinite(value)?value:fallback;
const booleanValue=(value:unknown,fallback=false)=>typeof value==="boolean"?value:fallback;
const stringList=(value:unknown)=>Array.isArray(value)?value.filter((item):item is string=>typeof item==="string"):[];
const numberRecord=(value:unknown)=>{
  const entries=Array.isArray(value)?value.map(item=>{const pair=asRecord(item);return [pick(pair,"Key"),pick(pair,"Value")]}):Object.entries(asRecord(value));
  return Object.fromEntries(entries.filter((entry):entry is [string,number]=>typeof entry[0]==="string"&&typeof entry[1]==="number"&&Number.isFinite(entry[1])));
};
const bitCount=(value:number)=>{let count=0;for(let mask=Math.max(0,Math.trunc(value));mask;mask>>>=1)count+=mask&1;return count};

function normalizeWindowsResources(value:unknown,className:string,subclass:string,level:number,species:string){
  const raw=numberRecord(value),resourceMarks:Record<string,number>={},slotMarks:Record<string,number>={};
  const classPrefix=`${className}|${subclass}|${level}|`,speciesPrefix=`species:${species}|${level}|`;
  const aliases:Record<string,string>={"heroic-inspiration":"heroic","bardic-inspiration":"bardic","wild-shape":"wildShape","second-wind":"secondWind","action-surge":"actionSurge","channel-divinity":"channel","lay-on-hands":"layHands","sorcery-points":"sorceryPoints",focus:"focus",rage:"rage","species:治愈之手":"healingHands","species:石中精妙":"stonecunning"};
  for(const [key,value] of Object.entries(raw)){
    let suffix="";
    if(key===`species:${species}|heroic-inspiration`)suffix="heroic-inspiration";
    else if(key.startsWith(classPrefix))suffix=key.slice(classPrefix.length);
    else if(key.startsWith(speciesPrefix))suffix=key.slice(speciesPrefix.length);
    else continue;
    const slot=suffix.match(/^slot:(\d+)$/);if(slot){slotMarks[slot[1]]=bitCount(value);continue}
    const target=aliases[suffix]||suffix;if(target)resourceMarks[target]=suffix==="lay-on-hands"?Math.max(0,value):bitCount(value);
  }
  return {resourceMarks,slotMarks};
}

const FULL_PREPARED=[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];
const SORCERER_PREPARED=[2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];
const WIZARD_PREPARED=[4,5,6,7,9,10,11,12,14,15,16,16,17,18,19,21,22,23,24,25];
const HALF_PREPARED=[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15];
const PACT_PREPARED=[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15];
const THIRD_PREPARED=[0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13];
const cantripSteps=(level:number,start:number,at4:number,at10:number)=>level>=10?at10:level>=4?at4:start;
export function spellSelectionLimits(className:string,subclass:string,level:number,abilities:Record<string,number>){
  const index=Math.max(1,Math.min(20,level))-1;
  if(className==="吟游诗人")return {cantrips:cantripSteps(level,2,3,4),prepared:FULL_PREPARED[index]};
  if(className==="牧师")return {cantrips:cantripSteps(level,3,4,5),prepared:FULL_PREPARED[index]};
  if(className==="德鲁伊")return {cantrips:cantripSteps(level,2,3,4),prepared:FULL_PREPARED[index]};
  if(className==="术士")return {cantrips:cantripSteps(level,4,5,6),prepared:SORCERER_PREPARED[index]};
  if(className==="法师")return {cantrips:cantripSteps(level,3,4,5),prepared:WIZARD_PREPARED[index]};
  if(className==="圣武士")return {cantrips:0,prepared:HALF_PREPARED[index]};
  if(className==="游侠")return {cantrips:cantripSteps(level,2,3,4),prepared:HALF_PREPARED[index]};
  if(className==="魔契师")return {cantrips:cantripSteps(level,2,3,4),prepared:PACT_PREPARED[index]};
  if((className==="战士"&&subclass==="奥法骑士")||(className==="游荡者"&&subclass==="诡术师"))return {cantrips:level<3?0:className==="游荡者"?(level>=10?4:3):(level>=10?3:2),prepared:THIRD_PREPARED[index]};
  if(className==="奇械师")return {cantrips:level>=14?4:level>=10?3:2,prepared:Math.max(1,Math.floor((level+1)/2)+modNumber(abilities.智力))};
  return null;
}

export function spellListClass(className:string,subclass:string,spellLevel:number){
  if((className==="战士"&&subclass==="奥法骑士")||(className==="游荡者"&&subclass==="诡术师"))return "法师";
  if(className==="游侠"&&spellLevel===0)return "德鲁伊";
  return className;
}

const WIZARD_SCHOOLS=["防护","咒法","预言","惑控","塑能","幻术","死灵","变化"] as const;
export type WizardSpellbookSlot={key:string;label:string;gainedAtLevel:number;minimumSpellLevel:number;maximumSpellLevel:number;kind:"initial"|"level"|"subclass-initial"|"subclass-ring";school?:string;source:string};
export function wizardMaximumSpellLevel(level:number){return Math.max(1,Math.min(9,Math.floor((Math.max(1,Math.min(20,level))+1)/2)))}
export function spellSchool(spell:SpellRule|undefined|null){if(!spell)return "";const firstLine=(spell.Description||"").split(/[\r\n]+/).map(line=>line.trim()).find(Boolean)||"";return WIZARD_SCHOOLS.find(school=>firstLine.includes(school))||""}
export function wizardSavantSchool(c:Character){
  if(c.className!=="法师"||c.level<3)return "";
  const subclass=RULES.Subclasses.find(rule=>rule.ClassName==="法师"&&rule.Name===c.subclass&&allowed(rule.Source,c.enabledSources));
  const text=subclass?.Features.filter(feature=>feature.Level<=c.level&&feature.Description.includes("免费加入你的法术书")).map(feature=>feature.Description).join("\n")||"";
  return text.match(/选择两道不高于二环的(防护|咒法|预言|惑控|塑能|幻术|死灵|变化)学派法术/)?.[1]||"";
}
export function wizardSpellbookSlots(c:Character):WizardSpellbookSlot[]{
  if(c.className!=="法师")return [];
  const level=Math.max(1,Math.min(20,c.level)),slots:WizardSpellbookSlot[]=[];
  for(let index=1;index<=6;index++)slots.push({key:`spellbook:class:1:${index}`,label:`1级初始法术 ${index}`,gainedAtLevel:1,minimumSpellLevel:1,maximumSpellLevel:1,kind:"initial",source:"法师职业特性：法术书"});
  for(let gained=2;gained<=level;gained++)for(let index=1;index<=2;index++)slots.push({key:`spellbook:class:${gained}:${index}`,label:`${gained}级研究法术 ${index}`,gainedAtLevel:gained,minimumSpellLevel:1,maximumSpellLevel:wizardMaximumSpellLevel(gained),kind:"level",source:"法师职业特性：法术书"});
  const school=wizardSavantSchool(c);
  if(school){
    const prefix=`spellbook:subclass:${c.subclass}`;const subclass=RULES.Subclasses.find(rule=>rule.ClassName==="法师"&&rule.Name===c.subclass);
    for(let index=1;index<=2;index++)slots.push({key:`${prefix}:3:${index}`,label:`${c.subclass} · ${school}学派入门 ${index}`,gainedAtLevel:3,minimumSpellLevel:1,maximumSpellLevel:2,kind:"subclass-initial",school,source:subclass?.Source||"玩家手册2024"});
    for(let ring=3;ring<=9;ring++){const gained=ring*2-1;if(gained<=level)slots.push({key:`${prefix}:${gained}:1`,label:`${c.subclass} · 新增${ring}环${school}法术`,gainedAtLevel:gained,minimumSpellLevel:ring,maximumSpellLevel:ring,kind:"subclass-ring",school,source:subclass?.Source||"玩家手册2024"})}
  }
  return slots;
}
export function wizardSpellbookEntries(c:Character){
  if(c.className!=="法师")return [];
  const slots=new Map(wizardSpellbookSlots(c).map(slot=>[slot.key,slot]));
  return c.spells.filter(entry=>{
    if(entry.spellContext!=="法师"||!entry.name||!entry.spellRole?.startsWith("法术书"))return false;
    if(entry.spellRole==="法术书·抄录")return true;
    const slot=slots.get(entry.slotKey||"");if(!slot)return false;
    const spell=RULES.Spells.find(rule=>rule.Name===entry.name&&rule.Source===entry.source&&rule.Classes?.includes("法师"));
    return Boolean(spell&&spell.Level>=slot.minimumSpellLevel&&spell.Level<=slot.maximumSpellLevel&&(!slot.school||spellSchool(spell)===slot.school));
  });
}
export function wizardSpellbookSpells(c:Character){return wizardSpellbookEntries(c).map(entry=>RULES.Spells.find(spell=>spell.Name===entry.name&&spell.Source===entry.source&&spell.Classes?.includes("法师"))).filter((spell):spell is SpellRule=>Boolean(spell)).filter((spell,index,list)=>list.findIndex(candidate=>candidate.Name===spell.Name&&candidate.Source===spell.Source)===index)}
export function wizardSpellbookContains(c:Character,name:string,source?:string){return wizardSpellbookEntries(c).some(entry=>entry.name===name&&(!source||entry.source===source))}

export function currentCharacterSpells(c:Character){
  const limits=spellSelectionLimits(c.className,c.subclass,c.level,c.abilities);
  return c.spells.filter(entry=>{
    if(entry.spellRole==="装备授予法术"||!entry.spellRole)return true;
    if(["魔法学徒","圣职戏法","原初职能戏法","替代战斗风格"].includes(entry.spellRole))return isSupplementalSpellActive(c,entry);
    if(entry.spellContext!==c.className||!limits)return false;
    const index=Number(entry.slotKey?.split(":").at(-1))||0;
    if(entry.spellRole==="戏法")return index>=1&&index<=limits.cantrips;
    if(entry.spellRole==="手动准备")return index>=1&&index<=limits.prepared&&(c.className!=="法师"||wizardSpellbookContains(c,entry.name));
    if(entry.spellRole==="法术精通")return c.className==="法师"&&c.level>=18&&["grant:spell-mastery:1","grant:spell-mastery:2"].includes(entry.slotKey||"")&&entry.level===Number(entry.slotKey?.at(-1))&&wizardSpellbookContains(c,entry.name);
    if(entry.spellRole==="招牌法术")return c.className==="法师"&&c.level>=20&&["grant:signature:1","grant:signature:2"].includes(entry.slotKey||"")&&entry.level===3&&wizardSpellbookContains(c,entry.name);
    return false;
  });
}

export function isSummoningSpell(spell:SpellRule|undefined|null){
  if(!spell)return false;
  return /召唤术$/.test(spell.Name)||["寻获坐骑","隐形仆役","忠诚猎犬","巨虫术"].some(name=>spell.Name.includes(name))||/(?:召唤|唤来|唤出)[\s\S]{0,120}(?:使用下文|使用以下)[\s\S]{0,60}数据/.test(spell.Description||"");
}

export function summonStats(spell:SpellRule){
  const description=(spell.Description||"").replace(/\s+/g," ").trim();
  const value=(pattern:RegExp,fallback="—")=>description.match(pattern)?.[1]?.replace(/\s+/g," ").trim()||fallback;
  return {
    ac:value(/(?:^|\s)AC\s*[:：]?\s*(.{1,45}?)(?=\s+(?:HP|生命值|速度|调整|力量))/i),
    hp:value(/(?:HP|生命值)\s*[:：]?\s*(.{1,65}?)(?=\s+(?:速度|调整|力量))/i),
    speed:value(/速度\s*[:：]?\s*(.{1,75}?)(?=\s+(?:调整|力量|伤害|抗性|免疫|感官|语言|CR|动作|特性))/i),
    abilities:Object.fromEntries(ABILITIES.map(ability=>[ability,value(new RegExp(`${ability}\\s*(\\d+(?:\\s*[（(][+\\-]?\\d+[）)])?)`))])),
    rules:description.match(/(?:微型|小型|中型|大型|巨型|超巨型)[\s\S]{0,80}(?:AC|护甲等级)/)?.index!=null?description.slice(Math.max(0,description.search(/(?:微型|小型|中型|大型|巨型|超巨型)[\s\S]{0,80}(?:AC|护甲等级)/)-50)):description
  };
}

export const STANDARD_LANGUAGES=["通用语","通用手语","龙语","矮人语","精灵语","巨人语","侏儒语","地精语","半身人语","兽人语"];
export const RARE_LANGUAGES=["深渊语","天界语","深潜语","德鲁伊语","炼狱语","原初语","木族语","盗贼黑话","地底通用语"];
export function languageRules(c:Character){
  const automatic=new Map<string,string>([["通用语","角色基础"]]);
  if(c.className==="德鲁伊")automatic.set("德鲁伊语","德鲁伊职业特性");
  if(c.className==="游荡者")automatic.set("盗贼黑话","游荡者职业特性");
  const species=RULES.Species.find(x=>x.Name===c.species&&allowed(x.Source,c.enabledSources));
  const texts:string[]=[];
  if(species){texts.push(...species.Features.filter(x=>x.Level<=c.level).map(x=>`${x.Name} ${x.Description}`));const variant=species.Variants.find(x=>x.Name===c.subspecies);if(variant)texts.push(...variant.Features.filter(x=>x.Level<=c.level).map(x=>`${x.Name} ${x.Description}`));if(species.Source==="费兹本的巨龙宝库"&&["宝石龙裔","金属龙裔","色彩龙裔"].includes(species.Name))automatic.set("龙语",`${species.Source} · ${species.Name}`)}
  texts.push(...RULES.ClassFeatures.filter(x=>x.ClassName===c.className&&x.Level<=c.level&&allowed(x.Source,c.enabledSources)).map(x=>`${x.Name} ${x.Description}`));
  const subclass=RULES.Subclasses.find(x=>x.ClassName===c.className&&x.Name===c.subclass&&allowed(x.Source,c.enabledSources));if(subclass)texts.push(...subclass.Features.filter(x=>x.Level<=c.level).map(x=>`${x.Name} ${x.Description}`));
  for(const text of texts)for(const language of [...STANDARD_LANGUAGES,...RARE_LANGUAGES])if(language!=="通用语"&&/(习得|学会|掌握)/.test(text)&&text.includes(language))automatic.set(language,"种族／职业特性");
  let extra=species?.Source==="魔邓肯巨献"?1:0;for(const text of texts){if(/(?:两门|两种|2\s*门).*语言/.test(text))extra+=2;else if(/(?:另一门|另一种|一种自选|一项自选|一门|一项).*语言/.test(text))extra+=1}extra=Math.min(4,extra);
  const selected=[...new Set(c.languages)].filter(language=>(STANDARD_LANGUAGES.includes(language)||RARE_LANGUAGES.includes(language))&&!automatic.has(language));
  return {automatic,selected,standardCap:2,totalCap:2+extra,rareCap:extra,rareSelected:selected.filter(x=>RARE_LANGUAGES.includes(x)).length};
}
export function sanitizeLanguageSelections(c:Character){const rules=languageRules(c),result:string[]=[];let rare=0;for(const language of rules.selected){const isRare=RARE_LANGUAGES.includes(language);if(result.length>=rules.totalCap||isRare&&rare>=rules.rareCap)continue;result.push(language);if(isRare)rare++}return result;}

function normalizeWindowsSpells(value:unknown,className:string,subclass:string,level:number,abilities:Record<string,number>){
  if(!Array.isArray(value))return [];
  const limits=spellSelectionLimits(className,subclass,level,abilities);
  return value.map(normalizeEntry).filter(entry=>{
    if(!entry.name)return false;
    const role=entry.spellRole||"";if(role==="装备授予法术")return true;if(!role)return true;
    if(["魔法学徒","圣职戏法","原初职能戏法","替代战斗风格"].includes(role))return true;
    if(entry.spellContext!==className||!limits)return false;
    const index=Number(entry.slotKey?.split(":").at(-1))||0;
    if(role.startsWith("法术书"))return className==="法师";
    if(role==="戏法")return index>=1&&index<=limits.cantrips;
    if(role==="手动准备")return index>=1&&index<=limits.prepared;
    if(role==="法术精通")return className==="法师"&&level>=18;
    if(role==="招牌法术")return className==="法师"&&level>=20;
    return false;
  });
}

function normalizeEntry(value:unknown):RowEntry{
  const entry=asRecord(value);
  const name=stringValue(pick(entry,"name","Name"));
  const detail=stringValue(pick(entry,"detail","Detail"));
  const source=stringValue(pick(entry,"source","Source"))||RULES.Spells.find(spell=>spell.Name===name&&detail.includes(spell.Source))?.Source||RULES.Spells.find(spell=>spell.Name===name)?.Source;
  return {
    id:stringValue(pick(entry,"id","Id"))||uid(),name,detail,note:stringValue(pick(entry,"note","Note")),quantity:numberValue(pick(entry,"quantity","Quantity"),1),
    price:stringValue(pick(entry,"price","Price"))||undefined,weight:stringValue(pick(entry,"weight","Weight"))||undefined,itemCategory:stringValue(pick(entry,"itemCategory","ItemCategory"))||undefined,
    enhancement:numberValue(pick(entry,"enhancement","Enhancement")),attuned:booleanValue(pick(entry,"attuned","Attuned")),used:booleanValue(pick(entry,"used","Used")),masterySelected:booleanValue(pick(entry,"masterySelected","MasterySelected")),level:numberValue(pick(entry,"level","Level")),source,
    attackRoll:stringValue(pick(entry,"attackRoll","AttackRoll"))||undefined,damage:stringValue(pick(entry,"damage","Damage"))||undefined,damageType:stringValue(pick(entry,"damageType","DamageType"))||undefined,
    properties:stringValue(pick(entry,"properties","Properties"))||undefined,mastery:stringValue(pick(entry,"mastery","Mastery"))||undefined,spellRole:stringValue(pick(entry,"spellRole","SpellRole"))||undefined,
    slotKey:stringValue(pick(entry,"slotKey","SlotKey"))||undefined,spellContext:stringValue(pick(entry,"spellContext","SpellContext"))||undefined,showSummonPanel:booleanValue(pick(entry,"showSummonPanel","ShowSummonPanel"))
  };
}
function normalizeCustomArmor(value:unknown):CustomArmor{
  const raw=asRecord(value);const category=stringValue(pick(raw,"category","Category"));const dexterityRule=stringValue(pick(raw,"dexterityRule","DexterityRule"));
  return {id:stringValue(pick(raw,"id","Id"))||uid(),name:stringValue(pick(raw,"name","Name")).trim()||"自定义护甲",category:category==="中甲"||category==="重甲"?category:"轻甲",baseAc:Math.max(0,numberValue(pick(raw,"baseAc","BaseAc"),11)),dexterityRule:dexterityRule==="最多+2"||dexterityRule==="不计敏捷"?dexterityRule:"全部敏捷调整值",strengthRequirement:Math.max(0,numberValue(pick(raw,"strengthRequirement","StrengthRequirement"))),stealthDisadvantage:booleanValue(pick(raw,"stealthDisadvantage","StealthDisadvantage")),description:stringValue(pick(raw,"description","Description"))};
}

const pageValue=(value:unknown):Character["activePage"]=>value==="spells"||value==="法术相关"?"spells":value==="notes"||value==="故事和笔记"?"notes":"character";

function normalizeCharacter(value:unknown,windows=false):Character{
  const raw=asRecord(value);const base=defaultCharacter();
  const rawAttacks=pick(raw,"attacks","Attacks");const rawEquipment=pick(raw,"equipment","Equipment");const rawSpells=pick(raw,"spells","Spells");
  const webFeatures=pick(raw,"manualFeatures");const windowsFeatures=pick(raw,"Features");
  const manualFeatureValues=Array.isArray(webFeatures)?webFeatures:Array.isArray(windowsFeatures)?windowsFeatures.filter(feature=>!stringValue(pick(asRecord(feature),"detail","Detail")).startsWith("自动·")):[];
  const webCoins=asRecord(pick(raw,"coins"));const shieldName=stringValue(pick(raw,"shieldName","ShieldName"));
  const abilities={...base.abilities,...numberRecord(pick(raw,"abilities","Abilities"))};
  const windowsResources=normalizeWindowsResources(pick(raw,"ResourceMarks"),stringValue(pick(raw,"ClassName"),base.className),stringValue(pick(raw,"Subclass")),numberValue(pick(raw,"Level"),base.level),stringValue(pick(raw,"Species"),base.species));
  const normalized:Character={
    ...base,
    id:stringValue(pick(raw,"id","Id"))||uid(),createdAt:stringValue(pick(raw,"createdAt","CreatedAt"))||base.createdAt,
    name:stringValue(pick(raw,"name","Name"),base.name),player:stringValue(pick(raw,"player","Player"),base.player),className:stringValue(pick(raw,"className","ClassName"),base.className),subclass:stringValue(pick(raw,"subclass","Subclass")),
    level:numberValue(pick(raw,"level","Level"),base.level),species:stringValue(pick(raw,"species","Species"),base.species),subspecies:stringValue(pick(raw,"subspecies","Subspecies")),background:stringValue(pick(raw,"background","Background"),base.background),
    backgroundOriginFeatChoice:stringValue(pick(raw,"backgroundOriginFeatChoice","BackgroundOriginFeatChoice")),alignment:stringValue(pick(raw,"alignment","Alignment"),base.alignment),
    hp:numberValue(pick(raw,"hp","Hp"),base.hp),tempHp:numberValue(pick(raw,"tempHp","TempHp")),inspiration:numberValue(pick(raw,"inspiration","Inspiration")),
    abilities,skillRanks:numberRecord(pick(raw,"skillRanks","SkillRanks")),
    armorName:stringValue(pick(raw,"armorName","ArmorName"),base.armorName),shieldName,shield:typeof pick(raw,"shield","Shield")==="boolean"?booleanValue(pick(raw,"shield","Shield")):Boolean(shieldName),
    armorEnhancement:numberValue(pick(raw,"armorEnhancement","ArmorEnhancement")),shieldEnhancement:numberValue(pick(raw,"shieldEnhancement","ShieldEnhancement")),armorAttuned:booleanValue(pick(raw,"armorAttuned","ArmorAttuned")),shieldAttuned:booleanValue(pick(raw,"shieldAttuned","ShieldAttuned")),useManualAc:booleanValue(pick(raw,"useManualAc","UseManualAc")),manualAc:Math.max(0,numberValue(pick(raw,"manualAc","ManualAc"),0)),customArmors:Array.isArray(pick(raw,"customArmors","CustomArmors"))?(pick(raw,"customArmors","CustomArmors") as unknown[]).map(normalizeCustomArmor):[],
    coins:{cp:numberValue(pick(webCoins,"cp")??pick(raw,"CopperCoins")),sp:numberValue(pick(webCoins,"sp")??pick(raw,"SilverCoins")),gp:numberValue(pick(webCoins,"gp")??pick(raw,"GoldCoins")),pp:numberValue(pick(webCoins,"pp")??pick(raw,"PlatinumCoins"))},
    attacks:Array.isArray(rawAttacks)?rawAttacks.map(normalizeEntry):[],equipment:Array.isArray(rawEquipment)?rawEquipment.map(normalizeEntry):[],manualFeatures:manualFeatureValues.map(normalizeEntry),spells:windows?normalizeWindowsSpells(rawSpells,stringValue(pick(raw,"ClassName"),base.className),stringValue(pick(raw,"Subclass")),numberValue(pick(raw,"Level"),base.level),abilities):Array.isArray(rawSpells)?rawSpells.map(normalizeEntry):[],
    notes:stringValue(pick(raw,"notes","Notes")),languages:stringList(pick(raw,"languages","SelectedLanguages")),allowRareLanguageSelection:booleanValue(pick(raw,"allowRareLanguageSelection","AllowRareLanguageSelection")),
    activeSpellEffects:stringList(pick(raw,"activeSpellEffects","ActiveSpellEffects")),activeConditions:normalizeConditions(stringList(pick(raw,"activeConditions","ActiveConditions"))),exhaustionLevel:normalizeExhaustion(numberValue(pick(raw,"exhaustionLevel","ExhaustionLevel"))),additionalWeaponProficiencies:[...new Map(stringList(pick(raw,"additionalWeaponProficiencies","AdditionalWeaponProficiencies")).map(x=>x.trim()).filter(Boolean).map(x=>[x.toLowerCase(),x])).values()],magicInitiateClass:MAGIC_INITIATE_LISTS.includes(stringValue(pick(raw,"magicInitiateClass","MagicInitiateClass")) as typeof MAGIC_INITIATE_LISTS[number])?stringValue(pick(raw,"magicInitiateClass","MagicInitiateClass")):"",alternateFightingStyle:alternateFightingStyleSpellList(stringValue(pick(raw,"alternateFightingStyle","AlternateFightingStyle")))?stringValue(pick(raw,"alternateFightingStyle","AlternateFightingStyle")):"",divineOrder:DIVINE_ORDERS.includes(stringValue(pick(raw,"divineOrder","DivineOrder")) as typeof DIVINE_ORDERS[number])?stringValue(pick(raw,"divineOrder","DivineOrder")):"",primalOrder:PRIMAL_ORDERS.includes(stringValue(pick(raw,"primalOrder","PrimalOrder")) as typeof PRIMAL_ORDERS[number])?stringValue(pick(raw,"primalOrder","PrimalOrder")):"",resourceMarks:windows?windowsResources.resourceMarks:numberRecord(pick(raw,"resourceMarks")),slotMarks:windows?windowsResources.slotMarks:numberRecord(pick(raw,"slotMarks")),enabledSources:stringList(pick(raw,"enabledSources","EnabledSources")),compactFeatureDisplay:booleanValue(pick(raw,"compactFeatureDisplay","CompactFeatureDisplay"),base.compactFeatureDisplay),
    activePage:pageValue(pick(raw,"activePage","ActivePage")),updatedAt:stringValue(pick(raw,"updatedAt","UpdatedAt"))||new Date().toISOString()
  };
  if(!armorOptions(normalized).some(armor=>armor.Name===normalized.armorName)){normalized.armorName="无甲";normalized.armorEnhancement=0;normalized.armorAttuned=false}
  if(normalized.shieldName&&!shieldOptions(normalized).some(shield=>shield.Name===normalized.shieldName)){normalized.shieldName="";normalized.shieldEnhancement=0;normalized.shieldAttuned=false}
  if(normalized.shield&&!normalized.shieldName)normalized.shieldName=shieldOptions(normalized)[0]?.Name||"";
  normalized.shield=Boolean(normalized.shieldName);
  normalized.armorEnhancement=Math.max(0,Math.min(9,normalized.armorEnhancement));normalized.shieldEnhancement=Math.max(0,Math.min(9,normalized.shieldEnhancement));
  if(normalized.armorName==="无甲"){normalized.armorEnhancement=0;normalized.armorAttuned=false}if(!normalized.shield){normalized.shieldEnhancement=0;normalized.shieldAttuned=false}
  normalized.manualFeatures=sanitizeManualFeatures(normalized);normalized.languages=sanitizeLanguageSelections(normalized);normalized.hp=Math.max(0,Math.min(normalized.hp,maxHp(normalized)));normalized.tempHp=Math.max(0,normalized.tempHp);return normalized;
}

export function normalizeWorkspace(input:unknown):Workspace{
  const envelope=asRecord(input),nested=pick(envelope,"workspace");if(nested!==undefined&&pick(envelope,"formatVersion")!==1)throw new Error("不支持的卷册文件版本");const raw=asRecord(nested??input);
  const webList=pick(raw,"characters"),windowsList=pick(raw,"Characters");const list=Array.isArray(webList)?webList:Array.isArray(windowsList)?windowsList:null;
  if(!list?.length)throw new Error("当前格式必须包含至少一张人物卡");
  if(Array.isArray(webList)&&pick(raw,"schemaVersion")!==1)throw new Error("不支持的人物工作区版本");
  const characters=list.map(character=>normalizeCharacter(character,Array.isArray(windowsList)));
  const activeIndex=Math.max(0,Math.min(numberValue(pick(raw,"ActiveIndex")),characters.length-1));
  const requestedId=stringValue(pick(raw,"activeCharacterId"));
  const activeCharacterId=characters.some(character=>character.id===requestedId)?requestedId:characters[activeIndex].id;
  return {schemaVersion:1,activeCharacterId,characters};
}
