---
name: spex-roadmap
description: >-
  規格索引／產品 roadmap 檢視器。重建並顯示跨資料夾的規格總覽（specs/INDEX.md）：全部卡片、隸屬 Epic、目前階段、估點、最後更新，
  讓「有哪些規格待執行、各自卡在哪一關」一眼可見。唯讀工具——只重寫衍生視圖 specs/INDEX.md，不改任何卡片內容。
  前置：無（specs/ 有卡片即可）。後續：依索引挑卡片走 spex-plan / spex-implement。
---

# Spex: Roadmap — 規格索引檢視器

## Overview

**唯一職責：把散在 `specs/<日期>/<slug>/` 各資料夾的卡片彙總成一份可讀的 roadmap 總覽，並講給使用者聽。**

這是**純檢視工具**：不建卡、不改規格、不推進任何階段。唯一會寫入的檔案是 `specs/INDEX.md` 本身——那是**衍生視圖**，每次全量重算覆寫，刪掉也不損失任何資訊（事實來源永遠是各卡自己的 `item.md` 與階段留言檔）。

## When to Use

- ✅ 想知道「目前有哪些規格待執行、各自進行到哪一關」
- ✅ 規劃下一步要做哪張卡（挑 roadmap 裡的待辦）
- ✅ 建完卡／寫完規格後，想確認新卡有正確進到總覽
- ❌ 要改卡片內容 / 推進階段 → 走對應的 `spex-*` skill，不是本 skill
- ❌ 要封存已完成卡片 → `LOCALFILE.archiveDoneSpecs()`（見 local-file adapter）

## Adapter 引用

讀取 `.codex/rules/sdd-workflow.md` 的「Tracker Adapter」一行決定當前 adapter（依 [adapters/README.md 的 grep+offset SOP](../../reference/adapters/README.md#skills-引用-adapter-規範) 只讀該節）。

| adapter | 動作 |
| --- | --- |
| `local-file` | 走下方流程，呼叫 [`LOCALFILE.rebuildIndex()`](../../reference/adapters/local-file.md) |
| 其他（`ado` 等） | **明確告知使用者**：`rebuildIndex` 目前只有 local-file adapter 實作，其他 adapter 尚無對應擴充操作；建議改用該 tracker 原生的看板／查詢功能。**不得**自行拼湊等效查詢或臆造索引內容 |

## Process

### 步驟 1：重建索引

```bash
bash .codex/reference/adapters/scripts/rebuild-spec-index.sh
```

腳本冪等、可隨時重跑，退出碼固定 0（報告型工具）。找不到 `specs/` 會以非 0 結束並印原因——此時**如實回報，不要自行補資料**。

### 步驟 2：讀回索引

`Read` `specs/INDEX.md`。

### 步驟 3：整理回報

用**索引裡真實存在的內容**組出摘要（不得補充索引沒有的推測）：

- 卡片總數，以及進行中／待辦 vs 已完成的張數
- 各階段分布（例：規格已就緒 17 張、任務已拆分 1 張）
- **待辦重點**：依 Epic 分組列出進行中的卡片，標明階段與估點
- 附上 `specs/INDEX.md` 路徑供使用者自行開啟看完整表格

使用者若指定了關注範圍（某張 Epic、某個階段），只摘要該範圍，其餘略過。

## 階段判定的已知限制（回報時如實說明，不得掩蓋）

階段由「任務資料夾內存在哪些階段檔案」反推（完整優先序見 local-file adapter 的「階段判定表」）。兩個既有限制會影響索引準確度：

1. **「已完成」需人工設定**：目前沒有任何 skill 會自動把 `item.md` 的 `state` 改成 `done`，所以卡片即使實際做完，只要沒人工改欄位或封存，索引仍顯示其最後一個階段檔案對應的階段。
2. **看不到「已合併」**：合併一律由人類於平台 UI 執行，Spex 無從觀測；自動化能看到的最後訊號是「PR 已開」。

使用者若對某張卡的階段有疑問，據此說明成因，**不要**臆測該卡實際進度。

## Red Flags

- ❌ 修改任何 `item.md` / `spec.md` / 階段留言檔（本 skill 唯讀，只有 `specs/INDEX.md` 可被腳本覆寫）
- ❌ 手動編輯 `specs/INDEX.md`（它由腳本全量產生；要改內容改腳本或改來源卡片）
- ❌ 腳本失敗或找不到卡片時，憑記憶／推測捏造索引內容
- ❌ 把 `specs/INDEX.md` 當事實來源餵給其他 skill（該用 `TRACKER.readItem` / `findSpecComment`）
- ❌ 在非 local-file adapter 下假裝有等效索引

## Verification

- [ ] 已依規則檔確認當前 adapter；非 `local-file` 時已明示限制而非硬做
- [ ] 腳本實際執行過，回報內容全部來自 `specs/INDEX.md` 真實輸出
- [ ] 未改動任何卡片檔案（`git status` 僅 `specs/INDEX.md` 有異動）
- [ ] 使用者問到階段準確度時，已說明上述兩項已知限制

## Next Steps

→ 從索引挑出要推進的卡片，對該卡執行 `spex-plan`（Tier 分類 + 技術計畫）
→ 想批次推進多張卡 → `spex-schedule`
→ 已完成的卡片想從主列表移出 → `LOCALFILE.archiveDoneSpecs()`
