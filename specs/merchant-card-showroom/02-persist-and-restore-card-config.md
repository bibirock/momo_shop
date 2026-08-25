# P0 Story 2：保存與復原商品卡設定

- 父 Epic：Merchant Card Showroom
- 優先度：P0-2
- 依賴：P0 Story 1

## 使用者角色（Persona）

- 角色：調整商品卡內容的前端評估者／商品卡設計開發者
- 目標：明確提交商品卡設定，並在重新整理後繼續看到最後一次成功保存的內容。
- 前置狀態：demo-food 商品卡與調整介面已可使用。

## 背景與動機（Why）

基本需求要求 Browser-side Persistence。調整中的 Draft 與已提交設定必須分離，避免尚未確認或驗證失敗的內容污染已保存資料。

## In Scope

- 使用 momo-card-showroom:v1 作為 persistence key。
- localStorage 是唯一 browser-side persistence backing store。
- 使用者明確按下 Save 後才提交整筆設定。
- Draft 修改期間不改變 persisted config。
- 提供 Save、Discard、Reset。
- Hydration 完成前顯示 loading state。
- 無效或損毀的 persisted payload 回退預設值。
- 儲存失敗時保留 Draft 與原 persisted config。
- 僅處理單一 demo-food 商品。

## 技術計畫約束

- Persistence 必須使用 Zustand persist middleware。
- Persist middleware 僅管理 canonical persisted state，不包含 editor Draft。
- 編輯器及業務程式不得直接呼叫 localStorage.getItem()、localStorage.setItem() 或 localStorage.removeItem()。
- Storage key、schema version、hydration 與資料合併規則集中於 persistence 設定。
- 本限制由後續 spex-plan 轉成技術計畫與確定性檢查。

## Out of Scope

- 多商品個別保存。
- 切換商品時的 Save／Discard／Cancel dialog。
- 離頁或重新整理警告。
- 跨分頁及 Embed 同步。
- Sample HTML。
- Schema migration pipeline。
- JSON import／export、分享網址或雲端同步。
- 自動保存模式。

## 驗收標準（AC）

AC-01: Hydration 後顯示正確設定
  Given 使用者開啟 Showroom
  When persistence hydration 尚未完成
  Then 顯示 loading state，不先顯示可能與 persisted config 不一致的預設商品卡；hydration 完成後，有有效資料時顯示已保存設定，沒有資料時顯示 demo-food 預設設定。

AC-02: Save 提交完整設定
  Given 使用者已修改一個或多個 Draft 欄位且所有欄位合法
  When 使用者按下 Save
  Then 整筆 demo-food config 成為 canonical persisted config；重新整理頁面後仍顯示該設定，且儲存內容使用 key momo-card-showroom:v1 與 schemaVersion 1。

AC-03: 無效設定不得保存
  Given 商品名稱或圖片替代文字為空，或任一數值、色彩、圖片或 badge 不符合規則
  When 使用者檢視或嘗試提交 Draft
  Then 對應欄位顯示可辨識錯誤、Save 不得提交、persisted config 保持不變，且使用者輸入的 Draft 不遺失。

AC-04: Discard 與 Reset 語意分離
  Given Draft 與 persisted config 不同
  When 使用者按下 Discard
  Then Draft 立即回復最後一次成功保存的完整設定
  When 使用者按下 Reset
  Then Draft 載入 demo-food 預設值，但 persisted config 保持不變，直到使用者另行按下 Save。

AC-05: 損毀資料與寫入失敗可復原
  Given persisted payload 無法解析、版本不符或缺少必填資料
  When Showroom hydration
  Then 使用預設設定並顯示可關閉的「已還原預設資料」提示
  Given browser storage 寫入失敗
  When 使用者按下 Save
  Then 顯示「儲存失敗，變更尚未保存」、保留 Draft，且原 persisted config 不變。

## 邊界條件

