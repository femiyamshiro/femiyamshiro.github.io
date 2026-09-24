import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("iPad build exposes the finished product shell", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(new Request("http://localhost/", {headers:{accept:"text/html"}}), {ASSETS:{fetch:async()=>new Response("Not found",{status:404})}}, {waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /卷册工坊/);
  assert.match(html, /iPad 人物卡/);
  assert.match(html, /正在展开卷册/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("touch, product and offline assets are configured", async () => {
  const [css, ipadCss, manifest, sw, page] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/ipad-v2.css", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(css, /touch-action:manipulation/);
  assert.match(css, /env\(safe-area-inset/);
  assert.match(css, /overscroll-behavior:contain/);
  assert.equal(JSON.parse(manifest).display, "standalone");
  assert.match(sw, /const CACHE = "juance-ipad-v21"/);
  assert.match(sw, /url\.pathname\.startsWith\("\/_next\/static\/"\)/);
  assert.match(sw, /precacheApplication/);
  assert.match(page, /navigator\.serviceWorker/);
  assert.match(page, /normalizeWorkspace/);
  assert.match(page, /iPad 完整测试版/);
  assert.match(page, /人物相关/);
  assert.match(page, /法术相关/);
  assert.match(page, /故事和笔记/);
  assert.match(page, /CombatInline/);
  assert.match(page, /completeShortRest/);
  assert.match(page, /completeLongRest/);
  assert.match(page, /短休并恢复当前职业符合规则的短休资源/);
  assert.match(page, /长休并恢复当前人物的生命值、法术位与长休资源/);
  assert.match(page, /力竭及魔法学徒免费施法使用标记不自动改变/);
  assert.match(page, /previewHitPointExpression/);
  assert.match(page, /enterKeyHint="done" type="text" pattern="\[0-9\]\*"/);
  assert.match(page, /selectOnPointerUp/);
  assert.match(page, /spell-chips/);
  assert.doesNotMatch(page, /CombatDrawer|floating-combat/);
  assert.match(page, /const items=EQUIPMENT\.filter/);
  assert.match(page, /const item=items\.find/);
  assert.match(page, /最终攻击与伤害按 Windows 手动录入逻辑保存/);
  assert.match(page, /打印当前人物完整快照/);
  assert.match(page, /全部已启用来源/);
  assert.match(page, /规则库外法术/);
  assert.match(page, /onTouchStart=\{beginSidebarSwipe\}/);
  assert.match(page, /向右横滑打开人物导航/);
  assert.match(css, /pointer:coarse/);
  assert.match(css, /-webkit-backdrop-filter/);
  assert.match(css, /@media print/);
  assert.match(page, /itemCategory:item\.Category/);
  assert.match(page, /weight:item\.Weight/);
  assert.match(css, /manual-weapon-fields/);
  assert.match(css, /row-main\.item/);
  assert.match(page, /职业、子职、种族与背景能力随等级自动加入/);
  assert.match(page, /backgroundOriginFeatChoice/);
  assert.match(page, /skillDisadvantageSources/);
  assert.match(page, /劣势来源：/);
  assert.match(page, /额外录入能力/);
  assert.match(page, /featAdvancementNodes/);
  assert.match(page, /WizardSpellbookPanel/);
  assert.match(page, /法师法术书/);
  assert.match(page, /从法术书准备/);
  assert.match(page, /先收入法术书/);
  assert.match(ipadCss, /\.wizard-spellbook/);
  assert.doesNotMatch(page, /选择职业能力|录入所选职业能力|从规则库录入能力/);
  assert.ok(page.indexOf('title="武器与攻击"') < page.indexOf("<CombatInline"), "武器与攻击应位于生命管理之前");
  assert.ok(page.indexOf('title="装备、钱币与道具"') < page.indexOf("<CombatInline"), "装备与工具应位于生命管理之前");
  assert.doesNotMatch(page, /setC\(\{\.\.\.c,hp:Math\.max\(0,c\.hp-1\)/);
});
