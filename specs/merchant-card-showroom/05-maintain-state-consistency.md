# P1 Story 5：維持編輯、儲存與跨頁狀態一致

- 父 Epic：Merchant Card Showroom
- 優先度：P1-2
- 依賴：P0 Story 2、P0 Story 3、P1 Story 4

## 使用者角色（Persona）

- 角色：同時使用 Showroom 與 Sample HTML 驗證商品卡的前端評估者／商品卡設計開發者
- 目標：清楚區分未保存 Draft 與 canonical persisted config，安全處理切卡、離頁及其他分頁送來的更新。
- 前置狀態：三筆商品可分別調整及保存，Sample HTML 可載入 persisted config。

## 背景與動機（Why）

當 Showroom 同時存在 Draft、已保存設定與多個瀏覽器頁面時，任何不明確的覆蓋順序都可能造成資料遺失或不同畫面顯示不一致。本 Story 定義完整 State Consistency Strategy，讓使用者能預測 Save、Discard、Cancel、離頁及跨頁更新的結果。

## In Scope

- Draft 與 persisted config 不同時顯示「有未保存的變更」。
- Dirty 狀態切換商品時顯示 Save／Discard／Cancel 對話框。
- Save、Discard、Cancel 三條切卡路徑具有明確結果與焦點管理。
- Dirty 狀態離開或重新整理 Showroom 時顯示 browser unload warning。
- 同來源其他分頁成功 Save 後，已開啟的 Showroom 與 Embed 收到更新。
- 跨頁同步只套用成功保存且通過驗證的完整 config，不同步 Draft。
- 目前商品有本地 Dirty Draft 時，外部更新 canonical state 但不覆蓋本地 Draft，並顯示衝突提示。
- Storage event 觸發 Zustand persistence rehydration；應用程式不直接讀寫或解析 localStorage。
- 無效外部 payload 不替換目前有效狀態。

## Out of Scope

- 跨 origin、跨瀏覽器或跨裝置同步。
- 多使用者協作、版本歷史與自動衝突合併。
- 以時間戳或欄位層級合併兩份 Draft。
- 背景自動保存。
- Service Worker、BroadcastChannel 或後端同步。
- 第三方 iframe storage policy fallback。
- 自訂 browser unload warning 文案。

## 驗收標準（AC）

AC-01: Dirty 狀態可辨識且不污染 persisted config
  Given 使用者修改目前商品的任一 Draft 欄位
  When Draft 與 canonical persisted config 不同
  Then Showroom 顯示「有未保存的變更」，預覽顯示 Draft，Showroom 重新整理前的 Embed 仍顯示 persisted config；Save 或 Discard 完成後 Dirty 提示消失。

AC-02: Dirty 切卡提供三條明確路徑
  Given 目前商品有未保存 Draft
  When 使用者選取另一筆商品
  Then 顯示具 Save、Discard、Cancel 的對話框並將焦點移入對話框；選擇 Save 時，驗證成功後保存目前商品並切換，驗證失敗時保留對話框、Draft 與目前商品；選擇 Discard 時捨棄 Draft 後切換；選擇 Cancel 時關閉對話框並保留目前商品與 Draft。

AC-03: Dirty 離頁觸發瀏覽器警告
  Given 目前商品有未保存 Draft
  When 使用者重新整理、關閉分頁或離開 Showroom
  Then browser unload warning 被觸發；Given 沒有未保存 Draft，When 執行相同行為，Then 不觸發該警告。

AC-04: 成功保存的設定跨頁同步
  Given Showroom A、Showroom B 與 Sample HTML 已在同一 origin 開啟，且 Showroom B 目前商品沒有 Dirty Draft
  When Showroom A 成功保存任一已知商品
  Then Showroom B 的 canonical state、對應預覽與調整欄位，以及 Sample HTML 中對應 Embed，在不重新整理頁面的情況下顯示同一筆完整 persisted config；其他商品與未保存 Draft 不被同步。

AC-05: 外部更新不得覆蓋 Dirty Draft 或有效狀態
  Given Showroom B 目前商品有 Dirty Draft
  When Showroom A 保存同一商品
  Then Showroom B 保留本地 Draft 與 Dirty 狀態、更新該商品 canonical persisted config，並顯示「其他分頁已更新此商品」；使用者在 Showroom B 按 Discard 後回到外部最新版本；若收到無效、版本不符或不完整 payload，則 canonical state 與 Draft 都保持不變並顯示同步失敗提示。

## 邊界條件

