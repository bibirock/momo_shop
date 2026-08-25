# Epic：Merchant Card Showroom

- 類型：父 Epic（需求 rollup）
- 子 Story 數量：6
- Rollup Story Points：42

## 使用者角色（Persona）

- 主要角色：需要分析、展示及調整商品卡的前端評估者／商品卡設計開發者
- 次要角色：需要將商品卡嵌入既有頁面的 consumer 開發者，以及評估 reusable architecture、state consistency 與 schema extensibility 的架構評估者
- 目標：完成一個可展示、調整、保存及嵌入商品卡的 Showroom，並以可觀察功能證明狀態一致性與 variant 擴充能力。
- 前置狀態：使用者可在同一 browser origin 開啟 Showroom 與 Sample HTML，不需要登入或後端服務。

## 背景與動機（Why）

Frontend Take Home Evaluation 的基本門檻要求至少一張商品卡、細節調整介面、Browser-side Persistence 及 Sample HTML。Bonus 進一步評估 Reusable Card Architecture、Schema／Plugin Extensibility 與 State Consistency Strategy。

本 Epic 採「先完成基本閉環，再補強可驗證 Bonus」的優先策略：P0 Story 1–3 完成即可交付基本需求；P1 增加完整 Showroom 與狀態一致性；P2 以第二種可運作 variant 證明擴充能力。

## 共享 In Scope

- 以 search-grid 作為基本商品卡 variant。
- 使用假圖網站產生的 mock 圖片或 repo 內靜態資產，不使用真實 momo API 或真實線上商品資料。
- 提供商品卡即時預覽與內容／外觀調整介面。
- 由 Zustand persist middleware 管理 canonical persisted state，localStorage key 為 momo-card-showroom:v1。
- Editor Draft 不直接持久化，Save 後才更新 canonical state。
- 提供可執行的 Sample HTML 與 MomoCard.mount() imperative API。
- Showroom 與 Embed 共用相同商品卡呈現結果。
- 三筆 search-grid 商品分別保存。
- 提供 dirty-state、切卡、離頁及跨頁同步的一致性策略。
- P2 以 recommendation variant 驗證 Schema／Plugin Extensibility。
- 各垂直 Story 都包含相應的鍵盤、響應式與瀏覽器錯誤驗收。

## 子 Story 與優先順序

| 順序 | 優先度 | Story | 點數 | 依賴 | 交付價值 |
| ---: | --- | --- | ---: | --- | --- |
| 1 | P0-1 | 01：展示並調整單一商品卡 | 8 | 無 | 至少一張可見、可即時調整的商品卡 |
| 2 | P0-2 | 02：保存與復原商品卡設定 | 8 | Story 1 | 調整、保存、重新整理後保留的基本閉環 |
| 3 | P0-3 | 03：從 Sample HTML 載入商品卡 | 8 | Story 1、2 | 外部 consumer 可透過 script API 使用商品卡 |
| 4 | P1-1 | 04：瀏覽並選取多筆商品卡 | 5 | Story 1、2 | 三筆商品的清單、選取與個別保存 |
| 5 | P1-2 | 05：維持編輯、儲存與跨頁狀態一致 | 8 | Story 2、3、4 | Dirty guard、跨頁同步與衝突處理 |
| 6 | P2-1 | 06：驗證商品卡 Schema 與 Variant 擴充能力 | 5 | Story 1、2、3、4 | 以 Recommendation Card 證明擴充能力 |

## 依賴樹

    Epic：Merchant Card Showroom（rollup 42）
    ├─ Story 1：展示並調整單一商品卡（8）
    ├─ Story 2：保存與復原商品卡設定（8）[依賴 Story 1]
    ├─ Story 3：從 Sample HTML 載入商品卡（8）[依賴 Story 1、2]
    ├─ Story 4：瀏覽並選取多筆商品卡（5）[依賴 Story 1、2]
    ├─ Story 5：維持編輯、儲存與跨頁狀態一致（8）[依賴 Story 2、3、4]
    └─ Story 6：驗證商品卡 Schema 與 Variant 擴充能力（5）[依賴 Story 1、2、3、4]

## Epic 級 Out of Scope

- 真實 momo API、資料爬取或真實線上商品資料。
- 圖片上傳與媒體管理。
- 完整購物車、結帳、收藏或會員功能。
- History Compact、Live 或第三種以上商品卡 variant。
- 動態第三方 plugin 安裝或 marketplace。
- npm package 發佈或獨立 library build pipeline。
- JSON import／export與 shareable URL。
- 後端資料庫、帳號、跨裝置或多使用者同步。
- 完整解決第三方 iframe storage policy。
- Schema migration pipeline、visual regression 或自動 accessibility audit。
- 完整複製 momo 整站 UI 或像素級重製參考截圖。

## 列舉完整性總覽

| 分組 | 範圍內成員 | 範圍外成員 |
| --- | --- | --- |
| Variant | search-grid、recommendation | history-compact、live、未列舉 variant |
| P0／P1 商品 | demo-food、demo-health、demo-fashion | 動態新增商品 |
| P2 商品 | demo-recommendation | 其他 Recommendation 商品 |
| Badge | 速、折價券、登記、贈品 | 未列舉 badge |
| Consumer API | MomoCard.mount()、destroy() | Web Component、npm／ESM package |
| Persistence | Zustand persisted state、localStorage backing store | sessionStorage、IndexedDB、Cookie、後端資料庫 |
| 狀態操作 | Save、Discard、Reset、Cancel | 自動保存、欄位層級衝突合併 |

未列出的 variant、商品、badge、consumer API、persistence 類型或狀態操作均視為 Epic 範圍外。

## 預估開發點數（Story Points）

- 點數：42（父 Epic rollup）
- 子 Story：8 + 8 + 8 + 5 + 8 + 5 = 42。
- 維度理由：整體橫跨商品卡與調整介面、版本化 browser persistence、公開 Embed API、多商品隔離、跨頁狀態一致性與第二 variant；驗證包含響應式、鍵盤、多頁與 iframe E2E。
- 拆分判定：整體命中 R1、R3、R4、R5，已依 Paths、Interfaces、Data、Rules 垂直拆為六張各自可 demo 且不超過 13 點的 Story。
- 守恆檢查：整體未拆初估約 34 點，子 Story rollup 42 點，增加約 24%，位於 ±50% 誤差帶。

## 參考資料

- ../../docs/discuss/merchant-card-showroom-mvp.md
- 01-display-and-edit-single-card.md
- 02-persist-and-restore-card-config.md
- 03-load-card-from-sample-html.md
- 04-browse-and-select-multiple-cards.md
- 05-maintain-state-consistency.md
- 06-verify-schema-and-variant-extensibility.md

## Epic 品質檢核清單

- [x] Persona、Why、共享範圍與 Epic 級 Out of Scope 已定義。
- [x] 六張子 Story 皆有完整獨立 spec、精確估點及父 Epic 標示。
- [x] 子 Story 皆為垂直切片、可獨立 demo 且不超過 13 點。
- [x] 子 Story 依賴與優先順序已記錄。
- [x] Rollup 點數等於全部子 Story 加總並通過守恆檢查。
- [x] Variant、商品、badge、consumer API、persistence 與狀態操作已完整列舉。
- [x] Epic 不重複定義子 Story AC；驗收標準以各子 Story 為準。
