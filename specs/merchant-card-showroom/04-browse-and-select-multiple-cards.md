# P1 Story 4：瀏覽並選取多筆商品卡

- 父 Epic：Merchant Card Showroom
- 優先度：P1-1
- 依賴：P0 Story 1、P0 Story 2

## 使用者角色（Persona）

- 角色：需要比較不同商品資料呈現效果的前端評估者／商品卡設計開發者
- 目標：從完整商品清單選取食品、保健或服飾商品，分別調整並保存各自設定。
- 前置狀態：單一 search-grid 商品卡已可調整、驗證及保存。

## 背景與動機（Why）

完成單一卡片基本閉環後，Showroom 需要展示同一 variant 在不同內容、促銷與圖片密度下的表現。三筆商品必須各自保存，避免調整其中一筆時污染其他商品。

## In Scope

- 商品清單完整列出 demo-food、demo-health、demo-fashion。
- 首次進入預設選取 demo-food。
- 清單項目顯示可辨識的圖片、商品名稱與選取狀態。
- 選取商品後，預覽與調整介面顯示該商品目前的 Draft。
- 每筆商品具有獨立預設設定、Draft 與 persisted config。
- Save、Discard、Reset 只作用於目前選取商品。
- 重新整理後，三筆商品分別載入最後一次成功保存的設定。
- 有未保存變更時先阻擋直接切換，完整切卡對話框留待 Story 5。
- 桌面顯示清單、預覽、調整介面三區；390px viewport 依序堆疊。

## Out of Scope

- Recommendation、History Compact 或其他 variant。
- Dirty state 的 Save／Discard／Cancel 切卡對話框。
- 離頁與重新整理警告。
- 跨分頁即時同步。
- 批次編輯、批次保存或批次 Reset。
- 新增、刪除、排序商品。
- 搜尋、篩選、分頁或虛擬清單。
- Embed 同頁多商品實例。

## 驗收標準（AC）

AC-01: 商品清單完整且預設選取明確
  Given 使用者首次開啟沒有 persisted config 的 Showroom
  When 頁面完成 hydration
  Then 商品清單依序顯示 demo-food、demo-health、demo-fashion 三筆且沒有其他商品，demo-food 具有可辨識的已選取狀態，預覽與調整介面顯示 demo-food 預設設定。

AC-02: 選取商品同步更新介面
  Given 目前商品沒有未保存變更
  When 使用者選取 demo-health 或 demo-fashion
  Then 清單選取狀態、商品卡預覽及所有調整欄位在同一次選取流程中更新為目標商品設定，不混用前一筆商品內容。

AC-03: 三筆商品分別保存
  Given 使用者依序修改並保存兩筆以上商品
  When 使用者重新整理頁面並重新選取各商品
  Then 每筆商品分別呈現自己最後一次成功保存的完整設定，未被修改的商品維持原設定，且任一 Save 不改變其他商品的 persisted config。

AC-04: 未保存變更不被切卡遺失
  Given 目前商品 Draft 與 persisted config 不同
  When 使用者嘗試選取另一筆商品
  Then 保持目前選取商品與 Draft，顯示「請先保存或捨棄目前變更」，且不得切換預覽或調整介面；Story 5 完成前不顯示 Save／Discard／Cancel 對話框。

AC-05: 三區介面可用鍵盤操作
  Given viewport 寬度為 390px
  When 使用者只使用鍵盤依序瀏覽商品清單、選取商品及操作調整欄位
  Then 畫面依序堆疊商品清單、預覽、調整介面，選取控制具有可辨識名稱與狀態，頁面沒有水平捲動、console error 或 uncaught page error。

## 邊界條件

