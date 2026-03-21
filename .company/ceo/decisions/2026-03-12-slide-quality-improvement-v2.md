---
date: "2026-03-12"
title: YURAスライド品質改善 v2 — 視覚要素強化・プロ品質への昇格
type: 技術意思決定
departments: [開発, クリエイティブ, リサーチ]
issue: "#10"
---

# YURAスライド品質改善 v2 — 視覚要素強化・プロ品質への昇格

## 調査概要

8チーム並行リサーチ + プロデザイナー(FUJI氏)の記事分析を統合。

## 現状の「微妙さ」の根本原因

### 1. 視覚要素の絶対的不足（最大の問題）
- **図解・チャート・アイコンがゼロ**。文字が単調に並んでいるだけ
- Canvaのようなビジュアルリッチさがない
- データ（8.25兆円, CAGR 9.1%等）が数字テキストのまま。グラフ化されていない

### 2. デザインの「フラットさ」
- 背景が単色べた塗り → 奥行きゼロ
- カードが `rgba(255,255,255,0.04)` の薄い箱 → 存在感なし
- テキスト色が全て同じ白 → 階層（ヒエラルキー）なし

### 3. レイアウトの単調さ
- ほぼ全スライドが「左テキスト + 右画像」の同一パターン
- FUJIさんの18種レイアウトバリエーション vs 現状2パターン

---

## 改善方針（優先順位順）

### Phase 1: 視覚要素の追加（最重要・即効性あり）

| スライド | 現状 | 追加する視覚要素 |
|---------|------|----------------|
| Slide 3 Reversible | テキストのみの Side A/B ボックス | SVGベン図（重なる2つの円: Present ∩ Memory） |
| Slide 4 Brand Mission | テキスト段落 | SVGフロー図（風景の記憶 → デジタルアーカイブ → ファッション → 次世代継承） |
| Slide 5 Market | 数字テキストのstat-card | CSS conic-gradient ドーナツチャート + SVG棒グラフ |
| Slide 6 Business Model | テキストのmodel-step | SVGアイコン付きフロー図 + 収益構造ドーナツチャート |
| Slide 7 Roadmap | テキストのphase-card | SVGマイルストーンアイコン + 進捗ゲージバー |

**アイコンライブラリ**: Lucide Icons（SVGインライン埋め込み）
- 軽量、MIT License、ビジネス向けアイコン豊富
- Playwright スクリーンショットとの互換性◎（Webフォント不要）

**チャート実装**: Pure CSS + Inline SVG
- conic-gradient → ドーナツチャート（市場シェア、収益構造）
- CSS Grid + height → 棒グラフ（成長率比較）
- SVG path → 折れ線・フロー図
- 外部ライブラリ不要でPlaywright互換性を確保

### Phase 2: デザインの深み追加

| 改善項目 | Before | After |
|---------|--------|-------|
| 背景 | 単色 `#1a1a2e` | `linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)` |
| テキスト色階層 | 全て `#ffffff` | H1: `#ffffff`, H2: `#e0e0e0`, 本文: `#b0b0b0`, 注釈: `#808080` |
| カード | `rgba(255,255,255,0.04)` | Glassmorphism: `backdrop-filter: blur(10px)` + グラデーションボーダー |
| AI画像 | そのまま配置 | `mix-blend-mode: luminosity` + グラデーションマスクで背景に溶け込ませ |
| フォント | 一律ウェイト | 見出し900, サブ700, 本文500（ダーク背景では太め推奨） |
| `line-height` | デフォルト | 本文: 1.6, 見出し: 1.1 |
| `letter-spacing` | なし | 大文字見出し: 0.05em, 本文: 0.02em |
| 光効果 | なし | 控えめなtext-shadow + カードにソフトグロー |

### Phase 3: レイアウトバリエーション

FUJIさんのYAMLカタログを参考に、各スライドに異なるレイアウトを適用:

| スライド | レイアウトタイプ |
|---------|----------------|
| Slide 1 Title | 全画面グラフィック（映画的） |
| Slide 2 Target | カードグリッド（4カラム）→ 現状維持でOK |
| Slide 3 Reversible | バブルチャート/ベン図（ワイヤーフレーム風） |
| Slide 4 Brand Mission | フロー図（矢印ステップ） |
| Slide 5 Market | テキスト＋データ強調（巨大数字 + チャート） |
| Slide 6 Business Model | 数式・フロー図スタイル |
| Slide 7 Roadmap | 垂直タイムライン（左右分岐） |

---

## 技術スタック（確定）

```
HTML/CSS/SVG (1920x1080)
  ├── Lucide Icons (SVGインライン)
  ├── CSS Charts (conic-gradient, flexbox bars)
  ├── SVG Diagrams (path, circle, line)
  └── Glassmorphism (backdrop-filter)
      ↓
Playwright Screenshot (deviceScaleFactor: 2)
      ↓
4K PNG (3840x2160)
      ↓
Google Slides / PPTX
```

## 参照ソース

- FUJI氏 note記事: マッキンゼー風スライドAI比較、NotebookLM YAML制御
- 8チーム並行リサーチ: デザイントレンド2026、ダークテーマ技法、プロ事例分析
- WCAG: コントラスト比 4.5:1（本文）/ 3:1（大文字見出し）

## 決定

Phase 1（視覚要素追加）から着手。Slide 5（Market）をPoCとして先行実装し、
オーナーの承認後に全スライドに展開する。
