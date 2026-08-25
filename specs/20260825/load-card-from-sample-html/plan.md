<!-- spex:entry seq=1 at=2026-08-25T00:00:00+08:00 -->
## [Spex] Plan 完成

> 分類：需求路線／Tier 2 | Story Points：8 | 分支：feature/LOCAL-20260825-load-card-from-sample-html-load-card-from-sample-html

### 技術選型

- 延用 Next.js App Router、React、TypeScript 與既有 Zustand 依賴。
- 以 `public/` 提供可直接載入的 `/sample.html` 與 `/momo-card.js`。
- 以 App Router 的 `/embed/[cardId]` 提供 iframe 內容。
- 以 Playwright E2E 驗證公開嵌入流程；目前沒有單元／元件測試框架，因此純 loader 行為也透過瀏覽器端 E2E 驗證。
- 不新增第三方依賴。

### 架構與資料流

1. Showroom 將成功儲存的 demo-food `ProductCardConfig` 寫入 Story 2 的 Zustand persisted store；草稿仍只存在編輯流程，不直接成為 Embed 資料。
2. `/sample.html` 載入 `/momo-card.js`，顯示與 mount 呼叫一致的程式碼範例，並以 `MomoCard.mount("#imperative-demo", { cardId: "demo-food" })` 建立單一 instance。
3. Loader 由 `document.currentScript.src` 取得自身 URL 的 origin，組合 `${origin}/embed/${cardId}`；解析 target、cardId 與單一 instance 生命週期，建立 responsive、lazy iframe 並回傳 `destroy()`。
4. `/embed/[cardId]` 僅接受 `demo-food`。合法時讀取 persisted canonical config，驗證／修正無效 payload 後以既有 `ProductCard` renderer 呈現；無資料時使用 `DEFAULT_PRODUCT_CARD`。
5. 非法 target、空 cardId、未知 cardId 與無效 persisted payload 各自走明確錯誤或預設 fallback，不觸碰 host 頁面未授權的 `localStorage` API。

### 預計檔案異動

新增：

- `public/sample.html`：可獨立開啟的嵌入展示頁、程式碼範例與 target。
- `public/momo-card.js`：瀏覽器端 imperative loader、target/cardId 驗證、iframe 建立與 destroy handle。
- `app/embed/[cardId]/page.tsx`：demo-food embed route 與 unknown-card error card。
- `components/product-card/product-card-store.ts`（或沿用 Story 2 實際 store 路徑）：Zustand persisted canonical config、schema 驗證與 default fallback。
- `tests/e2e/merchant-card-embed.e2e.ts`：AC01–AC05、邊界條件與 console/page error 監控。

修改：

- `components/product-card/ProductCardShowroom.tsx`：將儲存動作接到 canonical persisted store，保留即時 draft 與 renderer 共用。
- `app/globals.css`：sample/embed iframe 容器、錯誤卡、窄螢幕 responsive 與 keyboard focus 樣式；不引入 host custom internal styles。
- 必要時修改既有商品卡型別／validation，確保 persisted payload 可判斷 schemaVersion、cardId 與欄位完整性。

### AC 對映與量化驗收

| AC | 可執行驗證 | 選擇理由 |
|---|---|---|
| AC01 | Playwright 開啟 `/sample.html`，檢查程式碼文字、target/cardId 一致，且只有一個 demo-food iframe/card | 需要真實靜態頁、loader 與 iframe DOM，現有無元件測試框架，故不選單元測試 |
| AC02 | Playwright 在 Showroom 修改並儲存、重新載入 sample，檢查完整設定；另清除／無資料時檢查預設值與 draft 不出現 | 涉及跨 route、persist hydration 與瀏覽器重載，單元測試無法證明整合結果 |
| AC03 | Playwright 攔截 iframe URL，確認來源等於載入 script 的 origin、`loading="lazy"`、meaningful title、寬度不超出 container | 需瀏覽器解析 `currentScript`、iframe 屬性與實際 layout，故選 E2E |
| AC04 | Playwright 呼叫 mount/destroy，檢查 iframe 移除；分別驗證未知 cardId、空 cardId、缺少 target、invalid selector 的訊息 | DOM lifecycle 與 host API 錯誤需在瀏覽器環境驗證，無單元／DOM 測試框架 |
| AC05 | Playwright 390px viewport、鍵盤 Tab 流程、`document.documentElement.scrollWidth <= innerWidth`，並收集 `console.error`／`pageerror` | responsive、可及性與瀏覽器錯誤是 E2E 可觀察結果，單元測試不適用 |

### 邊界與錯誤策略

- target 可接受 selector；找不到元素或 selector 語法錯誤時顯示 `找不到嵌入目標`，不拋出未捕捉例外。
- `cardId` 空值顯示 `請提供商品 ID`；未知值顯示 `找不到商品：<cardId>`，不使用 demo-food fallback。
- 同一 target 僅建立一個 iframe；`destroy()` 可重複呼叫且結果冪等。
- persisted JSON、schemaVersion、cardId 或欄位驗證失敗時回到 `DEFAULT_PRODUCT_CARD`；不直接讀寫 `localStorage`。
- 圖片失敗沿用 `ProductCard` 的 `IMAGE UNAVAILABLE` fallback。
- embed 不需要登入，不加入跨 origin、postMessage、高度同步或 cross-tab 行為。

### 技術風險與緩解

- `document.currentScript` 在非同步載入或手動呼叫時可能為 null：loader 需在 script 執行期間保存自身 origin，並對無法解析的情況給予明確錯誤。
- iframe 內 Zustand persist hydration 可能先 render default：以 client hydration 後的 canonical config 更新，並以 E2E 等待最終商品內容。
- 現有 Story 2 persisted store 尚未在目前分支出現：實作前先確認其實際檔案與 key，避免建立第二套 store；若依賴未完成，保留此卡與 Story 2 的明確整合接點。
- 靜態 sample 頁不經 Next React runtime：loader 必須保持自包含 ES5/瀏覽器可執行格式，不引用 `@/` alias 或 server-only API。

### MVP 邊界

- 本次只實作 demo-food、imperative mount、單一 iframe、same-origin persisted config 與指定錯誤訊息。
- 不實作 Web Component、npm/ESM 套件、跨 tab／跨 origin sync、postMessage、高度同步、事件 API 或多 instance。

### 驗證指令

```bash
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run lint
/Users/chenzhiwen/Desktop/momo_shop/node_modules/.bin/tsc -p /Users/chenzhiwen/Desktop/momo_shop/tsconfig.json --noEmit --incremental false
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run build
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e
```

LSP 在此環境不可用，程式碼導航以 `rg`／檔案掃描替代。
