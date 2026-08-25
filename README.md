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