| 維度 | 條件 | 預期行為 |
| --- | --- | --- |
| 空值／缺漏 | 沒有 Dirty Draft | 切卡不顯示對話框，離頁不觸發 unload warning |
| 空值／缺漏 | 外部更新不含目前商品 | 只更新 payload 中通過驗證的已知商品，不改變目前 Draft |
| 格式 | 外部 payload 無法解析、版本不符或資料不完整 | 忽略更新並顯示同步失敗提示 |
| 格式 | 外部 payload 含未知商品或 variant | 忽略未知成員，已知且有效的其他成員依完整 payload 規則載入 |
| 上限／規模 | 同一時間連續收到多次有效更新 | canonical state 依 storage event 到達順序採用最後成功 rehydrate 的完整版本 |
| 上限／規模 | Dirty 衝突數量 | 每筆商品各自判定；只為目前 Dirty 商品顯示衝突提示 |
| 錯誤路徑 | Dirty 對話框 Save 驗證失敗 | 不切卡、不關閉對話框、不遺失 Draft |
| 錯誤路徑 | Rehydration 發生錯誤 | 保留目前有效 canonical state 與 Draft，顯示同步失敗提示 |
| 權限／角色 | 未登入的同來源頁面 | 可透過相同 browser storage 同步，不要求帳號 |

## 列舉完整性清單

| 成員 | 在範圍內？ | 備註 |
| --- | ---: | --- |
| Dirty indicator | ✅ | Draft 與 persisted config 不同時顯示 |
| Save | ✅ | 保存後切卡 |
| Discard | ✅ | 捨棄後切卡或回復外部最新版本 |
| Cancel | ✅ | 保留目前商品與 Draft |
| Browser unload warning | ✅ | Dirty 時觸發 |
| Showroom 頁面同步 | ✅ | 同來源 storage event |
| Imperative Embed 同步 | ✅ | Story 3 Embed |
| 未保存 Draft 同步 | ❌ | 永不跨頁同步 |
| demo-food | ✅ | 同步成員 |
| demo-health | ✅ | 同步成員 |
| demo-fashion | ✅ | 同步成員 |
| 跨 origin 同步 | ❌ | 不支援 |
| 跨裝置同步 | ❌ | 不支援 |
| 自動衝突合併 | ❌ | 不支援 |
| BroadcastChannel | ❌ | 不在本 Story |

未列出的對話框操作、同步通道、商品或衝突策略均視為本 Story 範圍外。

## 驗收場景

1. 使用者修改食品商品後選取保健商品，分別驗證 Save、Discard、Cancel 三條路徑。
2. 使用者在 Dirty 與 Clean 狀態分別重新整理頁面，確認只有 Dirty 狀態觸發 browser warning。
3. 使用者同時開啟兩個 Showroom 與 Sample HTML，在其中一頁 Save，其他 Clean 頁面與 Embed 即時更新。
4. 使用者保留本地 Dirty Draft，再由另一頁保存同一商品，確認 Draft 不被覆蓋，Discard 後回到外部最新版本。
5. 使用者觸發無效外部 payload，現有有效狀態保持不變並出現同步失敗提示。

## 預估開發點數（Story Points）

- 點數：8
- 維度理由：實作面涵蓋 dirty indicator、可存取對話框、beforeunload 與多頁同步；狀態與契約需處理 Draft、canonical state、外部更新及衝突優先序；整合面串接 Zustand persistence rehydration、storage event、Showroom 與 iframe；驗證工作量包含三條對話框路徑、兩分頁加 Embed、衝突與錯誤 payload E2E。
- 拆卡判定：以 Rules 與 Paths 手法從 Epic 拆出狀態一致性切片；所有行為共同定義 Draft 與 canonical state 的優先序，移除任一部分都無法完整 demo 一致性策略，8 點且不需再拆。

## 參考資料

- ../../docs/discuss/merchant-card-showroom-mvp.md
- 02-persist-and-restore-card-config.md
- 03-load-card-from-sample-html.md
- 04-browse-and-select-multiple-cards.md

## 假設清單

- Storage event 的同步順序採瀏覽器事件到達順序，不另加時間戳排序。
- 外部更新同一 Dirty 商品時，local Draft 優先保留，canonical state 仍更新供後續 Discard 使用。
- Browser unload warning 使用瀏覽器原生提示，不要求自訂文字。

## 品質檢核清單

- [x] 必填章節齊全。
- [x] 5 組 AC 均可二元判定並可對應多頁 E2E 驗證。
- [x] 對話框操作、同步頁面、商品與衝突策略已完整列舉。
- [x] 空值、格式、上限、錯誤路徑與權限均有明確行為。
- [x] Out of Scope 非空。
- [x] 已完成四維估點及拆卡判定。
- [x] 非缺陷需求，不適用重現步驟與修復完成定義。
