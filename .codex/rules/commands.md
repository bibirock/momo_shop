<!-- 所屬 skill（Codex 無自動 scope，僅供參考）: spex-plan, spex-task, spex-implement, spex-selfcheck -->


# Commands 規則

> 本檔是可編輯的**專案規則**，由 spex 安裝。spex 系列 skill 引用「驗證指令」時以本檔為唯一來源；請依專案的 `package.json` scripts 調整。
> 本檔以 frontmatter 的 `skills:` 宣告**所屬的 skill**，由 spex 安裝時依各工具 scope：Claude Code 把 `skills:` 轉成 `.codex/rules/` 的 `paths:`（指向各 skill 的 `SKILL.md`）、Copilot 轉成 `.github/instructions/` 的 `applyTo:`（指向各 skill 的 `.prompt.md`）、Codex 以 HTML 註解標示（無自動 scope，由 skill 執行時讀取）。如此本規則只在這些 skill 的脈絡相關，不污染使用者的無關工作。調整所屬 skill 只要改本清單。

```bash
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run lint
/Users/chenzhiwen/Desktop/momo_shop/node_modules/.bin/tsc -p /Users/chenzhiwen/Desktop/momo_shop/tsconfig.json --noEmit --incremental false
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run build
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e
```

**Repo 根目錄絕對路徑：** `/Users/chenzhiwen/Desktop/momo_shop`

**驗證指令束（SDD 流程引用）：** 依序執行 ESLint、TypeScript（不產出檔案）、Next.js production build 與 Playwright E2E。

**唯讀驗證指令束（selfcheck / 獨立驗證者 / CI 引用）：**

```bash
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run lint
/Users/chenzhiwen/Desktop/momo_shop/node_modules/.bin/tsc -p /Users/chenzhiwen/Desktop/momo_shop/tsconfig.json --noEmit --incremental false
```

`next build` 會寫入 `.next/`，因此只屬於一般驗證束，不屬於唯讀驗證束。

> E2E / UI 驗證的測試工具與指令見 [testing.md](./testing.md)。
