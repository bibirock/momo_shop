<!-- spex:entry seq=1 at=2026-08-25T17:53:39+08:00 -->

## [Spex] Plan 完成 [tier-2]

# 技術實施計畫 — 展示並調整單一商品卡

> Tracker Item: 20260825-display-and-edit-single-card | 階段: Plan | Tier: 2 | 日期: 2026-08-25

### 分類結果

- 路線：需求
- Tier：2
- 輸入檢核：通過
- 工作分支：`feature/LOCAL-20260825-display-and-edit-single-card-display-and-edit-single-card`
- 程式碼導航：LSP 不可用，使用 `rg` fallback

### 技術棧

| 類型 | 選擇 | 理由 | 備註 |
|---|---|---|---|
| Framework | Next.js 16.3.2 App Router | 沿用專案既有架構 | `app/page.tsx` 保持 Server Component |
| UI | React 19.2.8 Client Component | Editor 需要即時狀態與事件處理 | 僅 Showroom 互動邊界使用 `"use client"` |
| 型別 | Strict TypeScript | 建立可序列化商品卡設定契約 | 禁止裸 `any` |
| 樣式 | Tailwind CSS 4＋少量全域 CSS | 響應式版面、焦點與文字截斷 | 不新增 UI 套件 |
| 圖片 | `next/image`＋repo 靜態資產 | 提供尺寸資訊並避免遠端服務依賴 | `onError` 切換 fallback |
| 測試 | Playwright | 專案唯一已設定的測試框架 | Chromium、390px 與桌面 viewport |
| 狀態 | React local state | Story 1 僅需不持久化 draft | 不提前使用 Zustand persistence |

### 成功條件（量化）

| 需求 | 目標 | 主要驗證 | 為何選／不選單元測試 | 補充 |
|---|---|---|---|---|
| AC-01 預設商品卡 | 首次載入呈現 demo-food 圖片、促銷、名稱、兩種價格、銷量、5,208 評論及 2 個 badges | Playwright E2E | 主要驗收是完整 DOM 與視覺呈現，單元框架尚未設定，因此不選 | 桌面截圖人工比對參考圖 |
| AC-02 Editor 完整 | 顯示 11 組具 label 的欄位群組；badge 群組含 4 個 checkbox | Playwright E2E | 欄位存在性與 accessible label 需在真實 DOM 驗證，因此不選 | 使用 role／label locator |
| AC-03 即時預覽 | 14 個實際控制項逐一操作後，不 reload 即反映合法值；無效數值、色彩及圓角保留上一個合法預覽值 | Playwright E2E | 驗證函式適合單元測試，但專案尚無單元框架；本 Story 不新增依賴，改由 E2E 覆蓋合法與非法輸入 | Editor 可保留無效原始輸入，renderer 只接收合法 config |
| AC-04 空值與長文 | 可選區塊為空時不渲染；商品名稱最多 2 行、促銷最多 1 行；卡片 `scrollWidth <= clientWidth` | Playwright E2E＋人工視覺驗證 | 行數截斷與實際 overflow 依賴瀏覽器排版，單元測試無法可靠驗證，因此不選 | 驗證空 promotion、originalPrice、badges |
| AC-05 390px 與鍵盤 | 390px viewport 下 `document.scrollWidth <= window.innerWidth`；所有控制項可依序取得可見焦點；console error 與 pageerror 均為 0 | Playwright E2E＋人工視覺驗證 | 響應式排版、Tab 順序及焦點樣式需要真實瀏覽器，因此不選 | 截圖確認預覽先於 Editor |

### 架構設計

#### 元件／模組拆分

- `app/page.tsx`
  - Server Component 頁面入口。
  - 呈現標題、說明及 `ProductCardShowroom`。
  - 不持有互動狀態。

- `ProductCardShowroom`
  - 唯一 Client Component 邊界。
  - 持有 Editor 原始值與最後合法的 preview config。
  - 組合預覽與 Editor；窄螢幕依序呈現預覽、調整介面。

- `ProductCard`
  - 純展示元件，只接收可序列化的 `ProductCardConfig`。
  - 不讀取 React store、localStorage、路由或 Editor 狀態。
  - 負責價格格式、可選區塊、固定星等裝飾、badge 與圖片 fallback。

- `ProductCardEditor`
  - 受控表單元件。
  - 提供圖片、文字、數字、badge、accent color 與圓角控制項。
  - 所有控制項具有可辨識 label 與 `focus-visible` 樣式。

- `product-card.types.ts`
  - 定義 `ProductCardBadge`、`ProductCardConfig`、圖片選項與 Editor 欄位型別。

- `product-card.defaults.ts`
  - 定義 demo-food 預設值、三種圖片選項與四種 badge。
  - 不加入 Story 4 的多商品狀態。

- `product-card.validation.ts`
  - 純函式驗證非負安全整數、`#RRGGBB` 與 0–24 圓角。
  - 將合法 Editor 輸入轉成 renderer 可接受的 config 更新。

#### 資料流

