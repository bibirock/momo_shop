# P2 Story 6：驗證商品卡 Schema 與 Variant 擴充能力

- 父 Epic：Merchant Card Showroom
- 優先度：P2-1
- 依賴：P0 Story 1、P0 Story 2、P0 Story 3、P1 Story 4

## 使用者角色（Persona）

- 角色：需要新增商品卡類型的平台開發者／架構評估者
- 目標：以一個可見、可保存、可嵌入的 Recommendation Card，確認新增 variant 不會破壞既有 Search Grid Card。
- 前置狀態：三筆 search-grid 商品可在 Showroom 選取及保存，imperative Embed API 已可依 cardId 載入商品。

## 背景與動機（Why）

Schema／Plugin Extensibility 是 Bonus 評估項目。單靠抽象介面或文件無法證明擴充能力，因此本 Story 以第二種 variant 完成一個可觀察的垂直切片，驗證不同資料結構與視覺層級能在既有 Showroom、Persistence 與 Embed 流程中共存。

## In Scope

- 新增 recommendation variant。
- 新增 demo-recommendation 商品並列入 Showroom 商品清單。
- Recommendation Card 顯示大圖、商品名稱、售價及最多一個促銷 badge。
- Recommendation Card 不顯示總銷量、評論數、星等裝飾或多 badge 列。
- Recommendation Card 可調整圖片、圖片替代文字、商品名稱、售價、單一 badge、accent color 與圓角。
- demo-recommendation 可使用既有 Save、Discard、Reset、validation 與 persistence 流程。
- MomoCard.mount() 可使用 cardId demo-recommendation 載入 Recommendation Card。
- 既有 demo-food、demo-health、demo-fashion 持續使用 search-grid variant，既有行為不變。
- 所有 config 使用 schemaVersion 1，並由 variant 明確區分其資料成員。

## 技術計畫約束

- Variant 選擇由集中式 registry 決定，不在 Showroom、Persistence 或 Embed consumer 內散佈 variant 條件判斷。
- 每個 registry 成員提供自己的預設設定與商品卡 renderer。
- 公開商品設定必須是可序列化的 discriminated union；Product Card renderer 不直接存取 Zustand、localStorage 或路由。
- 新增 recommendation 不得建立第二套 Showroom、Persistence 或 Embed 流程。
- 本限制由後續 spex-plan 轉成技術計畫與確定性檢查。

## Out of Scope

- History Compact、Live 或第三種以上 variant。
- 執行時載入第三方遠端 plugin。
- Plugin marketplace、動態安裝、啟用或停用。
- Schema version 2、migration pipeline 或舊版本資料遷移。
- Recommendation Card 的圖片輪播、輪播指示或導覽按鈕。
- Recommendation Card 的多 badge、評論、總銷量、收藏或購物車。
- 為 Recommendation Card 建立專屬 Sample HTML。

## 驗收標準（AC）

AC-01: Showroom 同時列出兩種 variant
  Given Showroom 已完成 hydration
  When 使用者檢視商品清單
  Then 清單依序包含三筆 search-grid 商品與 demo-recommendation，選取 demo-recommendation 時顯示大圖、商品名稱、售價及零或一個促銷 badge，且不顯示總銷量、評論數、星等裝飾或多 badge 列。

AC-02: Recommendation 欄位符合自己的 Schema
  Given 使用者選取 demo-recommendation
  When 使用者檢視調整介面
  Then 只顯示圖片、圖片替代文字、商品名稱、售價、單一 badge、accent color 與圓角控制項；不得顯示 search-grid 專屬的促銷文案、原價、總銷量、評論數或多 badge 控制。

AC-03: Recommendation 可保存與復原
  Given 使用者修改 demo-recommendation 的合法欄位
  When 使用者依序驗證 Save、重新整理、Discard 與 Reset
  Then 各操作遵循 Story 2 的相同狀態語意，且保存 demo-recommendation 不改變三筆 search-grid 商品設定。

AC-04: 既有 Embed API 載入新 variant
  Given demo-recommendation 已具有有效 persisted config
  When consumer 呼叫 MomoCard.mount("#imperative-demo", { cardId: "demo-recommendation" })
  Then iframe 顯示 Recommendation Card 的完整 persisted config，destroy() 仍可移除 iframe，且 consumer 不需要提供額外 variant 參數。

AC-05: 既有 Search Grid 行為不回歸
  Given recommendation variant 已可使用
  When 使用者依序開啟、調整、保存及嵌入 demo-food、demo-health、demo-fashion
  Then 三筆商品仍使用 search-grid 的欄位、版面與驗證規則，既有 Story 1–5 驗收場景持續通過，且頁面沒有 console error 或 uncaught page error。

## 邊界條件