| 維度 | 條件 | 預期行為 |
| --- | --- | --- |
| 空值／缺漏 | 商品名稱為空或只含空白 | 顯示「請輸入商品名稱」，不得保存 |
| 空值／缺漏 | 圖片替代文字為空或只含空白 | 顯示「請輸入圖片替代文字」，不得保存 |
| 空值／缺漏 | 原價為空 | 視為合法，保存後不顯示原價 |
| 格式 | 售價或評論數不是非負安全整數 | 顯示欄位錯誤，不得保存 |
| 格式 | 原價存在但不是非負安全整數或低於售價 | 顯示欄位錯誤，不得保存 |
| 格式 | Accent color 不是 #RRGGBB | 顯示欄位錯誤，不得保存 |
| 格式 | 圖片不在三種 mock 圖片清單內 | 顯示欄位錯誤，不得保存 |
| 格式 | Badges 含未知值或重複值 | 顯示欄位錯誤，不得保存 |
| 上限／規模 | 圓角不在 0–24 的整數範圍 | 顯示欄位錯誤，不得保存 |
| 上限／規模 | 本 Story 的 persisted cards | 僅保存 demo-food 一筆商品 |
| 錯誤路徑 | JSON 無法解析、版本不符或資料不完整 | 全部回退 demo-food 預設值並顯示復原提示 |
| 錯誤路徑 | Storage quota、權限或其他寫入錯誤 | 保留 Draft 與舊 persisted config，顯示保存失敗 |
| 權限／角色 | 未登入使用者 | 可在目前 browser origin 保存，不要求帳號 |

## 列舉完整性清單

| 成員 | 在範圍內？ | 備註 |
| --- | ---: | --- |
| Save | ✅ | 驗證後提交整筆 config |
| Discard | ✅ | 回復最後 persisted config |
| Reset | ✅ | 只載入預設 Draft |
| 自動保存 | ❌ | 不提供 |
| Editor Draft | ✅ | 不持久化 |
| Canonical persisted config | ✅ | 唯一已提交狀態 |
| localStorage | ✅ | 唯一 persistence backing store |
| sessionStorage | ❌ | 不使用 |
| IndexedDB | ❌ | 不使用 |
| Cookie | ❌ | 不使用 |
| 遠端資料庫 | ❌ | 不使用 |
| demo-food | ✅ | 本 Story 唯一商品 |
| search-grid | ✅ | 本 Story 唯一 variant |
| 食品假圖 | ✅ | 合法圖片值 |
| 保健假圖 | ✅ | 合法圖片值 |
| 服飾假圖 | ✅ | 合法圖片值 |
| 速 | ✅ | 合法 badge |
| 折價券 | ✅ | 合法 badge |
| 登記 | ✅ | 合法 badge |
| 贈品 | ✅ | 合法 badge |

未列出的 persistence 類型、商品、variant、圖片或 badge 均視為範圍外。

## 驗收場景

1. 使用者修改合法設定並按 Save，重新整理後仍看到最後保存內容。
2. 使用者修改 Draft 後按 Discard，畫面回到已保存內容。
3. 使用者按 Reset 後重新整理但未保存，畫面仍顯示 Reset 前的 persisted config。
4. 使用者輸入無效資料，修正前不能保存且 Draft 不遺失。
5. Persisted payload 損毀或 storage 寫入失敗時，使用者看到明確提示且仍可繼續調整。

## 預估開發點數（Story Points）

- 點數：8
- 維度理由：實作面包含 canonical state、非持久 Draft、三種狀態操作與 hydration UI；狀態與契約新增版本化 persisted payload 及完整驗證；整合面使用 Zustand persistence 與 browser storage；驗證工作量包含重新整理、損毀 payload、寫入失敗及三種操作語意。
- 拆卡判定：以 Persistence 路徑從 Epic 垂直拆出；所有行為共同服務「提交及復原單一卡片設定」，8 點且可在單一 Story 內 demo，不需再拆。

## 參考資料

- ../../docs/discuss/merchant-card-showroom-mvp.md
- 01-display-and-edit-single-card.md

## 品質檢核清單

- [x] 必填章節齊全。
- [x] 5 組 AC 均可二元判定。
- [x] 每條 AC 可對應 UI、E2E 或 storage 行為驗證。
- [x] 操作、狀態、storage 類型、商品、圖片與 badges 已列舉。
- [x] 四類邊界及權限行為完整。
- [x] Out of Scope 非空。
- [x] 已完成四維估點及拆卡判定。
- [x] 非缺陷需求，不適用重現步驟與修復完成定義。
