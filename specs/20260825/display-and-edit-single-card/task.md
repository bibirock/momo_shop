<!-- spex:entry seq=1 at=2026-08-25T18:05:42+08:00 -->

## [Spex] Task 完成

# 任務清單 — 展示並調整單一商品卡

> Tracker Item: 20260825-display-and-edit-single-card | 階段: Task | Tier: 2 | 日期: 2026-08-25
> 切片方式: 垂直
> 流程降級: 依使用者明示採速度優先，跳過 task challenge 與後續 selfcheck；不宣稱章戳或獨立驗收 PASS。
> 規格修正: 依使用者明示，AC-05 不驗收純鍵盤巡覽與 Tab 順序；保留 390px 響應式、操作與瀏覽器錯誤驗收。本修正取代舊 Plan 的鍵盤條件。

## 任務摘要

| Task ID | 名稱 | 等級 | 依賴 | 狀態 |
|---|---|---|---|---|
| T-001 | 顯示 demo-food 預設商品卡 | Vertical Slice | — | ⬜ |
| T-002 | 透過完整 Editor 即時更新合法設定 | Vertical Slice | T-001 | ⬜ |
| T-003 | 處理空值、非法輸入、長文與圖片失敗 | Vertical Slice | T-002 | ⬜ |
| T-004 | 完成 390px 響應式操作與瀏覽器錯誤驗收 | Vertical Slice | T-003 | ⬜ |

---

## T-001 — 顯示 demo-food 預設商品卡

**等級**: Vertical Slice | **依賴**: — | **對應 AC**: AC-01

### 描述

使用者開啟首頁後，從 demo-food 預設設定一路經過型別安全的 renderer，在 Showroom 預覽區看到完整 search-grid 商品卡；同時建立後續 Editor 所需的最小資料契約，不加入 persistence、registry 或多商品狀態。

### 參考圖片（來自父任務）

- `docs/assets/merchant-card-showroom/search-card-food.png` — demo-food 商品卡的內容層級、價格、銷量、評論與 badge 視覺參考。

### 包含檔案

1. `components/product-card/product-card.types.ts` — 定義單一 search-grid config、badge 與圖片選項型別。
2. `components/product-card/product-card.defaults.ts` — 提供 demo-food 預設值及三種圖片選項。
3. `components/product-card/ProductCard.tsx` — 以可序列化 config 呈現純展示商品卡。
4. `components/product-card/ProductCardShowroom.tsx` — 建立最小 Client Component 預覽容器。
5. `app/page.tsx` — 將 Showroom 掛載至使用者可見首頁。
6. `app/layout.tsx` — 更新繁體中文語系與頁面 metadata。
7. `app/globals.css` — 建立 Showroom 與商品卡的基礎版面及視覺樣式。
8. `public/merchant-card-showroom/search-card-food.png` — 提供食品商品靜態圖片。
9. `public/merchant-card-showroom/search-card-health.png` — 提供後續 Editor 的保健商品圖片選項。
10. `public/merchant-card-showroom/search-card-fashion.png` — 提供後續 Editor 的服飾商品圖片選項。
11. `tests/e2e/merchant-card-showroom.e2e.ts` — 新增 AC-01 的失敗測試與瀏覽器錯誤監聽。
12. `tests/e2e/home.e2e.ts` — 移除不再適用的 Create Next App 範例驗收。

### TDD 流程

🔴 **Red** — 先新增 Playwright 案例 `AC-01: 顯示 demo-food 預設商品卡`，斷言圖片 accessible name、促銷、商品名稱、`$999`、`$1,290`、銷量、`5,208`、速與登記 badges；執行 `npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-01"`，確認因 Showroom 尚未存在而失敗。

🟢 **Green** — 建立最小型別、defaults、ProductCard、Showroom 與首頁整合；複製三張靜態資產。再次執行 `npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-01"`，確認測試 PASS。

🔵 **Refactor** — 移除 Create Next App 範例內容與測試，保持 renderer 只接收 config，清理重複格式化邏輯；再次執行 AC-01 E2E、ESLint 與 TypeScript，確認測試仍 PASS。

### AC

