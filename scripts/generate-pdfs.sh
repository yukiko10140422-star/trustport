#!/bin/bash
# =============================================================
# generate-pdfs.sh — Markdown → PDF 一括変換スクリプト
# =============================================================
# 使い方:
#   bash scripts/generate-pdfs.sh          # 全ファイル変換
#   bash scripts/generate-pdfs.sh --slides # スライドのみ
#   bash scripts/generate-pdfs.sh --docs   # ドキュメントのみ
#
# 必要ツール:
#   npm install -g md-to-pdf @marp-team/marp-cli
#   npm install @mermaid-js/mermaid-cli (ダイアグラム生成用)
# =============================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PDF_OUT="$ROOT_DIR/outputs/pdf"
SLIDE_OUT="$ROOT_DIR/outputs/slides"

# 色付き出力
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# ドキュメント変換対象ディレクトリ
DOC_DIRS=(
  "research/topics"
  "ceo/decisions"
)

# スライド変換対象ディレクトリ
SLIDE_DIR="slides"

# =============================================================
# ドキュメント PDF 変換
# =============================================================
generate_docs() {
  echo -e "${BLUE}=== ドキュメント PDF 生成 ===${NC}"
  mkdir -p "$PDF_OUT"

  for dir in "${DOC_DIRS[@]}"; do
    if [ -d "$ROOT_DIR/$dir" ]; then
      for f in "$ROOT_DIR/$dir"/*.md; do
        [ -f "$f" ] || continue
        name=$(basename "${f%.md}")
        echo -e "  ${GREEN}[PDF]${NC} $dir/$name.md → outputs/pdf/$name.pdf"
        cp "$f" "$PDF_OUT/${name}.md"
        (cd "$PDF_OUT" && md-to-pdf "${name}.md" 2>/dev/null)
        rm -f "$PDF_OUT/${name}.md"
      done
    fi
  done

  echo -e "${GREEN}✓ ドキュメント PDF 生成完了${NC}"
  echo ""
}

# =============================================================
# スライド PDF 変換
# =============================================================
generate_diagrams() {
  echo -e "${BLUE}=== ダイアグラム SVG 生成 ===${NC}"
  local assets_dir="$ROOT_DIR/$SLIDE_DIR/assets"
  if [ -d "$assets_dir" ]; then
    for f in "$assets_dir"/*.mmd; do
      [ -f "$f" ] || continue
      name=$(basename "${f%.mmd}")
      echo -e "  ${GREEN}[SVG]${NC} $name.mmd → $name.svg"
      npx mmdc -i "$f" -o "$assets_dir/${name}.svg" -b transparent -w 900 2>/dev/null || echo "    [WARN] $name.mmd の変換に失敗"
    done
  fi
  echo -e "${GREEN}✓ ダイアグラム生成完了${NC}"
  echo ""
}

generate_slides() {
  echo -e "${BLUE}=== スライド PDF/PPTX 生成 ===${NC}"
  mkdir -p "$SLIDE_OUT"

  # ダイアグラムを先に生成
  generate_diagrams

  if [ -d "$ROOT_DIR/$SLIDE_DIR" ]; then
    for f in "$ROOT_DIR/$SLIDE_DIR"/*.md; do
      [ -f "$f" ] || continue
      name=$(basename "${f%.md}")
      echo -e "  ${GREEN}[PDF]${NC}  $SLIDE_DIR/$name.md → outputs/slides/$name.pdf"
      marp "$f" --pdf --allow-local-files -o "$SLIDE_OUT/${name}.pdf" 2>/dev/null
      echo -e "  ${GREEN}[PPTX]${NC} $SLIDE_DIR/$name.md → outputs/slides/$name.pptx"
      marp "$f" --pptx --allow-local-files -o "$SLIDE_OUT/${name}.pptx" 2>/dev/null
    done
  fi

  echo -e "${GREEN}✓ スライド生成完了${NC}"
  echo ""
}

# =============================================================
# メイン
# =============================================================
case "${1:-all}" in
  --docs)   generate_docs ;;
  --slides) generate_slides ;;
  all|*)    generate_docs; generate_slides ;;
esac

# 生成結果一覧
echo -e "${BLUE}=== 生成ファイル一覧 ===${NC}"
echo "outputs/"
if [ -d "$PDF_OUT" ]; then
  echo "  pdf/"
  ls -1 "$PDF_OUT"/*.pdf 2>/dev/null | while read f; do
    size=$(du -h "$f" | cut -f1)
    echo "    $(basename "$f")  ($size)"
  done
fi
if [ -d "$SLIDE_OUT" ]; then
  echo "  slides/"
  ls -1 "$SLIDE_OUT"/*.pdf 2>/dev/null | while read f; do
    size=$(du -h "$f" | cut -f1)
    echo "    $(basename "$f")  ($size)"
  done
fi