| 維度 | 條件 | 預期行為 |
| --- | --- | --- |
| 空值／缺漏 | Recommendation badge 為空 | 不顯示 badge 區塊，其他內容保持原位置 |
| 空值／缺漏 | Recommendation config 缺少必填欄位 | 該商品回退自己的預設設定並顯示復原提示 |
| 格式 | variant 為 recommendation 但包含 search-grid 專屬欄位 | 不把專屬欄位顯示或保存為 Recommendation config |
| 格式 | variant 未註冊 | 顯示「不支援的商品卡類型：<variant>」，不得改用 search-grid |
| 上限／規模 | Recommendation badge 數量 | 只能選擇零或一個合法 badge |
| 上限／規模 | Variant 數量 | 本 Story 完整支援 search-grid、recommendation 兩種 |
| 錯誤路徑 | Recommendation renderer 無法取得有效 config | 顯示 variant 錯誤狀態，不影響其他商品 |
| 錯誤路徑 | 既有 persisted store 沒有 demo-recommendation | 使用 recommendation 預設設定，不清除既有三筆商品 |
| 權限／角色 | 未登入使用者 | 可查看、調整、保存與嵌入兩種 variant |

## 列舉完整性清單

| 成員 | 在範圍內？ | 備註 |
| --- | ---: | --- |
| search-grid | ✅ | 既有 variant |
| recommendation | ✅ | 本 Story 新增 variant |
| history-compact | ❌ | 不在本 Story |
| live | ❌ | 不在本 Story |
| demo-food | ✅ | search-grid |
| demo-health | ✅ | search-grid |
| demo-fashion | ✅ | search-grid |
| demo-recommendation | ✅ | recommendation |
| Recommendation 圖片 | ✅ | 可編輯 |
| Recommendation 圖片替代文字 | ✅ | 可編輯 |
| Recommendation 商品名稱 | ✅ | 可編輯 |
| Recommendation 售價 | ✅ | 可編輯 |
| Recommendation 單一 badge | ✅ | 可編輯、可為空 |
| Recommendation accent color | ✅ | 可編輯 |
| Recommendation 圓角 | ✅ | 可編輯 |
| Recommendation 促銷文案 | ❌ | 不在其 Schema |
| Recommendation 原價 | ❌ | 不在其 Schema |
| Recommendation 總銷量 | ❌ | 不在其 Schema |
| Recommendation 評論數／星等 | ❌ | 不在其 Schema |
| 動態第三方 plugin | ❌ | 不支援 |
| Schema migration | ❌ | 不支援 |

未列出的 variant、商品、Recommendation 欄位或 plugin 機制均視為本 Story 範圍外。

## 驗收場景

1. 使用者從商品清單選取 demo-recommendation，看到與 search-grid 不同的資訊層級及調整欄位。
2. 使用者修改並保存 Recommendation Card，重新整理與 Reset 均遵循既有 persistence 語意。
3. Consumer 以同一個 MomoCard.mount() API 載入 demo-recommendation，不需要知道其 variant。
4. 使用者重新驗證三筆 search-grid 商品，確認新增 variant 後既有功能沒有回歸。
5. 系統遇到未知 variant 或無效 recommendation payload 時顯示明確錯誤，不靜默改用其他 renderer。

## 預估開發點數（Story Points）

- 點數：5
- 維度理由：實作面新增一個較精簡 renderer、fixture 與既有清單／編輯器整合；狀態與契約把單一 config 擴充為兩個 variant 的可區分資料結構；整合面沿用既有 Showroom、Zustand persistence 與 Embed API；驗證工作量包含新 variant 的顯示、保存、嵌入及既有 search-grid 回歸。
- 拆卡判定：以 Data 與 Rules 手法加入一個具獨立可見價值的第二 variant；既有共用流程已完成，新增範圍接近新整合元件錨點，5 點且不需再拆。

## 參考資料

- ../../docs/discuss/merchant-card-showroom-mvp.md
- ../../docs/assets/merchant-card-showroom/recommendation-card.png
- 01-display-and-edit-single-card.md
- 02-persist-and-restore-card-config.md
- 03-load-card-from-sample-html.md
- 04-browse-and-select-multiple-cards.md

## 假設清單

- P2 以 recommendation 作為唯一擴充證據；history-compact 與 live 不納入。
- Recommendation 使用零或一個既有 badge，不新增 badge 成員。
- Schema version 保持 1，因本 Story 是新增 discriminated member，不處理既有資料 migration。

## 品質檢核清單

- [x] 必填章節齊全。
- [x] 5 組 AC 均可二元判定並可對應 UI、persistence、Embed 與回歸驗證。
- [x] Variant、商品、Recommendation 欄位及 plugin 邊界已完整列舉。
- [x] 空值、格式、上限、錯誤路徑與權限均有明確行為。
- [x] Out of Scope 非空。
- [x] 已完成四維估點及拆卡判定。
- [x] 非缺陷需求，不適用重現步驟與修復完成定義。
