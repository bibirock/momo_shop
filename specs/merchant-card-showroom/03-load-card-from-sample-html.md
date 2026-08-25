# P0 Story 3：從 Sample HTML 載入商品卡

- 父 Epic：Merchant Card Showroom
- 優先度：P0-3
- 依賴：P0 Story 1、P0 Story 2

## 使用者角色（Persona）

- 角色：需要把商品卡嵌入既有網頁的前端開發者／功能評估者
- 目標：參考一份可直接執行的 Sample HTML，透過 script API 載入 Showroom 的商品卡。
- 前置狀態：Showroom 已可展示、調整並保存 demo-food 商品卡；Sample HTML 與 Showroom 使用相同服務 origin。

## 背景與動機（Why）

基本需求要求提供一份 Sample HTML，證明商品卡不只存在於 Showroom，也能由外部 consumer 載入。P0 先交付一種 imperative script API，形成「調整、保存、嵌入」的最小完整閉環。

## In Scope

- 提供可直接開啟的 /sample.html。
- Sample HTML 同時顯示 MomoCard.mount() 使用程式碼與實際嵌入結果。
- 提供 /momo-card.js script loader。
- 公開 MomoCard.mount(target, options) imperative API。
- options 使用 cardId 指定 demo-food。
- mount 成功後回傳含 destroy() 的 handle。
- 嵌入內容顯示 demo-food 最後一次成功保存的完整設定；沒有保存資料時顯示預設設定。
- 嵌入內容與 Showroom 使用相同商品卡呈現結果。
- 未知 cardId 顯示明確錯誤卡。
- iframe 具有可辨識 title、lazy loading 與不超出宿主寬度的響應式呈現。

## 技術計畫約束

- Showroom 與 Embed 必須共用同一個商品卡 renderer，不建立第二份商品卡 UI。
- Embed 透過 Zustand persisted store 取得 canonical config，不直接呼叫 localStorage.getItem()、localStorage.setItem() 或 localStorage.removeItem()。
- Loader 從自身 script URL 推導服務 origin，不寫死 localhost、port 或部署網域。
- 本限制由後續 spex-plan 轉成技術計畫與確定性檢查。

## Out of Scope

- Declarative Web Component momo-product-card。
- 同時展示兩種 Embed API。
- 尚未 Save 的 Draft 顯示於 Embed。
- 已開啟 Embed 的跨分頁即時同步。
- 多筆商品或同頁多實例驗收。
- 跨來源 persistence fallback。
- postMessage 高度同步與 host event callback。
- npm package、ESM package 或獨立 library build pipeline。
- 宿主頁面自訂商品卡內部樣式。

## 驗收標準（AC）

AC-01: Sample HTML 提供可執行範例
  Given 使用者開啟 /sample.html
  When 頁面完成載入
  Then 畫面同時顯示 MomoCard.mount() 的完整使用程式碼與一張 demo-food 商品卡實例，且顯示的程式碼可對應頁面上實際執行的 target selector 與 cardId。

AC-02: Embed 顯示已保存設定
  Given 使用者已在 Showroom 保存 demo-food 的商品名稱、價格、badges、accent color 或圓角
  When 使用者重新開啟或重新整理 /sample.html
  Then 嵌入商品卡呈現最後一次成功保存的完整設定，不呈現尚未 Save 的 Draft；若沒有 persisted config，則呈現 demo-food 預設設定。

AC-03: Loader 可在部署 origin 建立 Embed
  Given /momo-card.js 從任一有效部署 origin 載入
  When consumer 呼叫 MomoCard.mount("#imperative-demo", { cardId: "demo-food" })
  Then 指定容器內新增一個指向該 script origin 下 /embed/demo-food 的 iframe，iframe 寬度不超出容器、使用 lazy loading，且 title 可辨識為 demo-food 商品卡。

AC-04: Destroy 與未知商品行為明確
  Given MomoCard.mount() 已成功建立 iframe
  When consumer 呼叫回傳 handle 的 destroy()
  Then 該次 mount 建立的 iframe 從容器移除
  Given consumer 傳入未列舉的 cardId
  When Embed 完成載入
  Then iframe 內顯示「找不到商品：<cardId>」，不得改為載入 demo-food 或其他預設商品。

AC-05: Sample HTML 可存取且不產生瀏覽器錯誤
  Given viewport 寬度為 390px
  When 使用者以鍵盤瀏覽 Sample HTML、程式碼與嵌入商品卡
  Then 頁面沒有水平捲動、iframe 有可辨識名稱、商品卡內容可完整閱讀，且沒有 console error 或 uncaught page error。

## 邊界條件

