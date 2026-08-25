---
id: 20260825-load-card-from-sample-html
type: User Story
title: 從 Sample HTML 載入商品卡
state: in-progress
assignedTo: null
iterationPath: null
---

## 描述

# P0 Story 3：從 Sample HTML 載入商品卡

## 使用者角色（Persona）

身為前端開發者／評估者，我希望在既有頁面以一段 HTML 與 `MomoCard.mount()` 載入商品卡，驗證元件可以被外部頁面使用。

## 背景與動機（Why）

Showroom 可調整商品卡，但仍需一個接近真實嵌入情境的 Sample HTML，確認公開 loader、iframe renderer 與已儲存設定可被外部頁面使用。

## In Scope

- 提供 `/sample.html`，展示完整 `MomoCard.mount()` 程式碼與實際嵌入結果。
- 提供 `/momo-card.js` script loader 與公開 `MomoCard.mount(target, options)` imperative API。
- 支援 `cardId: "demo-food"`，回傳具 `destroy()` 的 handle。
- Embed 顯示最後成功儲存的 demo-food 設定；沒有持久化設定時使用預設值。
- Showroom 與 Embed 共用同一個商品卡 renderer。
- 未知 cardId 顯示明確錯誤卡，不 fallback 到其他商品。
- iframe 具 meaningful title、lazy loading 與 responsive width。

## 技術計畫約束

- Showroom 與 Embed 必須共用 renderer，不複製 UI。
- Embed 透過 Zustand persisted store 讀取 canonical config，不得直接呼叫 `localStorage.getItem/setItem/removeItem`。
- Loader 必須由自身 script URL 推導 service origin，不得 hardcode localhost、port 或 domain。

## Out of Scope

- Web Component、第二種 API 風格、未儲存 draft、跨 tab sync、多商品／多 instance、跨 origin persistence、postMessage 高度同步與事件、npm/ESM package、host custom internal styles。

## 驗收標準

- AC01：`/sample.html` 顯示與 `MomoCard.mount()` 對應的程式碼，target 與 `cardId` 一致，且實際顯示一個 demo-food instance。
- AC02：Showroom 儲存後重新載入 `/sample.html`，顯示最後成功儲存的完整設定；沒有儲存設定時顯示預設設定，不顯示未儲存 draft。
- AC03：從任意 host origin 載入 `/momo-card.js` 後，`MomoCard.mount("#imperative-demo", { cardId: "demo-food" })` 在 target 下建立指向 script origin `/embed/demo-food` 的 responsive、lazy iframe，且 title 有意義。
- AC04：mount 回傳 handle 的 `destroy()` 會移除 iframe；未知 cardId 顯示 `找不到商品：<cardId>`，不得 fallback；空 cardId 顯示 `請提供商品 ID`，缺少 target 顯示 `找不到嵌入目標`。
- AC05：390px viewport 下可用鍵盤瀏覽，無水平捲軸，iframe/card 可讀，且無 console/page error。

## 邊界條件

- 空 cardId、缺少 target、invalid selector、未知 cardId、single instance、narrow container、invalid persisted payload fallback、圖片載入失敗 fallback、未登入可使用。

## 驗收場景

1. 開啟 `/sample.html`，看到程式碼與一個 demo-food 商品卡。
2. 在 Showroom 修改並儲存，再重新載入 Sample HTML，看到儲存後設定。
3. 以 imperative API mount，再 destroy，確認 iframe 建立與移除。
4. 使用未知／空 cardId 或無效 target，看到指定錯誤訊息且頁面不崩潰。

## 預估開發點數

8

## 假設

- imperative API 為唯一公開 API；Sample 與 Embed 為 same-origin；跨 tab sync 留待後續 Story。

## 驗收範圍完整性

- 需涵蓋 In Scope、AC、邊界條件與上述四個驗收場景。

## 驗收標準（補充）

- E2E 覆蓋 `/sample.html`、持久化設定、loader mount/destroy、錯誤卡、390px 鍵盤與 console/page error。