- [ ] AC-01：首次載入呈現 demo-food 全部指定內容；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-01"`。
- [ ] ProductCard 不存取 Zustand、localStorage 或路由；驗收指令：`rg -n "zustand|localStorage|useRouter|usePathname" components/product-card/ProductCard.tsx` 預期無輸出。
- [ ] 型別安全且無裸 `any`；驗收指令：`/Users/chenzhiwen/Desktop/momo_shop/node_modules/.bin/tsc -p /Users/chenzhiwen/Desktop/momo_shop/tsconfig.json --noEmit --incremental false`。
- [ ] 程式碼符合 lint；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run lint`。

### 驗證

依序執行 AC-01 Playwright、TypeScript 與 ESLint 指令；Red 階段保留一次預期失敗證據，Green／Refactor 階段須全部通過。

---

## T-002 — 透過完整 Editor 即時更新合法設定

**等級**: Vertical Slice | **依賴**: T-001 | **對應 AC**: AC-02, AC-03

### 描述

使用者在具 accessible label 的 Editor 操作圖片、文字、價格、銷量、評論、四種 badges、accent color 與圓角，合法輸入立即更新同頁預覽且不 reload；本切片只管理不持久化的 local draft。

### 參考圖片（來自父任務）

- `docs/assets/merchant-card-showroom/search-card-food.png` — 欄位與預覽內容對應基準。
- `docs/assets/merchant-card-showroom/search-card-health.png` — 保健圖片選項切換結果。
- `docs/assets/merchant-card-showroom/search-card-fashion.png` — 服飾圖片選項切換結果。

### 包含檔案

1. `components/product-card/ProductCardEditor.tsx` — 提供 11 組欄位與四個 badge checkbox。
2. `components/product-card/product-card.validation.ts` — 驗證數字、色彩與圓角並產生合法預覽更新。
3. `components/product-card/ProductCardShowroom.tsx` — 持有 Editor 原始值與最後合法 preview config。
4. `components/product-card/ProductCard.tsx` — 即時呈現合法 config 更新。
5. `app/globals.css` — 建立 Editor 分組、控制項與預覽雙欄樣式。
6. `tests/e2e/merchant-card-showroom.e2e.ts` — 新增 AC-02、AC-03 的欄位與即時更新案例。

### TDD 流程

🔴 **Red** — 先新增 `AC-02: Editor 欄位完整` 與 `AC-03: 合法設定即時更新預覽` 案例，逐一透過 label 操作 14 個控制項並斷言頁面未 reload；執行 `npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-02|AC-03"`，確認因 Editor 尚未存在而失敗。

🟢 **Green** — 實作受控 Editor、驗證函式與 Showroom local state，使合法欄位更新立即進入 renderer；再次執行 `npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-02|AC-03"`，確認測試 PASS。

🔵 **Refactor** — 將欄位更新集中於具型別的 handler，移除重複轉型與未使用抽象；再次執行 AC-02／AC-03 E2E、TypeScript 與 ESLint，確認測試仍 PASS。

### AC

- [ ] AC-02：11 組欄位皆有 accessible label，badge 群組包含速、折價券、登記、贈品；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-02"`。
- [ ] AC-03：14 個控制項的合法變更不 reload 即反映在預覽；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-03"`。
- [ ] Draft 不持久化且未加入 Save／Discard／Reset；驗收指令：`rg -n "persist|localStorage|Save|Discard|Reset" components/product-card` 預期無持久化或狀態操作實作。
- [ ] 通過型別與 lint；驗收指令：`/Users/chenzhiwen/Desktop/momo_shop/node_modules/.bin/tsc -p /Users/chenzhiwen/Desktop/momo_shop/tsconfig.json --noEmit --incremental false && npm --prefix /Users/chenzhiwen/Desktop/momo_shop run lint`。

### 驗證

依序執行 AC-02／AC-03 Playwright、TypeScript 與 ESLint；Red 階段失敗原因必須是缺少對應 Editor 行為，Green／Refactor 階段須全部通過。

---

## T-003 — 處理空值、非法輸入、長文與圖片失敗

**等級**: Vertical Slice | **依賴**: T-002 | **對應 AC**: AC-03, AC-04

### 描述

使用者輸入空白可選內容、非法數字／色彩／圓角、超長文字或遇到圖片載入失敗時，Editor 保留輸入脈絡，預覽只使用最後合法值並保持可辨識、不破版。

### 參考圖片（來自父任務）

- `docs/assets/merchant-card-showroom/search-card-food.png` — 正常圖片比例與文字區塊配置基準。

### 包含檔案

1. `components/product-card/product-card.validation.ts` — 完成非負安全整數、`#RRGGBB` 與 0–24 圓角邊界。
2. `components/product-card/ProductCardShowroom.tsx` — 分離原始 Editor 值與最後合法 preview config。
3. `components/product-card/ProductCardEditor.tsx` — 保留非法原始值並提供可辨識的輸入狀態。
4. `components/product-card/ProductCard.tsx` — 處理空值 fallback、可選區塊隱藏及圖片失敗狀態。
5. `app/globals.css` — 實作商品名稱兩行、促銷一行截斷與卡片 overflow 防護。
6. `tests/e2e/merchant-card-showroom.e2e.ts` — 新增空值、非法輸入、長文及圖片 request 失敗案例。

### TDD 流程

🔴 **Red** — 先新增 `AC-03: 非法設定不污染預覽`、`AC-04: 空值與長文不破版`、`AC-04: 圖片失敗顯示 fallback` 案例；執行 `npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "非法設定|空值與長文|圖片失敗"`，確認因邊界處理尚未完成而失敗。

🟢 **Green** — 實作合法 preview gate、空名稱／alt fallback、可選區塊條件渲染、文字截斷及圖片 error fallback；再次執行同一組 Playwright 案例，確認測試 PASS。

