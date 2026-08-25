# Tracker Adapter — Local File（無 Tracker 模式）

本文件為 Local File adapter，當 ADO MCP 不可用時作為 fallback。
所有 Spex 資料改以 Markdown 檔案寫入本機 `specs/` 目錄，可在無網路環境下完整執行。

**分支前綴：** `LOCAL-`

> 📖 **讀取本文件須遵守 [adapters/README.md `## Skills 引用 Adapter 規範`](./README.md#skills-引用-adapter-規範)**：skill 引用時只讀對應 `TRACKER.*` 章節，禁止整檔載入。

---

## 目錄結構

```
specs/
  20260808/                    ← 日期層＝建卡日（YYYYMMDD）
    feat-login/                ← 任務層＝任務名 slug
      item.md                  ← 卡片本體（readItem / getParentMetadata / 規格建卡）
      spec.md                  ← [Spex] Spec
      fixbug.md                ← [Spex] Fixbug
      plan.md                  ← [Spex] Plan
      task.md                  ← [Spex] Task
      task-children.md         ← [Spex] Task 子卡對照
      implement.md             ← [Spex] Implement
      escalation.md            ← implement F.5 escalation（兜底落點，見 addComment）
      verify.md                ← [Spex] Verify 完成 / Verify Fail（逐輪保留）
      pull-request.md          ← [Spex] PullRequest（本模式存 PR 草稿）
      schedule.md              ← [Spex] Schedule 完成
      schedule-branch.md       ← [Spex] Schedule 批次分支（僅錨點卡有）
      tasks/
        T-001.md               ← 子卡；childId 即 T-001
        T-002.md
      tasks-state.json         ← 子卡狀態 + 依賴邊
      attachments/             ← 選用；getParentImages 的來源
```

階段留言檔**平放在任務資料夾**（無 `comments/` 子層），方便直接瀏覽一張卡的完整歷程。

---

## ID 規則（雙向確定映射）

**ID ＝ `<YYYYMMDD>-<slug>`**，例：`20260808-feat-login`。

| 方向 | 規則 |
| --- | --- |
| ID → 路徑 | 以 `^(\d{8})-(.+)$` 拆解：group 1 為日期層、group 2 為任務層 → 先查 `specs/<日期>/<slug>/`；不存在則 fallback 查 `specs/_archive/<日期>/<slug>/`（封存區，見「擴充操作 › `LOCALFILE.archiveDoneSpecs()`」）；兩者皆不存在才視為卡片不存在 |
| 路徑 → ID | 日期層目錄名 + `-` + 任務層目錄名（`_archive/` 只是路徑上多出的根目錄層，不算日期層，組 ID 時忽略） |

- **不需 glob**：任何操作拿到 ID 都能直接組出路徑再讀檔（含上述兩步 fallback）。
- **唯一性由結構保證**：同名 slug 落在不同日期不會撞名，不必額外靠人工規矩維護唯一性。
- **slug 格式**：小寫英數字與連字號，不含空格與底線；不可以 8 位數字開頭（否則拆解會誤判日期層）。
- ID 一律**由檔案系統回讀**（建立目錄後回讀實際目錄名），不可由模型推算——見 `sdd-workflow.md`「ID 事實鐵則」。
- **封存 fallback 適用範圍**：本表的 ID → 路徑 fallback 是唯一事實來源。`readItem` / `findSpecComment` / `addComment` / `getParentMetadata` / `getParentImages` / `createChildTask` / `updateTaskState`（含其內部 `tasks/`、`tasks-state.json`、`attachments/` 等子路徑組裝）一律套用同一條規則解析任務資料夾根，不在各自章節重複宣告 fallback 邏輯——只需在「解析任務資料夾根」這一個共用步驟套用兩段式查找即可。`ensureBranch` 不受影響——分支名只吃 ID 字串，從不組路徑。

### ⛔ 日期層永不搬移

日期是**建卡日**，資料夾建立後**不隨工作日變動**。同一張卡跨多天推進仍留在原資料夾。

理由：ID 由路徑推導，搬資料夾等於換 ID——已建立的分支名（`feature/LOCAL-<id>-…`）、已寫入的留言引用、commit 訊息內的 ID 會全部失聯。要按「當前工作日」瀏覽請用 `git log` 或編輯器搜尋，不要動目錄。

（封存操作搬的是「根目錄層」`specs/` → `specs/_archive/`，不是搬日期層或任務層——`<日期>` 與 `<slug>` 這兩個組成 ID 的字串本身不變，ID 字串因此不變，不牴觸本節規則。見「擴充操作 › `LOCALFILE.archiveDoneSpecs()`」。）

---

## 留言檔格式（append-only 事件記錄）

**所有階段留言檔一律 append-only，最新在最上**，每筆以機器可讀標記分隔：

```markdown
<!-- spex:entry seq=2 at=2026-08-08T14:30:00+08:00 -->
## [Spex] Verify 完成

> 輪次：第 2 輪 | 判定：PASS | 日期：2026-08-08

<留言本體>

<!-- spex:entry seq=1 at=2026-08-08T11:05:00+08:00 -->
## [Spex] Verify Fail

> 輪次：第 1 輪 | 判定：FAIL | 日期：2026-08-08

<留言本體>
```

- `seq`：該檔內單調遞增，從 1 起算。
- `at`：ISO-8601 帶時區。
- **不覆寫既有 entry**。任何階段都可能重跑（implement 重做後會再寫一次完成留言、selfcheck 逐輪寫 Verify），舊筆一律保留——`spex-schedule` Phase 4.A 對帳要驗留言鏈完整性，教訓閉環的 Capture 也以那些 Fail 為來源。
- **與章戳鏈的關係**：`sdd-workflow.md`「章戳鏈」規定蓋章後不得潤飾留言本體。此格式在結構上保障了這件事——新一輪是**新 entry**，不動舊 entry，章所綁定的內容原文永久保留、隨時可重新計算雜湊比對。

### 讀取 SOP（取最新一筆）

沿用 adapters/README「Agent 讀取 SOP」的 grep+offset 手法，不整檔載入：

```
grep -n '<!-- spex:entry' <檔案>          # 取前兩個行號
Read(<檔案>, offset=<第 1 個行號>, limit=<第 2 個行號 - 第 1 個行號>)
```

只有一筆時省略 `limit` 讀到檔尾。

---

## `TRACKER.readItem(id)` → Local File 實作

依「ID 規則」把 `id` 拆成日期層與任務層，讀取 `specs/<日期>/<slug>/item.md` 的 Front Matter 與內容。

**若檔案不存在：**

```
specs/<日期>/<slug>/item.md 尚未建立。
請提供以下資訊（或貼上現有描述），我將自動建立初始 item.md：

- 標題：
- 類型（Feature / Bug / User Story）：
- 描述：
- 驗收標準：
```

建立格式：

```markdown
---
id: <id>
type: <Feature|Bug|User Story>
title: <標題>
state: in-progress
assignedTo: null
iterationPath: null
---

## 描述

<description>

## 驗收標準

<acceptanceCriteria>

## 重現步驟（Bug 專用）

<reproSteps>
```

建立時的日期層取**當下日期**；`id` 欄位寫入回讀後的實際 `<日期>-<slug>`，不預先推算。

回傳欄位映射：

| 抽象欄位             | item.md 對應                       |
| -------------------- | ---------------------------------- |
| `type`               | Front Matter `type`                |
| `title`              | Front Matter `title`               |
| `description`        | `## 描述` 章節內容                 |
| `state`              | Front Matter `state`               |
| `acceptanceCriteria` | `## 驗收標準` 章節內容             |
| `reproSteps`         | `## 重現步驟（Bug 專用）` 章節內容 |
| `assignedTo`         | Front Matter `assignedTo`          |
| `iterationPath`      | Front Matter `iterationPath`       |

**路線對應（供 skills 做抽象分流）：**

| Local File `type`                        | skills 應採用的路線名稱 |
| ---------------------------------------- | ----------------------- |
| `Feature` / `Requirement` / `User Story` | `需求路線`              |
| `Bug`                                    | `缺陷路線`              |

- skills 應依 `TRACKER.readItem(id).type` 做路線分流，不應在 skill 內寫死 local-file 的欄位結構。
- 若未來 local-file 支援其他 `type`，應先在本 adapter 補上對應路線，再由 skills 沿用抽象名稱。

---

## 規格建卡欄位對照（write-spec 專用）

**支援頂層規格建卡。** 建立方式與 `TRACKER.readItem(id)` 的「檔案不存在時自動建立」路徑相同——建 `specs/<當下日期>/<slug>/` 後寫入 `item.md`，Front Matter 對應如下：

| 抽象欄位                 | item.md Front Matter / 章節                                      |
| ------------------------ | ---------------------------------------------------------------- |
| 規格項目型別             | Front Matter `type`                                              |
| `title`                  | Front Matter `title`                                             |
| `description`            | `## 描述` 章節內容                                               |
| `acceptanceCriteria`     | `## 驗收標準` 章節內容                                           |
| 估點（Story Points）     | 無原生欄位——寫入 `## 預估開發點數` 章節純文字，不寫 Front Matter |
| workspace / project 預設 | 不適用（無此概念，`<日期>-<slug>` 即識別碼）                     |

slug 由使用者提供或自標題產生（小寫英數 + 連字號）；建目錄後**回讀實際目錄名**組出 ID 回傳，不預先推算。

無工作量欄位的原生支援，write-spec Phase 5.5 的估點結果直接以 Markdown 章節保存（見 `spec-template.md` 的「預估開發點數」章節格式），不強行對應到 Front Matter。

---

## `TRACKER.findSpecComment(id, phase)` → Local File 實作

依「ID 規則」定位任務資料夾，讀對應階段檔的**最新一筆 entry**（讀法見「留言檔格式 › 讀取 SOP」）。

phase 對應檔案：

| phase 參數                | 讀取檔案            |
| ------------------------- | ------------------- |
| `"Spec"`                  | `spec.md`           |
| `"Fixbug"`                | `fixbug.md`         |
| `"Plan"`                  | `plan.md`           |
| `"Task"`                  | `task.md`           |
| `"Task 子卡對照"`         | `task-children.md`  |
| `"Implement"`             | `implement.md`      |
| `"Verify"`                | `verify.md`（PASS 與 Fail 同檔逐輪 append，最新一筆即當前判定） |
| `"PullRequest"`           | `pull-request.md`   |
| `"Schedule"`              | `schedule.md`       |
| `"Schedule 批次分支"`     | `schedule-branch.md` |

**若檔案不存在：**

- 回傳 `{ found: false, content: null }`
- Skill 告知使用者：
  ```
  specs/<日期>/<slug>/<phase>.md 不存在，代表 <phase> 階段尚未完成。
  請選擇：
  (a) 我還沒做 <phase> → 我會回 `spex-<phase-lower>`
  (b) <phase> 內容在其他位置 → 請貼上規格摘要
  (c) 直接從 item.md 抽取重建 → 我會列出並請你確認
  ```

**若檔案存在：**

- 回傳 `{ found: true, content: "<最新一筆 entry 的內容，不含 spex:entry 標記行>" }`
- 需要歷史筆數（對帳、輪次追溯）時另讀整檔，但一般階段判定只取最新一筆。

---

## `TRACKER.addComment(id, content)` → Local File 實作

把 `content` 以**新 entry prepend** 到對應階段檔（不覆寫既有內容）。

**由 skill 傳入的 `content` 第一行決定寫入目標。** 比對規則：取第一行、剝除 `[tier-<n>]` 等後綴，再比對下表：

| 留言標題                                          | 寫入檔                |
| ------------------------------------------------- | --------------------- |
| `## [Spex] Spec 完成`                             | `spec.md`             |
| `## [Spex] Fixbug 完成`                           | `fixbug.md`           |
| `## [Spex] Plan 完成`                             | `plan.md`             |
| `## [Spex] Task 完成`                             | `task.md`             |
| `## [Spex] Task 子卡對照`                         | `task-children.md`    |
| `## [Spex] Implement 完成`                        | `implement.md`        |
| `## [Spex] Verify 完成` / `## [Spex] Verify Fail` | `verify.md`           |
| `## [Spex] PullRequest 完成`                      | `pull-request.md`     |
| `## [Spex] Schedule 完成`                         | `schedule.md`         |
| `## [Spex] Schedule 批次分支`                     | `schedule-branch.md`  |
| **上表皆不符**                                    | `escalation.md`（兜底） |

**關於兜底落點**：`spex-implement` F.5 的 escalation 留言沒有固定的 `[Spex]` 標題，其他 skill 未來也可能新增留言型別。這些一律寫進 `escalation.md`（同樣 append-only），**不得靜默丟棄**——寫入後於回報中明列「已落 escalation.md（未匹配既有 phase）」，讓使用者知道有一筆非標準留言，必要時再回本 adapter 補對照。

寫入步驟：

1. 依「ID 規則」定位任務資料夾；不存在 → 回 `{ success: false, reason: "item not found" }`（不自動建卡）
2. 目標檔不存在 → 以 `seq=1` 建檔；存在 → 以 `grep -m1 -oE 'seq=[0-9]+'` 取當前最大 `seq`，新 entry 用 `seq+1`
3. 在**檔首** prepend：`<!-- spex:entry seq=<n> at=<ISO8601> -->`＋空行＋`content`＋空行，原有內容接在後面

**寫入前確認（所有呼叫此操作的 skill 都必須遵守）：**

```
即將寫入 specs/<日期>/<slug>/<phase>.md（新增第 <n> 筆，不覆寫既有紀錄），
請確認內容無誤後輸入「確認」；若需調整請說明修改內容，調整後再寫入。
```

收到明確確認（「確認」/「ok」/「yes」）後才執行寫入。

---

## `TRACKER.ensureBranch(params)` → Local File 實作

操作步驟與 ADO adapter 完全相同（純本地 `git` 操作，與 tracker 系統解耦），差別**只在分支前綴**——組分支名用本文件開頭宣告的 `LOCAL-`，不是 ADO 的 `ADO-`。實作細節見 [azure-devops/ado.md](./azure-devops/ado.md#trackerensurebranchparams)。

分支名形如 `feature/LOCAL-20260808-feat-login-add-oauth`。ID 含日期使分支名較長，屬預期；仍符合 `sdd-workflow.md`「Branch Naming」的 `<type>/<PREFIX>-<id>-<kebab-summary>` 格式。

local-file 模式下若使用者未使用 git 倉庫，回 `{ success: false, reason: "not a git repository" }`，skill 應提示使用者初始化或停止流程。

---

## `TRACKER.createChildTask(params)` → Local File 實作

建立 `specs/<日期>/<slug>/tasks/<childId>.md`，並更新 `tasks-state.json`。

**步驟一：決定 `childId`（回讀，不推算）**

- 列出 `tasks/` 現有檔名，取 `T-(\d+)` 的最大序號 +1（目錄不存在 → 從 1 起算）
- 格式 `T-<3 位數>`（`T-001`、`T-002`…）
- **`childId` 就是這個值**，不另設第二組 ID

**步驟二：建立任務檔案**

```markdown
---
childId: T-<n>
parentId: <params.parentId>
title: <params.title>
assignedTo: <params.assignedTo>
iterationPath: <params.iterationPath>
state: todo
---

## 任務描述

<params.description>

## 驗收標準

<params.acceptanceCriteria>
```

> ⚠️ **附件路徑改寫**：`params.description` 若含 `getParentImages` 回傳的 `<img src="attachments/…">` 片段，寫入前必須把 `attachments/` 改為 `../attachments/`——子卡檔位於 `tasks/` 下一層，不改路徑必斷連結。

**步驟三：更新 `tasks-state.json`**

```json
{
  "tasks": {
    "T-001": { "state": "todo" },
    "T-002": { "state": "todo" }
  },
  "dependencies": [
    { "predecessor": "T-001", "successor": "T-002" }
  ]
}
```

（`dependencies` 由 `TRACKER.linkDependency` 維護，建卡時不需填。）

回傳 `{ success: true, childId: "T-<n>" }`。

---

## `TRACKER.updateTaskState(id, state)` → Local File 實作

狀態映射表（**抽象** → **Local File**）：

| 抽象狀態      | local 狀態字串 | task 檔案 Front Matter |
| ------------- | -------------- | ---------------------- |
| `in-progress` | `in_progress`  | `state: in_progress`   |
| `done`        | `done`         | `state: done`          |
| `removed`     | `removed`      | `state: removed`       |

步驟：

1. `id` 為 `T-<n>` 形式（無需查映射表——childId 即檔名主體）
2. 讀取 `specs/<日期>/<slug>/tasks/<id>.md`，修改 Front Matter 的 `state`
3. 更新 `tasks-state.json` 中 `tasks.<id>.state`

兩處必須同時更新；只改一處會讓 `getDependencies` 與子卡檔說法不一致。

---

## `TRACKER.getParentMetadata(id)` → Local File 實作

讀取 `specs/<日期>/<slug>/item.md` 的 Front Matter，取出：

- `assignedTo`
- `iterationPath`

若欄位為 `null`，照實回傳 `null`（skill 使用時可選擇略過）。

---

## `TRACKER.getParentImages(id)` → Local File 實作

掃描 `specs/<日期>/<slug>/attachments/`，每個圖片檔（`.png` / `.jpg` / `.jpeg` / `.gif` / `.webp` / `.svg`）回傳一筆：

```
{
  alt:  "<檔名去副檔名>",
  html: "<img src=\"attachments/<檔名>\" alt=\"<alt>\">"
}
```

- `html` 的路徑**相對於任務資料夾**（`item.md` 所在層）。
- ⚠️ **呼叫端改寫責任**：把片段寫進 `tasks/T-XXX.md` 時必須改為 `../attachments/`（見 `createChildTask` 步驟二）。寫進任務資料夾同層的檔案則原樣可用。
- `attachments/` 不存在或無圖片 → 回傳 `[]`，`spex-task` 收到空陣列時略過圖片區段。

---

## `TRACKER.linkDependency(predecessorId, successorId)` → Local File 實作

在 `specs/<日期>/<slug>/tasks-state.json` 的 `dependencies` 陣列追加一筆邊：

```json
{ "predecessor": "<predecessorId>", "successor": "<successorId>" }
```

步驟：

1. 讀取 `tasks-state.json`；無 `dependencies` 鍵 → 先補空陣列
2. 兩個 ID 必須存在於 `tasks` 映射（即 `T-XXX` 鍵），否則回 `{ success: false, reason: "unknown task id" }`
3. **冪等**：同一筆邊已存在 → 直接回 `{ success: true }`，不重複加
4. 寫回檔案，回 `{ success: true, reason: null }`

此操作不單獨走寫入前確認——由 task Phase 5.4 一次展示全部邊、單次確認後逐邊呼叫。

---

## `TRACKER.getDependencies(parentId)` → Local File 實作

讀取 `specs/<日期>/<slug>/tasks-state.json` 與 `tasks/` 下各任務檔組裝回傳：

1. `tasks`：遍歷 `tasks-state.json` 的 `tasks` 映射，鍵即 `childId`，取其 `state`；`title` 自對應 `tasks/<childId>.md` 的 Front Matter `title`
2. `edges`：把 `dependencies` 陣列逐筆轉成 `{ predecessorId: <predecessor>, successorId: <successor> }`
3. 無 `dependencies` 鍵或為空 → `edges: []`（呼叫端 fallback 到 Task 留言「依賴」欄）

---

## `TRACKER.createPullRequest(params)` → Local File 實作

Local File 模式**無 PR 概念**，依協定仍實作但一律回：

```
{ success: false, pullRequestId: null, url: null, reason: "local-file adapter 不支援 Pull Request" }
```

`spex-pull-request` skill 收到此回應時：告知使用者本模式無法開 PR，改以 `pull-request.md` 留存「PR 內容草稿」（title / description / work items），由使用者自行決定後續（例如改用 ADO adapter 或手動處理）。

---

## `TRACKER.updatePullRequest(params)` → Local File 實作

同 `createPullRequest`：不支援，一律回 `{ success: false, reason: "local-file adapter 不支援 Pull Request" }`。

---

## 擴充操作

local-file adapter 特有、`TRACKER.*` 12 核心操作未涵蓋的能力，依 `adapters/README.md`「擴充操作」規範以系統前綴命名空間宣告。skills 不會自動呼叫；只有明確引用本章節的 skill／人工操作才會使用。

### `LOCALFILE.archiveDoneSpecs()`（封存 done 卡片）

**用途**：把 `item.md` Front Matter `state: done` 的任務資料夾，從 `specs/<日期>/<slug>/` 搬到 `specs/_archive/<日期>/<slug>/`——只搬「根目錄層」（`specs/` → `specs/_archive/`），`<日期>` 與 `<slug>` 兩段路徑原樣照搬，因此組出的 ID 字串 `<日期>-<slug>` 不變（見「ID 規則 › 封存 fallback」）。目的是讓 `specs/<日期>/` 主列表只留未完成任務，同時保留已完成卡片的完整歷史與可定位性。

**呼叫時機**：一次性初始遷移（把既有 `state: done` 的卡片全部歸檔）＋日後任何時候皆可安全重跑（冪等）。不是即時 hook——目前沒有任何 skill 會在流程中自動把父卡 `state` 改成 `done`，因此本操作只能是「事後、可重跑的批次掃描」，由人工或未來排程主動呼叫；新增自動關卡觸發不在本次設計範圍內。

**實作**：[`scripts/archive-done-specs.sh`](./scripts/archive-done-specs.sh)。

```bash
bash .codex/reference/adapters/scripts/archive-done-specs.sh --dry-run   # 先看清單，不搬
bash .codex/reference/adapters/scripts/archive-done-specs.sh             # 正式搬（git mv，staged 但不 commit）
```

**目錄結構變化**：

```diff
 specs/
   20260814/
-    relax-query-retrieval/
-      item.md
-      spec.md
   20260815/
     feat-login/
       ...
+  _archive/
+    20260814/
+      relax-query-retrieval/
+        item.md
+        spec.md
```

**演算法**：

1. 掃描 `specs/*/`，排除 `_archive/` 本身；只認資料夾名符合 `^\d{8}$` 的日期層（其餘一律略過，不報錯——避免誤動使用者自建的雜項目錄）
2. 每個 `specs/<日期>/<slug>/item.md`：讀 Front Matter `state:` 值（沿用 grep+offset 慣例，非真 YAML parser）
3. 依判定分流（見下方狀態表）
4. 命中「可封存」→ `mkdir -p specs/_archive/<日期>/` 後 `git mv specs/<日期>/<slug> specs/_archive/<日期>/<slug>`（用 `git mv` 而非 `mv` + `git add`/`git rm`，保留 blame / `git log --follow` 歷史）
5. 每筆印一行報告；退出碼一律 0（報告型工具，非硬 gate）

**狀態表**：

| 判定 | 條件 | 行為 |
| --- | --- | --- |
| `ARCHIVED` | `state: done` 且目的地不存在且無未提交變更 | 執行 `git mv`（staged，不自動 commit） |
| `SKIP not-done` | `state` 非 `done`（含空值） | 略過 |
| `SKIP already-archived` | `specs/_archive/<日期>/<slug>/` 已存在 | 略過（冪等的來源） |
| `SKIP dirty-worktree` | 該任務資料夾內 `git status --porcelain` 非空 | 略過，不強搬 |
| `SKIP no-item-md` | 找不到 `item.md` | 略過（非標準任務資料夾） |

**未提交變更（dirty-worktree）處理**：搬移前一律先跑 `git status --porcelain -- specs/<日期>/<slug>`；只要該資料夾內有任何未追蹤或未提交的變更，一律跳過、不強制搬移——直接搬移會讓「這批變更是搬移前還是搬移後產生」變得不可考，也可能讓使用者弄丟尚未 commit 內容的位置。要封存該卡，請先自行 commit 或 stash 該資料夾內的變更後重跑。

**不自動 commit**：`git mv` 執行後停在「staged 未 commit」——這是本操作的複核關卡（bash 腳本沒有 `addComment` 那種互動式「確認」機制，改以「先 stage、不 commit」讓呼叫者用 `git status` / `git diff --cached --summary` 複核搬移清單後再自行 commit，效果等同協定的寫入前確認）。

**與在途分支 / PR 的風險**：若某卡已有一條開著的 feature 分支（甚至已開 PR）指向 `specs/<日期>/<slug>/` 內的檔案，而封存操作在另一條分支（如 `dev`）上把該資料夾搬到 `specs/_archive/<日期>/<slug>/` 並先行 commit/merge，之後該 feature 分支合併回來時 git 需要對同一批檔案解析「一邊刪除、一邊修改」的 rename/modify 衝突——`git status --porcelain` 只能看見**目前檢出分支**的未提交變更，看不到其他分支或 worktree 上尚未合併的提交。建議：只在卡片確定沒有在途分支/PR 時封存（卡片走到 `done` 通常代表 PR 已合併，風險視窗本就很窄）；若日後真的出現「done 之前就有殘留分支」的情況，封存前先手動確認 `git branch --contains <該資料夾內任一檔案的最新 commit>`。

### `LOCALFILE.archiveItem(id)`（單卡變體，選用）

同一支腳本、`--id` 旗標：

```bash
bash .codex/reference/adapters/scripts/archive-done-specs.sh --id=20260825-example-feature
```

只處理指定 ID 對應的單一任務資料夾；仍套用上表全部判定（非 `done` 一律 skip，**不會**因為指定了 `--id` 就強制封存未完成的卡）。用途：agent／人工已知某張卡剛轉 `done`，想立即封存這一張而不觸發全庫掃描報告。**非必要操作**——目前沒有任何 skill 會呼叫它，`archiveDoneSpecs()` 全掃描已能滿足「一次性遷移＋日後重跑」的完整需求；保留只因實作成本極低（共用同一支腳本）。

#### 注意事項

- 只信任 `item.md` 自己的 `state` 欄位，不檢查子任務（`tasks/*.md`）是否全部 `done`——與 `readItem` 的既有行為一致，父卡 `state` 是唯一事實來源。
- 腳本可在 repo 內任何目錄執行，會自動 `cd` 到 `git rev-parse --show-toplevel`；不在 git 工作樹內或找不到 `specs/` 一律印錯誤並以非 0 結束（唯二的非 0 退出情境，其餘一律 0）。
- 不引入 YAML parser——沿用本文件其餘章節的 grep+offset 讀法。

### `LOCALFILE.rebuildIndex()`（重建跨資料夾規格索引）

**用途**：掃描全部 `specs/<日期>/<slug>/item.md` 與 `specs/_archive/<日期>/<slug>/item.md`，彙總成單一份跨資料夾的規格索引 `specs/INDEX.md`，供人閱讀當作 **product roadmap 總覽**（哪些規格待執行、各自進行到哪個階段、估點多少、隸屬哪張 Epic）。解決的痛點：卡片各自散在獨立資料夾，沒有總覽就只能逐夾翻 `item.md`。

**衍生視圖，非事實來源**：`specs/INDEX.md` 每次執行**全量重掃、全量覆寫**（不是 append-only 事件記錄，與各階段留言檔的性質不同）。事實來源永遠是各卡自己的 `item.md` 與階段留言檔——索引隨時可整份重算、刪掉也不損失任何資訊。**其他 skill 一律不得把 `INDEX.md` 當資料來源讀取**，該用 `readItem` / `findSpecComment` 就用它們；索引只給人看。

**呼叫時機**：**非自動 hook**——比照 `archiveDoneSpecs()` 的定位，由人工或明確引用本章節的 skill（目前為 `spex-roadmap`）主動觸發，任何時候皆可安全重跑。日後若要把重建接進各 skill 的交付步驟（`spex-write-spec` Phase 6、`spex-plan` Phase 8、`spex-pull-request` Phase 3、`spex-schedule` Phase 4.A 對帳後等），屬未來擴充，**不在本次設計範圍內**；真的要接時須依 `sdd-workflow.md` 既有慣例，先在規則檔宣告一行「Spec Index 更新時機（唯一來源）」，再由各 skill 各自於自己的階段呼叫。

**實作**：[`scripts/rebuild-spec-index.sh`](./scripts/rebuild-spec-index.sh)。

```bash
bash .codex/reference/adapters/scripts/rebuild-spec-index.sh --dry-run   # 只印到 stdout，不寫檔
bash .codex/reference/adapters/scripts/rebuild-spec-index.sh             # 正式重建 specs/INDEX.md
```

**演算法**：

1. 掃描 `specs/*/` 與 `specs/_archive/*/`，只認資料夾名符合 `^\d{8}$` 的日期層（其餘略過不報錯，沿用 `archiveDoneSpecs()` 同款容錯）
2. 每個任務資料夾讀 `item.md` Front Matter 的 `id` / `type` / `title` / `state`（grep+sed，不引入 YAML parser），並於內文 grep `父 Epic：\`<id>\`` 取父層 ID
3. 依下方**階段判定表**反推該卡目前階段
4. 估點：`spec.md` 內 grep `^- 點數[:：]`（子 Story）；抓不到再讀 `## rollup 估點` 段落首個數字並標記 `(rollup)`（Epic）；皆無 → `—`（報告型工具，不因解析失敗中斷）
5. 最後更新：取該資料夾所有 `*.md` 中最新一筆 `<!-- spex:entry … at=… -->` 時間戳；無留言檔則退回 `item.md` 的檔案 mtime
6. 排序：以「父 Epic → 自身 ID」為鍵，讓子卡緊跟其父 Epic 之後（父卡排 0、子卡排 1），子卡標題加 `└─` 前綴呈現層級
7. 輸出兩張表——**進行中／待辦**與**已完成**（`已封存` / `已完成` 兩階段歸入後者）；檔頭附重建時間、卡片總數與各階段張數
8. 終端機印出摘要；退出碼固定 0（報告型工具，非硬 gate）

**階段判定表**（優先序由高到低；階段不讀任何單一欄位，而是由「資料夾內存在哪些階段檔案」反推）：

| 優先序 | 判定條件 | 階段 |
| --- | --- | --- |
| 1 | 位於 `specs/_archive/` 下 | `已封存` |
| 2 | `item.md` Front Matter `state: done` | `已完成` |
| 3 | 有 `pull-request.md` | `PR 已開` |
| 4 | 有 `verify.md` | `驗收通過` / `驗收未過` / `驗收中`（取最新一筆 entry 的 `判定：`） |
| 5 | 有 `implement.md` | `已實作，待驗收` |
| 6 | 有 `task.md` | `任務已拆分` |
| 7 | 有 `plan.md` | `技術計畫已完成` |
| 8 | 有 `spec.md` | `規格已就緒` |
| 9 | 只有 `item.md` | `僅建卡` |

**為何用檔案存在性反推而非讀欄位**：目前**沒有任何 skill 會在流程中自動更新 `item.md` 的 `state`**（同一條限制也寫在 `archiveDoneSpecs()` 的「呼叫時機」），因此 `state` 無法反映流程進度——但各階段留言檔會由對應 skill 確實寫入，是可信的進度訊號。這也是本操作唯一可行的無人工簿記做法。

#### 注意事項

- **`state: done` 仍需人工設定**：索引的「已完成」判定依賴 `state: done` 或已封存路徑，而前者目前無自動化來源（見上）。索引忠實呈現此現況，不代為推測。
- **看不到「已合併」**：合併一律由人類於平台 UI 執行（見 `sdd-workflow.md`「PR 合併控管」），Spex 無從觀測，故自動化能看到的最後訊號是「PR 已開」而非「已合併」。
- `specs/INDEX.md` 由腳本全量覆寫，**請勿手動編輯**（檔頭已註明）；它不需納入任何 append-only 或章戳保護規範，因為它不是事件記錄。
- 不引入 YAML parser——沿用本文件其餘章節的 grep+sed 讀法。
- 與 `archiveDoneSpecs()` 不同，本操作不呼叫 `git mv`、不改動任何既有檔案，因此**不要求在 git 工作樹內**執行（不在 git 內時以目前目錄為根）。

---

## Local File 特有注意事項

1. **日期層永不搬移** — 見上方「ID 規則」。搬資料夾等於換 ID，會讓分支名、留言引用、commit 內的 ID 全部失聯。
2. **留言 append-only，不覆寫** — 任何階段都可能重跑；舊筆是對帳（`spex-schedule` Phase 4.A 留言鏈完整性）與教訓 Capture 的來源，也是章戳內容綁定得以重驗的前提。
3. **未匹配的留言落 `escalation.md`，不得靜默丟棄** — 並於回報中明列，讓使用者有機會回本 adapter 補對照。
4. **slug 不可以 8 位數字開頭** — 會讓 `^(\d{8})-(.+)$` 誤判日期層。
5. **無網路環境** — Local File Adapter 完全不需要網路。適合離線開發或 ADO 連線不穩的情況。
6. **版本控制** — `specs/` 目錄建議納入 `git` 版本控制，方便團隊分享 Spex 產出。
7. **迭代路徑的替代** — 無 ADO 時 `iterationPath` 無意義，可填入 Sprint 名稱或留空。
8. **封存（`specs/_archive/`）** — `state: done` 的卡片可用 `LOCALFILE.archiveDoneSpecs()`（[`scripts/archive-done-specs.sh`](./scripts/archive-done-specs.sh)）搬到 `specs/_archive/<日期>/<slug>/`。只搬根目錄層，日期層與任務層字串不變，ID 因此不變——不牴觸「日期層永不搬移」。搬移用 `git mv` 保留歷史，且只在 `git status --porcelain` 乾淨時才搬；掃描時 `_archive/` 本身會被排除，不會被誤判成新的日期層。詳見「ID 規則 › 封存 fallback」與「擴充操作 › `LOCALFILE.archiveDoneSpecs()`」。
9. **規格索引（`specs/INDEX.md`）** — 由 `LOCALFILE.rebuildIndex()`（[`scripts/rebuild-spec-index.sh`](./scripts/rebuild-spec-index.sh)）全量重建的跨資料夾 roadmap 總覽，**是衍生視圖不是事實來源**：可隨時重算、刪掉不損失資訊，任何 skill 都不得拿它當讀取來源（該用 `readItem` / `findSpecComment`）。它是 `specs/` 下唯一**不**適用「留言 append-only」規範的檔案（第 2 點），因為它不是事件記錄。詳見「擴充操作 › `LOCALFILE.rebuildIndex()`」。
