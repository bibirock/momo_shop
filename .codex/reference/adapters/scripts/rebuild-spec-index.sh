#!/usr/bin/env bash
# rebuild-spec-index.sh — local-file adapter 擴充操作實作
#   LOCALFILE.rebuildIndex()  → 掃描 specs/**/item.md，重建 specs/INDEX.md
#
# 見 .codex/reference/adapters/local-file.md「擴充操作 › LOCALFILE.rebuildIndex()」。
#
# 用途：把散落在 specs/<日期>/<slug>/ 與 specs/_archive/<日期>/<slug>/ 的所有卡片
#       彙總成一份跨資料夾的規格索引 specs/INDEX.md，供人閱讀當作 product roadmap 總覽。
#
# 設計要點：
#   - specs/INDEX.md 是「衍生視圖」，不是事實來源：每次執行全量重掃、全量覆寫，
#     不 append。事實來源永遠是各卡自己的 item.md 與階段留言檔，索引隨時可整份重算。
#     其他 skill 一律不得把 INDEX.md 當資料來源讀取（沿用 readItem / findSpecComment）。
#   - 階段（Stage）不讀任何單一欄位，而是由「資料夾內哪些階段檔案存在」反推——因為
#     目前沒有任何 skill 會自動更新 item.md 的 state（見 local-file.md 同名章節「注意事項」）。
#   - 冪等：同一份資料重跑兩次輸出完全相同（除了檔頭的重建時間戳）。
#   - 不引入 YAML parser，沿用本專案其餘腳本的 grep/sed 讀法。
#   - 退出碼一律 0（報告型工具，非硬 gate）；找不到 specs/ / 參數錯誤才會以非 0 結束。
#
# 用法（可從 repo 內任何目錄執行，腳本會自動 cd 到 git 根目錄）：
#   bash .codex/reference/adapters/scripts/rebuild-spec-index.sh --dry-run
#   bash .codex/reference/adapters/scripts/rebuild-spec-index.sh
set -u

DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=1
      ;;
    -h | --help)
      cat <<'EOF'
用法：rebuild-spec-index.sh [--dry-run]

  （無旗標）        掃描 specs/**/item.md，全量重建 specs/INDEX.md
  --dry-run         只把索引內容印到 stdout，不寫入 specs/INDEX.md
  -h, --help        顯示本說明

退出碼一律 0；非 0 只用於「無法執行」（找不到 specs/ / 參數錯誤）。
EOF
      exit 0
      ;;
    *)
      echo "錯誤：未知參數 '$arg'（--help 查看用法）" >&2
      exit 1
      ;;
  esac
done

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  # 不強制要在 git 內（本腳本不像 archive-done-specs.sh 需要 git mv），退回目前目錄
  REPO_ROOT="$(pwd)"
fi
cd "$REPO_ROOT" || exit 1

if [ ! -d "specs" ]; then
  echo "錯誤：${REPO_ROOT} 下找不到 specs/ 目錄，此 repo 未使用 local-file adapter 慣例，無事可做。" >&2
  exit 1
fi

INDEX_FILE="specs/INDEX.md"

# --- 小工具 -----------------------------------------------------------------

# 讀 Front Matter 單一欄位（只取 --- 與 --- 之間第一筆）
fm_field() {
  sed -n '/^---$/,/^---$/p' "$1" | grep -m1 "^$2:" | sed -E "s/^$2:[[:space:]]*//" | tr -d '\r'
}

# markdown 表格欄位轉義：| 會破表
esc() {
  printf '%s' "$1" | sed 's/|/\\|/g'
}

# 檔案 mtime（BSD/macOS 與 GNU 皆可）
file_mtime() {
  stat -f '%Sm' -t '%Y-%m-%d' "$1" 2>/dev/null \
    || stat -c '%y' "$1" 2>/dev/null | cut -d' ' -f1 \
    || echo "—"
}

# 取任務資料夾內所有階段留言檔中最新一筆 spex:entry 的日期；無則退回 item.md mtime
last_updated() {
  slug_dir="$1"
  newest="$(grep -ho 'at=[0-9T:+-]*' "$slug_dir"/*.md 2>/dev/null \
    | sed 's/^at=//' | sort -r | head -1)"
  if [ -n "$newest" ]; then
    printf '%s' "${newest:0:10}"
  else
    file_mtime "$slug_dir/item.md"
  fi
}

# 估點：Story 讀「- 點數：<n>」；Epic 讀「## rollup 估點」下一段開頭數字；抓不到回 —
points_of() {
  spec_file="$1/spec.md"
  [ -f "$spec_file" ] || { printf '—'; return; }

  p="$(grep -m1 -E '^- 點數[:：]' "$spec_file" 2>/dev/null \
    | grep -oE '[0-9]+' | head -1)"
  if [ -n "$p" ]; then
    printf '%s' "$p"
    return
  fi

  p="$(sed -n '/^## rollup 估點/,/^## /p' "$spec_file" 2>/dev/null \
    | grep -oE '[0-9]+' | head -1)"
  if [ -n "$p" ]; then
    printf '%s (rollup)' "$p"
    return
  fi

  printf '—'
}

