# Merchant Card Showroom

以 Next.js、TypeScript 與 Tailwind CSS 開發的 momo 商品卡展示工具。使用者可以預覽與調整商品卡，並將設定保存在瀏覽器中；專案也規劃提供 sample HTML，示範如何從外部頁面載入商品卡。

詳細的 MVP 設計與決策請參考 [Merchant Card Showroom MVP 討論紀錄](docs/discuss/merchant-card-showroom-mvp.md)；目前的優先取捨請參考 [Merchant Card Showroom 目前優先取捨](docs/discuss/merchant-card-showroom-prioritization.md)。

## 啟動專案

環境需求：Node.js 20.9.0 以上與 npm。

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 即可查看專案；API 文件位於 [http://localhost:3000/api-doc](http://localhost:3000/api-doc)。

## 常用指令

```bash
npm run build         # 建立 production build
npm start             # 啟動 production server
npm run lint          # 執行 ESLint
npm run generate:api  # 依 OpenAPI 規格產生 API client
npm run test:e2e      # 執行 Playwright E2E 測試
```

## Spex

本專案使用 [Spex](https://github.com/bibirock/spex) 管理規格驅動開發（SDD）流程，涵蓋規格、規劃、任務拆解、實作與驗收。

Spex 設定與 skills 位於 `.codex/`，進行中的規格存放於 `specs/`。

## 功能取捨與開發順序

目前以以下三份規格作為主功能範圍：

| 優先 | 規格 | 功能 | 取捨 |
| --- | --- | --- | --- |
| P0-1 | [01 展示並調整單一商品卡](specs/merchant-card-showroom/01-display-and-edit-single-card.md) | 商品卡預覽、Editor、合法輸入即時更新與響應式操作 | 先完成一種 `search-grid` variant，不做多卡清單或其他 card variant |
| P0-2 | [02 保存與復原商品卡設定](specs/merchant-card-showroom/02-persist-and-restore-card-config.md) | 使用 Zustand persist，在 Save 後保存並於重新整理後復原 | 目前先做單一 `demo-food` 與最後合法設定；完整 Discard、Reset、欄位錯誤與 storage failure UX 後補 |
| P0-3 | [03 從 Sample HTML 載入商品卡](specs/merchant-card-showroom/03-load-card-from-sample-html.md) | `/sample.html`、`MomoCard.mount()`、iframe Embed 與 `destroy()` | 先提供單一 imperative API，不做 Web Component、多實例或跨頁同步 |

雖然需求列表先聚焦 01、03、02，實際實作順序採 `01 → 02 → 03`：Sample HTML 必須讀取 Story 2 已保存的 canonical config，不能直接依賴 editor draft。這樣可以先形成「展示／調整 → 保存 → 外部嵌入」的最小可展示閉環。

### 後續可代辦任務

完成主功能後，依賴順序如下：

1. **補齊 Story 2 完整驗收**：加入 Discard、Reset、完整欄位驗證、損毀 payload 提示、storage 寫入失敗處理與對應 E2E。
2. **實作 Story 4：瀏覽並選取多筆商品卡**：加入 `demo-food`、`demo-health`、`demo-fashion` 清單，並讓每張卡片獨立保存、Discard、Reset。
3. **實作 Story 5：維持狀態一致性**：加入 dirty indicator、Save／Discard／Cancel 切卡流程、離頁警告、跨分頁 Showroom 與 Embed 同步。
4. **實作 Story 6：Schema 與 Variant 擴充**：新增 `recommendation` variant，以 discriminated union 與 registry 驗證可擴充邊界；不引入動態 plugin 或 schema migration。

暫不列入代辦的項目包括真實 momo API、後端或跨裝置同步、npm／ESM package、完整購物車流程，以及 History Compact／Live 等非必要 variant。完整決策背景請參考 [MVP 討論紀錄](docs/discuss/merchant-card-showroom-mvp.md) 與 [目前優先取捨](docs/discuss/merchant-card-showroom-prioritization.md)。
