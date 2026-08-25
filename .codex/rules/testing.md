<!-- 所屬 skill（Codex 無自動 scope，僅供參考）: spex-plan, spex-task, spex-implement, spex-selfcheck, spex-pull-request -->


# Testing 規則

> 本檔是可編輯的**專案規則**，由 spex 安裝。**這是測試 / E2E 工具的唯一來源**——spex 系列 skill 引用測試框架、E2E 指令、UI 驗證工具與 artifact 目錄時皆以本檔為準。換測試工具只要改本檔，skill 會自動跟隨；請依專案調整。
> 本檔以 frontmatter 的 `skills:` 宣告**所屬的 skill**，由 spex 安裝時依各工具 scope：Claude Code 把 `skills:` 轉成 `.codex/rules/` 的 `paths:`（指向各 skill 的 `SKILL.md`）、Copilot 轉成 `.github/instructions/` 的 `applyTo:`（指向各 skill 的 `.prompt.md`）、Codex 以 HTML 註解標示（無自動 scope，由 skill 執行時讀取）。如此本規則只在這些 skill 的脈絡相關，不污染使用者的無關工作。調整所屬 skill 只要改本清單。

## 測試框架

**Framework:** Playwright（E2E）；另以 ESLint、TypeScript 與 Next.js production build 作為基礎驗證。

**Layers:**

| 層次 | 框架 | 用途 |
|---|---|---|
| 單元 / 整合 | 尚未設定 | 純函式與工具函式；導入框架後補上 |
| 元件 | 尚未設定 | React 元件互動與渲染；導入框架後補上 |
| 瀏覽器環境模擬 | 尚未設定 | 導入 DOM 測試環境後補上 |
| E2E | `@playwright/test` | Chromium 上的完整使用者流程與瀏覽器 console 驗證 |

## E2E / UI 驗證工具（skill 引用值）

| 項目 | 值 |
|---|---|
| **完整 E2E 指令** | `npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e` |
| **E2E 框架 / 匯入** | Playwright；`import { expect, test } from "@playwright/test"` |
| **UI 驗證工具（瀏覽器互動）** | Playwright Test；探索性驗證另用 Codex in-app Browser（可用時） |
| **E2E artifact 目錄（commit 前須清理）** | `test-results/`、`playwright-report/`、`blob-report/` |
| **E2E HTML 報告** | `playwright-report/index.html` |
| **E2E 設定檔** | `playwright.config.ts`；預設 Chromium、port 3100、自動啟動 Next dev server |

## 測試檔結構（Colocated）

```
tests/
  e2e/
    <flow>.e2e.ts
```

**命名慣例：**
- E2E 測試檔：`<flow>.e2e.ts`（置於 `tests/e2e/`）
- 未來若加入單元／元件測試，需先在本檔補上框架與 colocated 規則。

## E2E 撰寫慣例

- **共用資料庫的 e2e 必須序列化**：多個 e2e suite 打同一個 DB 時，並行 worker 會互刪資料造成偶發紅燈（A suite 的清表掃掉 B suite 的 fixtures）。處理方式：把 runner 的並行度設為 1（各家設定名不同，查你所用 runner 的文件），或改用 per-suite schema / transaction 隔離。
- 預設由 Playwright `webServer` 啟動 `127.0.0.1:3100`；若要重用既有 server，設定 `PLAYWRIGHT_BASE_URL`。
- 測試至少監聽 `console.error` 與未捕捉的 `pageerror`；新增錯誤即失敗。
- 建議流程：先用 UI 驗證工具探索真實流程與 DOM → 再依 E2E 框架慣例產出測試。

## UI Verification（UI / 佈局 / 拖放 / 視覺反饋類任務 commit 前必走）

與「程式化斷言 PASS」並列、缺一不可。

| 步驟 | 做法 |
|---|---|
| 啟動 dev server | `npm run test:e2e` 由 Playwright 自動啟動；手動模式可用 `npm run dev -- --hostname 127.0.0.1 --port 3100` |
| 真實渲染走流程 | UI 驗證工具導覽 → 逐步操作互動元素 |
| 逐項截圖比對 AC | 每條 AC 對應 1 張截圖，用 Read 看圖確認視覺與 AC 文字一致 |
| console 監聽 | 瀏覽器 console 不可有新 error / warn |

任一項不符 → 退回 Refactor 修真實渲染，**不可**用單元 / 整合 / E2E spec PASS 替代。