# 階段判定：優先序由高到低（見 local-file.md 同名章節的狀態表）
stage_of() {
  slug_dir="$1"
  is_archived="$2"
  state="$3"

  if [ "$is_archived" = "1" ]; then
    printf '已封存'
    return
  fi
  if [ "$state" = "done" ]; then
    printf '已完成'
    return
  fi
  if [ -f "$slug_dir/pull-request.md" ]; then
    printf 'PR 已開'
    return
  fi
  if [ -f "$slug_dir/verify.md" ]; then
    # 留言檔最新一筆在最上，取第一個「判定：」即當前輪次結果
    verdict="$(grep -m1 -oE '判定[:：][[:space:]]*(PASS|FAIL)' "$slug_dir/verify.md" 2>/dev/null \
      | grep -oE '(PASS|FAIL)')"
    if [ "$verdict" = "PASS" ]; then
      printf '驗收通過'
    elif [ "$verdict" = "FAIL" ]; then
      printf '驗收未過'
    else
      printf '驗收中'
    fi
    return
  fi
  if [ -f "$slug_dir/implement.md" ]; then
    printf '已實作，待驗收'
    return
  fi
  if [ -f "$slug_dir/task.md" ]; then
    printf '任務已拆分'
    return
  fi
  if [ -f "$slug_dir/plan.md" ]; then
    printf '技術計畫已完成'
    return
  fi
  if [ -f "$slug_dir/spec.md" ]; then
    printf '規格已就緒'
    return
  fi
  printf '僅建卡'
}

# --- 掃描 -------------------------------------------------------------------

# 每列格式（\t 分隔）：sortKey \t 區塊(active|done) \t id \t type \t title \t parent \t stage \t points \t updated
ROWS_FILE="$(mktemp)"
trap 'rm -f "$ROWS_FILE"' EXIT

total=0
skipped_other=0

scan_item() {
  slug_dir="$1"
  date_name="$2"
  slug_name="$3"
  is_archived="$4"

  item_file="${slug_dir}/item.md"
  if [ ! -f "$item_file" ]; then
    echo "SKIP  ${date_name}/${slug_name}  no-item-md（非標準任務資料夾）" >&2
    skipped_other=$((skipped_other + 1))
    return
  fi

  id="$(fm_field "$item_file" id)"
  [ -n "$id" ] || id="${date_name}-${slug_name}"
  type="$(fm_field "$item_file" type)"
  [ -n "$type" ] || type="—"
  title="$(fm_field "$item_file" title)"
  [ -n "$title" ] || title="（無標題）"
  state="$(fm_field "$item_file" state)"

  # 父 Epic：item.md 描述段的「父 Epic：`<id>`」
  parent="$(grep -m1 -oE '父 Epic[:：][[:space:]]*`[^`]+`' "$item_file" 2>/dev/null \
    | sed -E 's/.*`([^`]+)`.*/\1/')"

  stage="$(stage_of "$slug_dir" "$is_archived" "$state")"
  points="$(points_of "$slug_dir")"
  updated="$(last_updated "$slug_dir")"

  # 區塊：已封存 / 已完成 → done 表；其餘 → active 表
  if [ "$is_archived" = "1" ] || [ "$state" = "done" ]; then
    section="done"
  else
    section="active"
  fi

  # 排序鍵：讓子卡緊跟在父 Epic 之後（父卡 0、子卡 1），無父卡者自成一組
  if [ -n "$parent" ]; then
    sort_key="${parent}|1|${id}"
    display_title="└─ $(esc "$title")"
    parent_cell="\`${parent}\`"
  else
    sort_key="${id}|0|${id}"
    display_title="$(esc "$title")"
    parent_cell="—"
  fi

  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$sort_key" "$section" "$id" "$(esc "$type")" "$display_title" \
    "$parent_cell" "$stage" "$points" "$updated" >>"$ROWS_FILE"

  total=$((total + 1))
}

# 未封存：specs/<日期>/<slug>/
for date_dir in specs/*/; do
  date_dir="${date_dir%/}"
  date_name="$(basename "$date_dir")"

  [ "$date_name" = "_archive" ] && continue
  [[ "$date_name" =~ ^[0-9]{8}$ ]] || continue

  for slug_dir in "$date_dir"/*/; do
    [ -d "$slug_dir" ] || continue
    slug_dir="${slug_dir%/}"
    scan_item "$slug_dir" "$date_name" "$(basename "$slug_dir")" 0
  done