🔵 **Refactor** — 集中格式驗證與 fallback 命名，確保 invalid input 不改寫使用者輸入也不滲入 ProductCard；再次執行 AC-03／AC-04 E2E、TypeScript 與 ESLint，確認測試仍 PASS。

### AC

- [ ] AC-03：非法數字、色彩與圓角不套用，預覽保留各欄位上一個合法值；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "非法設定"`。
- [ ] AC-04：空 promotion、originalPrice、badges 不渲染專用佔位；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "空值與長文"`。
- [ ] AC-04：商品名稱最多兩行、促銷最多一行且卡片內容不超出寬度；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "空值與長文"`。
- [ ] 圖片 request 失敗時顯示有效替代文字與不破版 fallback；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "圖片失敗"`。
- [ ] 通過型別與 lint；驗收指令：`/Users/chenzhiwen/Desktop/momo_shop/node_modules/.bin/tsc -p /Users/chenzhiwen/Desktop/momo_shop/tsconfig.json --noEmit --incremental false && npm --prefix /Users/chenzhiwen/Desktop/momo_shop run lint`。

### 驗證

依序執行非法設定、空值／長文、圖片失敗 Playwright 案例及靜態檢查；Red 階段失敗原因須對應缺少邊界行為，Green／Refactor 階段須全部通過。

---

## T-004 — 完成 390px 響應式操作與瀏覽器錯誤驗收

**等級**: Vertical Slice | **依賴**: T-003 | **對應 AC**: AC-05

### 描述

使用者在 390px viewport 檢視並操作完整 Showroom 時，預覽與 Editor 依序堆疊、頁面沒有水平捲動，且操作過程不產生 console error 或 uncaught page error；依使用者修正，本任務不驗收純鍵盤巡覽與 Tab 順序。

### 參考圖片（來自父任務）

- 無；本任務驗收 Showroom 響應式布局，不要求像素級重製商品參考圖。

### 包含檔案

1. `components/product-card/ProductCardShowroom.tsx` — 確保窄螢幕 DOM 順序為預覽後 Editor。
2. `components/product-card/ProductCardEditor.tsx` — 確保控制項可在 390px 寬度操作。
3. `app/globals.css` — 完成單欄堆疊、`min-width` 與 overflow 防護。
4. `tests/e2e/merchant-card-showroom.e2e.ts` — 新增 390px viewport、操作、scrollWidth 與瀏覽器錯誤案例。

### TDD 流程

🔴 **Red** — 先新增 `AC-05: 390px 可操作且無水平溢出` 案例，設定 viewport 390px、操作代表性欄位、斷言預覽位於 Editor 前、`document.scrollWidth <= window.innerWidth` 且錯誤陣列為空；執行 `npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-05"`，確認因響應式版面尚未完成而失敗。

🟢 **Green** — 完成窄螢幕單欄堆疊、寬度與 overflow 限制；再次執行 `npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-05"`，確認測試 PASS。

🔵 **Refactor** — 移除重複 breakpoint 規則並確認桌面版面未回歸；再次執行完整 Playwright、TypeScript、ESLint 與 production build，確認測試與驗證全部 PASS。

### AC

- [ ] AC-05：390px 下預覽與 Editor 依序顯示且代表性欄位可操作；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-05"`。
- [ ] AC-05：390px 下 `document.scrollWidth <= window.innerWidth`；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-05"`。
- [ ] AC-05：操作過程 console error 與 uncaught page error 數量均為 0；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e -- --grep "AC-05"`。
- [ ] 全部驗證指令束通過；驗收指令：`npm --prefix /Users/chenzhiwen/Desktop/momo_shop run lint && /Users/chenzhiwen/Desktop/momo_shop/node_modules/.bin/tsc -p /Users/chenzhiwen/Desktop/momo_shop/tsconfig.json --noEmit --incremental false && npm --prefix /Users/chenzhiwen/Desktop/momo_shop run build && npm --prefix /Users/chenzhiwen/Desktop/momo_shop run test:e2e`。

### 驗證

執行 AC-05 Playwright 後再跑完整驗證指令束；Red 階段失敗原因須對應響應式缺口，Green／Refactor 階段須全部通過。

---

## 守則

| 守則 | 規則 |
|---|---|
| 垂直切片 | 每個任務都從使用者可觀察行為延伸到狀態、元件、樣式與 E2E，不拆水平層任務 |
| MVP | 不加入 persistence、Save／Discard／Reset、多商品、registry、Embed 或跨頁同步 |
| TDD | 每個切片必須留下 Red 預期失敗、Green 通過與 Refactor 後仍通過的指令證據 |
| 驗收修正 | 純鍵盤巡覽、Tab 順序、challenge 與 selfcheck 依使用者明示跳過，不得宣稱已驗收 |

challenge：SKIPPED（使用者明示功能／速度優先；無章可驗）
