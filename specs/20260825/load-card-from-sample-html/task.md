<!-- spex:entry seq=1 at=2026-08-25T00:00:00+08:00 -->
## [Spex] Task 完成

> Tracker Item: 20260825-load-card-from-sample-html | 階段: Task | Tier: 2 | 日期: 2026-08-25
> 切片方式: 垂直 | challenge：依使用者要求跳過

## 任務摘要

| Task ID | 名稱 | 等級 | 依賴 | 狀態 |
|---|---|---|---|---|
| T-001 | 建立 persisted 商品卡設定契約 | Foundation Type | — | ⬜ |
| T-002 | Embed route 顯示 demo-food 與錯誤卡 | Vertical Slice | T-001 | ⬜ |
| T-003 | Sample loader mount/destroy 嵌入流程 | Vertical Slice | T-002 | ⬜ |
| T-004 | Showroom 儲存設定並由 Sample 還原 | Vertical Slice | T-001, T-003 | ⬜ |
| T-005 | Sample 嵌入流程窄螢幕與可及性驗收 | Vertical Slice | T-003, T-004 | ⬜ |

## 任務內容

- T-001：建立 `components/product-card/product-card-store.ts`、persisted config schema validation 與 default fallback；Red → Green → Refactor，驗證 persisted config E2E、lint、TypeScript。
- T-002：新增 `app/embed/[cardId]/page.tsx`，串接既有 `ProductCard` renderer 與 T-001 store；驗證 demo-food、unknown card、invalid payload fallback。
- T-003：新增 `public/sample.html` 與 `public/momo-card.js`，實作由 script origin 推導 iframe URL、mount/destroy、target/cardId 錯誤；驗證 sample、iframe 屬性、lifecycle、build。
- T-004：修改 `ProductCardShowroom` 加入 canonical save，驗證 Showroom save → Sample reload、draft 不外洩與既有 Showroom 回歸。
- T-005：補 390px keyboard、overflow、console/pageerror、圖片 fallback 的 E2E 與必要 CSS／回歸斷言。

## 依賴與 TDD 守則

- 依賴邊：T-001 → T-002、T-002 → T-003、T-001 → T-004、T-003 → T-004、T-003 → T-005、T-004 → T-005。
- 每張子卡均包含 Red → Green → Refactor，Green 與 Refactor 必須執行指定測試並確認 PASS。
- 僅實作 demo-food、單一 iframe、same-origin persisted config 與指定錯誤；不加入 Out of Scope 功能。

完整檔案與各任務 AC 見 `tasks/T-001.md` 至 `tasks/T-005.md`。