| 維度 | 條件 | 預期行為 |
| --- | --- | --- |
| 空值／缺漏 | 某商品沒有 persisted config | 該商品使用自己的預設設定，不影響其他商品 |
| 空值／缺漏 | persisted cards 為空 | 建立三筆預設商品並選取 demo-food |
| 格式 | persisted cards 含未知商品 ID | 不列入商品清單，三筆已知商品仍可使用 |
| 格式 | 單一商品 payload 無效 | 該商品回退自己的預設設定並顯示復原提示，其他有效商品保持不變 |
| 上限／規模 | 商品數量 | 固定三筆，不提供動態新增、刪除或分頁 |
| 上限／規模 | 同時選取數量 | 一次只能選取一筆商品 |
| 錯誤路徑 | 切換目標商品資料無效 | 目標商品回退預設值，仍完成切換並顯示復原提示 |
| 錯誤路徑 | 目前商品有未保存變更 | 阻擋切換並保留目前 Draft |
| 權限／角色 | 未登入使用者 | 可查看、選取與保存全部三筆商品 |

## 列舉完整性清單

| 成員 | 在範圍內？ | 備註 |
| --- | ---: | --- |
| demo-food | ✅ | 食品商品，預設選取 |
| demo-health | ✅ | 保健商品 |
| demo-fashion | ✅ | 服飾商品 |
| 其他商品 ID | ❌ | 不列入清單 |
| search-grid | ✅ | 三筆商品共用 variant |
| Recommendation Card | ❌ | Story 6 |
| History Compact Card | ❌ | 不在本 Story |
| 單選 | ✅ | 一次選取一筆 |
| 多選 | ❌ | 不提供 |
| Save 目前商品 | ✅ | 不影響其他商品 |
| Discard 目前商品 | ✅ | 不影響其他商品 |
| Reset 目前商品 | ✅ | 不影響其他商品 |
| 批次操作 | ❌ | 不提供 |
| 清單／預覽／調整介面 | ✅ | 三區介面 |
| 搜尋／篩選／分頁 | ❌ | 固定三筆不需要 |

未列出的商品、variant、選取方式或清單操作均視為本 Story 範圍外。

## 驗收場景

1. 使用者依序選取食品、保健與服飾商品，預覽及調整介面顯示各自內容。
2. 使用者修改並保存食品與服飾商品，重新整理後三筆商品仍維持各自設定。
3. 使用者在 Draft 尚未保存時嘗試切換商品，系統阻擋切換且不遺失 Draft。
4. 使用者在 390px viewport 以鍵盤完成三筆商品的選取與檢視，頁面沒有瀏覽器錯誤。

## 預估開發點數（Story Points）

- 點數：5
- 維度理由：實作面擴充既有單卡頁面為固定三筆清單與選取流程；狀態與契約把既有單筆 persisted config 擴充為三筆隔離資料；整合面沿用既有 renderer 與 Zustand persistence，沒有新外部服務；驗證工作量涵蓋三筆切換、資料隔離、缺漏資料與響應式 E2E。
- 拆卡判定：以 Data 手法從 Epic 拆出固定三筆商品切片；三筆使用相同流程且必須共同驗證資料隔離，合併為一張 5 點 Story 仍可獨立 demo，不需再拆。

## 參考資料

- ../../docs/discuss/merchant-card-showroom-mvp.md
- 01-display-and-edit-single-card.md
- 02-persist-and-restore-card-config.md

## 假設清單

- 商品清單固定依序為 demo-food、demo-health、demo-fashion。
- 重新整理後預設選取 demo-food，不持久化最後選取商品。
- Story 5 完成前，dirty 切卡採阻擋與提示，不先實作臨時確認對話框。

## 品質檢核清單

- [x] 必填章節齊全。
- [x] 5 組 AC 均可二元判定並可對應 E2E 或 persisted state 驗證。
- [x] 三筆商品、variant、選取方式與操作已完整列舉。
- [x] 空值、格式、上限、錯誤路徑與權限均有明確行為。
- [x] Out of Scope 非空。
- [x] 已完成四維估點及拆卡判定。
- [x] 非缺陷需求，不適用重現步驟與修復完成定義。
