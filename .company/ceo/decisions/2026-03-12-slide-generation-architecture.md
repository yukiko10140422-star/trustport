---
date: "2026-03-12"
title: YURAスライド生成アーキテクチャ改善 — 複合リソース戦略
type: 技術意思決定
departments: [開発, クリエイティブ, リサーチ]
issue: "#10"
---

# YURAスライド生成アーキテクチャ改善 — 複合リソース戦略

## 背景

YURA企画書スライド4-7でテキスト切れ・可読性・デザイン統一性の品質問題が発生。
オーナーから「画像生成だけに頼るのではなく複合的なスライド作成リソースを使うべき」との提案を受け、5チーム並行で外部リサーチを実施。

## 調査結果サマリー（5チーム統合）

### 現状の問題（画像一本足打法）

```
ChatGPT画像生成 → 全面背景に設定 → Playwrightで座標ベーステキスト配置
```

| 問題 | 根本原因 |
|------|---------|
| テキスト切れ（MARKE, ROADMA） | Playwright座標ベースのテキストボックス作成が不正確 |
| テキスト可読性低い | 全面写真背景 + 白テキスト直置き（オーバーレイなし） |
| デザイン統一性なし | スライドごとに異なる画像スタイル、配置ルールなし |

### 利用可能なリソースの評価

| リソース | 精密配置 | デザイン品質 | 安定性 | AI画像統合 | 学習コスト |
|---------|---------|------------|--------|-----------|-----------|
| **Playwright（現行）** | 低（座標依存） | 低 | 低（UI変更で壊れる） | 高 | 済 |
| **Google Slides API** | 高（EMU単位） | 中 | 高（公式API） | 高 | 中 |
| **python-pptx** | 最高（mm単位） | 高 | 最高（ファイル直接操作） | 高 | 中 |
| **HTML/CSS + スクリーンショット** | 最高（CSS制御） | 最高 | 高 | 高 | 低 |
| **Marp / Slidev** | 高 | 中〜高 | 高 | 中 | 低 |

### デザイン理論からの知見

1. **全面背景画像はタイトル・セクション区切りのみに限定すべき**。テキストが多いスライドではAI画像は「部分要素」として使う
2. **テキスト可読性の7手法**: 半透明オーバーレイ(20-70%) / スクリム（グラデーション） / 横帯リボン / ぼかし / すりガラス / 座布団 / テキストシャドウ
3. **WCAG基準**: 通常テキスト4.5:1、大テキスト3:1のコントラスト比必須
4. **余白は接着剤**: 四辺と要素間に十分な余白。詰め込まない
5. **フォントは1-2種類、行間130-150%**

## 推奨アーキテクチャ

### 方式: HTML/CSS → Playwright スクリーンショット → Google Slides挿入

```
┌─────────────────────────────────────────────────────────┐
│  Phase 1: コンテンツ生成                                  │
│  LLM → スライド構成JSON（タイトル、テキスト、レイアウト）  │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  Phase 2: ビジュアル素材                                  │
│  ChatGPT Thinking 5.4 → AI画像生成                       │
│  ※ 全面背景ではなく「部分要素」として使用                  │
│  ※ 余白を持たせたプロンプト / 円形・角丸クロップ           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  Phase 3: スライドレンダリング                             │
│  HTML/CSS + Tailwind でスライドを構築                     │
│  - 1920x1080 固定サイズの <section>                       │
│  - 半透明オーバーレイ / グラデーション / 座布団            │
│  - フォント・色・余白をCSSで完全制御                      │
│  - AI画像は <img> として部分配置                          │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  Phase 4: 出力                                            │
│  Playwright スクリーンショット (deviceScaleFactor: 2)     │
│  → PNG 3840x2160（4K品質）                               │
│  → Google Slides に画像として挿入 or PPTX直接生成         │
└─────────────────────────────────────────────────────────┘
```

### 選定理由

1. **HTML/CSSはレイアウト精度が最高**: テキスト位置・サイズ・余白・オーバーレイをピクセル単位で制御可能。「テキスト切れ」が構造的に発生しない
2. **LLMとの相性が最も良い（LIFULL事例）**: LLMにHTML/CSSを直接生成させるワークフローが2025-2026年の主流トレンド
3. **AI画像との柔軟な統合**: 全面背景・部分配置・円形クロップなどCSSで自在に配置
4. **Tailwind CSSでデザイン統一**: テーマカラー・フォント・余白をユーティリティクラスで一貫管理
5. **既存のPlaywright環境を活用**: スクリーンショット取得に現行のPlaywright MCP環境がそのまま使える
6. **python-pptx（代替案）**: PPTX直接生成も可能だが、半透明オーバーレイにXML直接操作が必要など制約あり。HTML/CSSの方がデザイン自由度が高い

### 代替案: python-pptx

python-pptxは「テンプレート + データ注入」パターンに最適。
定型レポートの大量生成には向くが、ブランド企画書のようなクリエイティブ資料にはHTML/CSSの方がデザイン自由度が高い。
ただし、Google Slidesへのインポート互換性（フォント・アニメーション）にはpython-pptxの方が優位な場合もある。

### AI画像の使い方ガイドライン（改訂）

| スライド種別 | AI画像の使い方 | 背景処理 |
|------------|--------------|---------|
| タイトルスライド | 全面背景OK | 半透明オーバーレイ必須（40-60%） |
| セクション区切り | 全面背景OK | スクリム（グラデーション）推奨 |
| コンテンツスライド | 部分要素（サイド配置 or 円形クロップ） | ソリッドカラー背景 |
| データスライド | アイコン的使用 or 不使用 | ソリッドカラー背景 |

## ネクストアクション

1. [ ] HTML/CSSスライドテンプレートの設計（YURAブランドカラー・フォント定義）
2. [ ] スライド1枚のPoCを作成して品質検証
3. [ ] 問題なければ全7スライドをHTML/CSS方式で再作成
4. [ ] ワークフロードキュメント更新（`slide-generation-guide.md`）

## 参考情報源

### 重要記事
- [LIFULL: パワポ風HTMLをLLMに構築させることでスライド作成を自動化した話](https://www.lifull.blog/entry/2025/08/04/120000)
- [ramble: AIにスライド作らせるならHTMLが最強](https://ramble.impl.co.jp/11446/)
- [Tips For Using AI-Generated Images In Your Slides - Thoughtbot](https://thoughtbot.com/blog/tips-for-using-ai-generated-images-in-your-slides)

### ツール・OSS
- [Presenton (AI+PPTX生成OSS)](https://github.com/presenton/presenton)
- [md2googleslides (Google公式)](https://github.com/googleworkspace/md2googleslides)
- [PptxGenJS](https://github.com/gitbrent/PptxGenJS)
- [DeckTape (HTMLスライド→PDF)](https://github.com/astefanutti/decktape)

### デザインガイドライン
- [11 Design Tips: Text Over Images - SlideTeam](https://www.slideteam.net/blog/11-hacks-to-make-text-over-images-more-readable-craft-a-stunning-slide)
- [Designing Accessible Text Over Images - Smashing Magazine](https://www.smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1/)
- [Working with whitespace - BrightCarbon](https://www.brightcarbon.com/blog/presentation-whitespace/)
