# Merchant Card Showroom 目前優先取捨

> 狀態：目前先完成 Epic、單卡持久化基本閉環，再進入 Sample HTML 載入契約
> 
> 相關規格：`specs/merchant-card-showroom/00-epic-merchant-card-showroom.md`、`specs/merchant-card-showroom/02-persist-and-restore-card-config.md`、`specs/merchant-card-showroom/03-load-card-from-sample-html.md`

## 決策

目前先處理以下規格：

1. `00-epic-merchant-card-showroom.md`：建立整體範圍、優先順序、依賴樹與後續 Story 的共同約束。
2. `02-persist-and-restore-card-config.md`：先完成單一卡片的 Zustand persistence 基本閉環，讓 Save 後能在重新整理後復原。
3. `03-load-card-from-sample-html.md`：接著定義外部 consumer 如何透過 Sample HTML 與 `MomoCard.mount()` 載入商品卡。

這代表目前先把「整體 roadmap」與「單卡保存」做成可驗證的基本閉環；不代表跳過 Story 1 的實作依賴。Story 3 仍須在單卡展示、編輯與持久化能力完成後，才能進入完整實作與驗收。

## 為什麼現在先做

- Epic 規格先固定 P0、P1、P2 的交付順序，避免後續實作被多種 card variant、Web Component 或跨頁同步牽著走。
- 先完成單卡 Save 與重新整理復原，讓後續 Sample HTML 有明確且可共用的 canonical config 來源。
- Sample HTML 是基本需求的一部分，先固定 `MomoCard.mount()`、`destroy()`、`cardId` 與 iframe 邊界，能讓 Showroom renderer、persisted config 與外部 consumer 使用同一份契約。

## 暫時不做的範圍

為了維持目前切片的可交付性，先不投入以下工作：

- 第二種 consumer API，例如 declarative Web Component。
- 多筆商品同頁嵌入、跨分頁即時同步與 host event callback。
- npm／ESM package、獨立 library build pipeline 與跨來源 persistence fallback。
- Recommendation、History Compact 等其他 card variant 的完整實作。
- 完整 Story 2 的 Discard、Reset、欄位錯誤提示與 storage 寫入失敗提示。

## 代價與補償

先做最小 persistence 的代價，是目前只保存最後合法 preview，尚未提供完整的 Discard、Reset、欄位錯誤提示與 storage 寫入失敗提示。補償方式是先固定 persistence key、schemaVersion 與 canonical config 來源，後續可在不改變 Sample HTML 契約的前提下補齊 Story 2 的完整 AC。

## 重新評估條件

完成 Story 1、2 的基本閉環並確認 renderer 與 persisted config 可被共用後，再進入 Story 3 的實作。若 Sample HTML 的單一 imperative API 已通過 P0 驗收，才評估是否投入 Web Component、多實例或跨頁同步等後續能力。