done

# 已封存：specs/_archive/<日期>/<slug>/
if [ -d "specs/_archive" ]; then
  for date_dir in specs/_archive/*/; do
    date_dir="${date_dir%/}"
    date_name="$(basename "$date_dir")"

    [[ "$date_name" =~ ^[0-9]{8}$ ]] || continue

    for slug_dir in "$date_dir"/*/; do
      [ -d "$slug_dir" ] || continue
      slug_dir="${slug_dir%/}"
      scan_item "$slug_dir" "$date_name" "$(basename "$slug_dir")" 1
    done
  done
fi

# --- 產出 -------------------------------------------------------------------

active_count="$(awk -F'\t' '$2=="active"' "$ROWS_FILE" | wc -l | tr -d ' ')"
done_count="$(awk -F'\t' '$2=="done"' "$ROWS_FILE" | wc -l | tr -d ' ')"

# 各階段張數摘要（依出現次數排序）
# 注意：階段名可能含空格（例：「PR 已開」），故取 $2 之後全部欄位，不可只取 $2
stage_summary="$(awk -F'\t' '{print $7}' "$ROWS_FILE" | sort | uniq -c | sort -rn \
  | awk '{count=$1; $1=""; sub(/^[[:space:]]+/, ""); printf "%s %s 張、", $0, count}' \
  | sed 's/、$//')"

render_table() {
  section="$1"
  if ! awk -F'\t' -v s="$section" '$2==s' "$ROWS_FILE" | grep -q .; then
    echo "（目前沒有此類卡片）"
    return
  fi
  echo "| ID | 類型 | 標題 | 父 Epic | 階段 | 點數 | 最後更新 |"
  echo "|---|---|---|---|---|---|---|"
  awk -F'\t' -v s="$section" '$2==s' "$ROWS_FILE" | sort -t'	' -k1,1 \
    | awk -F'\t' '{printf "| `%s` | %s | %s | %s | %s | %s | %s |\n", $3, $4, $5, $6, $7, $8, $9}'
}

build_index() {
  cat <<EOF
# 規格索引（Spec Index / Roadmap）

> 本檔由 \`LOCALFILE.rebuildIndex()\` 自動產生，**每次執行全量覆寫**——請勿手動編輯。
> 這是**衍生視圖**，不是事實來源；事實來源永遠是各卡自己的 \`item.md\` 與階段留言檔。
> 重建方式：\`bash .codex/reference/adapters/scripts/rebuild-spec-index.sh\`（或 \`/spex-roadmap\`）

重建時間：$(date '+%Y-%m-%d %H:%M:%S %z')
卡片總數：${total}（進行中／待辦 ${active_count}、已完成 ${done_count}）
階段分布：${stage_summary}

## 進行中／待辦

$(render_table active)

## 已完成

$(render_table done)

---

## 階段判定說明

階段不是任何單一欄位，而是由「任務資料夾內存在哪些階段檔案」反推（優先序由高到低）：

| 優先序 | 判定條件 | 階段 |
|---|---|---|
| 1 | 位於 \`specs/_archive/\` | 已封存 |
| 2 | \`item.md\` front matter \`state: done\` | 已完成 |
| 3 | 有 \`pull-request.md\` | PR 已開 |
| 4 | 有 \`verify.md\` | 驗收通過 / 驗收未過 / 驗收中（取最新一筆判定） |
| 5 | 有 \`implement.md\` | 已實作，待驗收 |
| 6 | 有 \`task.md\` | 任務已拆分 |
| 7 | 有 \`plan.md\` | 技術計畫已完成 |
| 8 | 有 \`spec.md\` | 規格已就緒 |
| 9 | 只有 \`item.md\` | 僅建卡 |

**已知限制**：目前沒有任何 skill 會在流程中自動把 \`item.md\` 的 \`state\` 改成 \`done\`，
因此「已完成」需人工設定該欄位（或經 \`LOCALFILE.archiveDoneSpecs()\` 封存後由路徑判定）。
另外合併（merge）一律由人類於平台 UI 執行、Spex 無法觀測，
故自動化能看到的最後訊號是「PR 已開」，不是「已合併」。
EOF
}

if [ "$DRY_RUN" -eq 1 ]; then
  build_index
  echo "---" >&2
  echo "索引重建完成（--dry-run 模式：以上為模擬輸出，未寫入 ${INDEX_FILE}）：total=${total}  active=${active_count}  done=${done_count}  skipped-other=${skipped_other}" >&2
else
  build_index >"$INDEX_FILE"
  echo "---"
  echo "索引重建完成：total=${total}  active=${active_count}  done=${done_count}  skipped-other=${skipped_other}"
  echo "已寫入 ${INDEX_FILE}"
fi

exit 0
