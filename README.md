# 卷册工坊 Web/PWA 源码

此分支保存 iPad/移动浏览器版的 Web 源码；同一仓库的 `main` 分支保存 GitHub Pages 已构建的网站文件。源码分支不会直接改变线上网站。

## 本地构建

需要 Node.js 22.13 或更新版本、pnpm。

```sh
pnpm install --frozen-lockfile
pnpm pages:build
```

静态网站输出在 `dist-pages/`。`pnpm test` 运行应用构建和模型、页面壳测试；`pnpm typecheck` 与 `pnpm lint` 做额外检查。

`native/Data/rules.pack.json.gz` 是 Web 构建时读取的唯一规则包源数据（与当前网站打包使用的内容相同）。这里未包含 Windows WPF 程序源码；不要把该目录视作可构建的 Windows 项目。

## 数据说明

人物卡保存在访问者自己的浏览器本地存储。换设备或清除浏览器数据前，请先在应用内导出人物卡文件。此源码分支不包含任何用户存档。