| 維度 | 條件 | 預期行為 |
| --- | --- | --- |
| 空值／缺漏 | cardId 為空或未提供 | Embed 顯示「請提供商品 ID」，不得載入 demo-food |
| 空值／缺漏 | target selector 找不到元素 | mount 明確回報「找不到嵌入目標」，不得把 iframe 加到其他容器 |
| 空值／缺漏 | demo-food 沒有 persisted config | 顯示 demo-food 預設設定 |
| 格式 | target 不是有效 selector 或可掛載元素 | mount 明確回報嵌入目標錯誤，不建立 iframe |
| 格式 | cardId 不在列舉清單 | 顯示「找不到商品：<cardId>」錯誤卡 |
| 上限／規模 | Sample HTML 實例數量 | P0 只要求一個 imperative API 實例 |
| 上限／規模 | 宿主容器窄於卡片預設寬度 | iframe 與卡片縮至容器寬度，不造成宿主頁面水平溢出 |
| 錯誤路徑 | Persisted payload 無效 | 依 Story 2 復原規則顯示預設設定，不使 iframe 崩潰 |
| 錯誤路徑 | 商品假圖載入失敗 | 依 Story 1 顯示圖片 fallback，其他商品資訊仍可讀 |
| 權限／角色 | 未登入使用者開啟 Sample HTML | 可直接查看範例與商品卡，不要求帳號 |

## 列舉完整性清單

| 成員 | 在範圍內？ | 備註 |
| --- | ---: | --- |
| /sample.html | ✅ | P0 Sample HTML |
| /momo-card.js | ✅ | Script loader |
| MomoCard.mount() | ✅ | P0 consumer API |
| destroy() | ✅ | mount handle 操作 |
| momo-product-card Web Component | ❌ | 基本門檻後的可選擴充 |
| iframe renderer | ✅ | Embed 呈現邊界 |
| demo-food | ✅ | P0 唯一合法 cardId |
| 其他 cardId | ❌ | 顯示錯誤卡 |
| Persisted config | ✅ | Embed 顯示來源 |
| 未保存 Draft | ❌ | Embed 不顯示 |
| 單一 Embed 實例 | ✅ | P0 驗收範圍 |
| 同頁多 Embed 實例 | ❌ | 不在本 Story |
| 跨分頁即時同步 | ❌ | Story 5 |
| npm／ESM package | ❌ | 不在 MVP |

未列出的 consumer API、商品 ID、嵌入方式或同步機制均視為本 Story 範圍外。

## 驗收場景

1. 使用者在 Showroom 保存 demo-food 設定，開啟 Sample HTML，從頁面上的使用程式碼確認呼叫方式，並看到相同的 persisted config。
2. Consumer 呼叫 MomoCard.mount() 建立 iframe，再呼叫 destroy() 移除該 iframe。
3. Consumer 傳入未知或空白 cardId，Embed 顯示明確錯誤，不靜默載入其他商品。
4. 使用者在 390px viewport 開啟 Sample HTML，頁面、程式碼與商品卡皆可閱讀且沒有瀏覽器錯誤。

## 預估開發點數（Story Points）

- 點數：8
- 維度理由：實作面包含 Sample HTML、公開 loader、Embed 頁面、mount handle 與錯誤卡；狀態與契約新增 consumer API 及 cardId 載入契約；整合面需跨宿主頁與 iframe 共用既有 renderer 及 persisted config；驗證工作量涵蓋公開 API、部署 origin、destroy、未知 ID、響應式與 E2E。
- 拆卡判定：以 Interfaces 手法從 Epic 拆出 imperative API 垂直切片；Web Component 與跨頁同步均已排除，剩餘範圍為單一可獨立 demo 的外部嵌入目標，8 點且不需再拆。

## 參考資料

- ../../docs/discuss/merchant-card-showroom-mvp.md
- 01-display-and-edit-single-card.md
- 02-persist-and-restore-card-config.md

## 假設清單

- P0 的 Sample HTML 只驗收 MomoCard.mount()，Web Component 不阻擋基本需求完成。
- Sample HTML、loader 與 Embed 頁面由同一服務 origin 提供。
- 跨分頁 storage event 同步留待 Story 5；Story 3 以重新載入 Sample HTML 驗證 persisted config。
- iframe 高度同步不使用 host callback；只要求預設 demo-food 商品卡內容可完整閱讀。

## 品質檢核清單

- [x] 必填章節齊全。
- [x] 5 組 AC 均可二元判定並可對應 E2E 或公開 API 驗證。
- [x] Consumer API、商品 ID、嵌入方式與狀態來源已完整列舉。
- [x] 空值、格式、上限、錯誤路徑與權限均有明確行為。
- [x] Out of Scope 非空。
- [x] 已完成四維估點及拆卡判定。
- [x] 非缺陷需求，不適用重現步驟與修復完成定義。