```text
demo-food defaults
        │
        ▼
ProductCardShowroom local state
  ├─ editorValues：保留使用者目前輸入
  └─ previewConfig：只保存最後合法值
        │
        ├──────────────► ProductCardEditor
        │                    │
        │                    └─ onChange
        │                         │
        │            驗證合法 ────┤
        │                         ├─ 是：更新 editorValues＋previewConfig
        │                         └─ 否：只更新 editorValues
        ▼
ProductCard(previewConfig)
```

- 空商品名稱與圖片替代文字由 renderer 分別顯示「未命名商品」與「商品圖片」。
- promotion、originalPrice、badges 為空時不渲染對應區塊。
- 切換圖片選項時同步更新圖片來源；替代文字仍由獨立欄位控制。
- 圖片載入失敗時切換為不破版 fallback，不影響 Editor。
- 重新整理後重新使用 defaults，不保存 draft。

#### API 設計

本 Story 不新增 API、route handler、OpenAPI schema 或公開 Embed API。

### 預計新增／修改檔案

| 動作 | 路徑 | 用途 |
|---|---|---|
| 修改 | `app/page.tsx` | Showroom 頁面入口 |
| 修改 | `app/layout.tsx` | 中文語系與頁面 metadata |
| 修改 | `app/globals.css` | 基礎色彩、focus-visible、文字截斷與響應式補充 |
| 新增 | `components/product-card/ProductCardShowroom.tsx` | Client state 與頁面組合 |
| 新增 | `components/product-card/ProductCard.tsx` | 純展示商品卡 |
| 新增 | `components/product-card/ProductCardEditor.tsx` | 調整介面 |
| 新增 | `components/product-card/product-card.types.ts` | 商品卡型別 |
| 新增 | `components/product-card/product-card.defaults.ts` | demo-food、圖片與 badge defaults |
| 新增 | `components/product-card/product-card.validation.ts` | 即時輸入驗證 |
| 新增 | `public/merchant-card-showroom/search-card-food.png` | 食品假圖 |
| 新增 | `public/merchant-card-showroom/search-card-health.png` | 保健假圖 |
| 新增 | `public/merchant-card-showroom/search-card-fashion.png` | 服飾假圖 |
| 移除 | `tests/e2e/home.e2e.ts` | 移除 Create Next App 範例驗收 |
| 新增 | `tests/e2e/merchant-card-showroom.e2e.ts` | AC-01～AC-05 與邊界條件驗收 |

### 測試策略

| 層次 | 工具 | 範圍 | 覆蓋 |
|---|---|---|---|
| Unit | 尚未設定 | 純驗證函式 | 本 Story 不新增測試依賴 |
| Component | 尚未設定 | ProductCard／Editor | 本 Story 不新增測試依賴 |
| E2E | Playwright | 5 條 AC、合法與非法輸入、圖片失敗、長文、390px、鍵盤、瀏覽器錯誤 | 全部關鍵路徑 |
| UI | Playwright 截圖／Codex Browser | 桌面及 390px 真實渲染 | 逐條對照視覺 AC |

驗證指令束：

```bash
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run lint
/Users/chenzhiwen/Desktop/momo_shop/node_modules/.bin/tsc -p /Users/chenzhiwen/Desktop/momo_shop/tsconfig.json --noEmit --incremental false
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run build
npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e
```

### 驗收標準對照

- AC-01：預設 demo-food 商品卡內容完整。
- AC-02：11 組 Editor 欄位及 4 個 badge 選項皆有 accessible label。
- AC-03：全部欄位合法變更即時反映；非法格式不污染預覽。
- AC-04：空白可選內容隱藏；名稱兩行、促銷一行；卡片不溢出。
- AC-05：390px 無水平捲動、完整鍵盤操作、可見焦點及零瀏覽器錯誤。

### 技術風險與緩解

| 風險 | 機率 | 影響 | 緩解 |
|---|---|---|---|
| 數字輸入的暫時非法字串污染 renderer | 中 | 中 | 分離 Editor 原始值與最後合法 preview config |
| `next/image` 載入失敗造成空白或版面跳動 | 低 | 中 | 固定圖片容器比例、`onError` fallback、E2E 攔截圖片請求 |
| 長文截斷在不同 viewport 表現不一致 | 中 | 中 | 明確 CSS line clamp、overflow hidden 與桌面／390px 瀏覽器驗證 |
| controls 在窄螢幕造成水平溢出 | 中 | 中 | `min-width: 0`、單欄堆疊、輸入寬度限制及 scrollWidth 斷言 |
| 過早引入 Story 2／4 架構 | 中 | 高 | 僅保留單一卡片 local draft；不加入 persistence、Save、registry 或商品清單 |
| 目前沒有單元／元件測試框架 | 高 | 中 | 不新增規範外依賴；純函式保持可測，現階段以 Playwright 覆蓋公開行為 |

### 規範外依賴

無。

### Future Considerations

本 Story 刻意排除：

- Zustand persistence、Save、Discard、Reset。
- 多商品清單、商品切換與跨商品資料隔離。
- variant registry、recommendation 與 plugin extensibility。
- Sample HTML、iframe 與 `MomoCard.mount()`。
- Dirty guard、離頁警告與跨頁同步。
- 真實 API、購物車、收藏與圖片輪播。

### 下一步

執行 `spex-task`，依本計畫拆解可執行的 TDD 子任務。
