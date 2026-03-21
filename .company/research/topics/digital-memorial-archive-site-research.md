# デジタルメモリアル・アーカイブサイト リサーチレポート

> 目的: 浪江町（福島原発事故）の震災記録を未来に伝えるWebサイトの設計参考
> 調査日: 2026-03-13

---

## 1. 受賞歴のあるデジタルメモリアルサイト

### 1-1. 100 Lost Species（Awwwards SOTD受賞）

- **URL**: https://100lostspecies.com/
- **制作**: Immersive Garden / 60fps
- **概要**: 100秒間で100種の絶滅種を追悼するデジタルメモリアル。時間が経過するとサイト自体が消滅し、「消えていった存在」を体感させる
- **演出手法**:
  - タイムリミット付きのナラティブ（100秒で自動消滅）
  - 3Dビジュアル + パーティクルエフェクト
  - 「不在」そのものを演出に変換する設計思想
- **浪江町への応用**: 時間の不可逆性を体感させる演出。「帰還困難区域の時計が止まった瞬間」の表現に

### 1-2. The Fallen of World War II（データドリブンドキュメンタリー）

- **URL**: https://www.fallen.io/ww2/
- **制作**: Neil Halloran（脚本・監督・コーディング・ナレーション）
- **概要**: 第二次世界大戦の人的犠牲をデータビジュアライゼーションで表現した15分間のインタラクティブドキュメンタリー
- **技術**: WebGL、カスタムデータビジュアライゼーション
- **演出手法**:
  - 線形ナレーション + 重要場面でポーズしてデータを探索可能
  - 数字の「スケール感」を視覚的に突きつける演出
  - 音楽・ナレーション統合（Andy Dollerson作曲）
- **浪江町への応用**: 避難者数・帰還率・除染面積などのデータをスケール感のあるビジュアライゼーションで表現

### 1-3. War in Ukraine（Awwwards SOTD受賞）

- **URL**: https://war.ukraine.ua/
- **制作**: ウクライナのエージェンシー
- **概要**: ロシアによるウクライナ侵攻の現実をアニメーションで伝える非営利サイト
- **技術**: Readymag（ノーコード）
- **演出手法**:
  - スクロール連動アニメーションによる戦争の現実の伝達
  - データビジュアライゼーション + 証言の統合
- **浪江町への応用**: 被害の規模感をスクロールで体感させるパターン

### 1-4. The Message to Ukraine（Awwwards SOTD受賞）

- **URL**: https://the-message-to-ukraine.com/
- **制作**: ウクライナへの連帯表明プロジェクト
- **概要**: カスタムフォントと詩でウクライナへの愛を宣言
- **演出手法**:
  - スクロールトリガーアニメーション
  - タイポグラフィ主体の感情表現
  - ホログラフィックパターン + 動的ビジュアル

### 1-5. Hiroshima Archive（デジタルアーカイブの先駆け）

- **URL**: https://hiroshima.mapping.jp/
- **制作**: 渡邉英徳教授（首都大学東京）
- **概要**: 広島原爆の証言を地図上にマッピングしたインタラクティブアーカイブ
- **技術**: Cesium.js（3Dグローブ/2Dマップ）、旧Google Earth → ブラウザ移行
- **演出手法**:
  - 3つのレイヤー切替: 1945年地図 / 現代地図 / 衛星写真
  - 証言者のアバター写真を地図上に配置、クリックで証言再生
  - YouTube埋め込みによる証言動画
- **浪江町への応用**: 浪江町の被災前/被災後/現在の3レイヤーマップ。住民の証言を地理的にマッピング

### 1-6. 9/11 Memorial & Museum（Webby Award受賞）

- **URL**: https://www.911memorial.org/
- **概要**: 9.11テロの追悼・記録サイト。デジタル展示、名前配置インタラクティブガイド
- **受賞**: Webby Awards ノミネート、American Alliance of Museums 金賞・銀賞
- **演出手法**:
  - Timescape（時系列インタラクティブ展示）
  - Signing Steel Interactive（遺物のインタラクティブ展示）
  - Explore 9/11（包括的デジタル体験）
- **浪江町への応用**: 年表型インタラクティブ展示の設計参考

### 1-7. 東日本大震災関連デジタルアーカイブ

| サイト | URL | 特徴 |
|--------|-----|------|
| NDL東日本大震災アーカイブ（ひなぎく） | https://kn.ndl.go.jp/ | 国立国会図書館の包括的アーカイブ |
| Japan Disasters Digital Archive | https://jdarchive.org/ | ハーバード大学支援、2012年開始 |
| 東日本大震災・原子力災害伝承館 | https://www.densho-road-fukushima.com/ | 双葉町の県立施設、2020年開館 |
| 震災インフラアーカイブ | https://infra-archive311.thr.mlit.go.jp/ | 津波災害の映像・画像記録 |
| 福島原子力事故アーカイブ | https://f-archive.jaea.go.jp/ | JAEA運営の事故情報アーカイブ |

---

## 2. 没入型ストーリーテリングの先進事例

### 2-1. スクロール連動アニメーション（Scrollytelling）最高峰パターン

#### パターンA: リニアナラティブ型
- **事例**: Snow Fall（NYT）、Firestorm（Guardian）
- **手法**: 長文テキスト + スクロールで展開するビジュアル
- **技術**: Intersection Observer + CSS Animation / GSAP ScrollTrigger

#### パターンB: データドリブン型
- **事例**: The Fallen of WWII（fallen.io）
- **手法**: データの量感で感情を動かす（棒グラフが画面を超えて伸びていく等）
- **技術**: WebGL + カスタムレンダリング

#### パターンC: シネマティック型
- **事例**: BMW年次レポート、Scrambler Ducati
- **手法**: 映像的トランジション + スクロールで「シーン」が切り替わる
- **技術**: GSAP ScrollTrigger + Three.js

#### パターンD: 消滅/不在型
- **事例**: 100 Lost Species
- **手法**: コンテンツ自体が消えることで喪失感を体感させる
- **技術**: タイマー + フェードアニメーション

### 2-2. 動画の使い方

| パターン | 実装方法 | 適用場面 |
|----------|---------|---------|
| フルスクリーンBG動画 | `<video autoplay muted loop playsinline>` + `object-fit: cover` | ヒーローセクション |
| インラインビデオ | スクロール位置で再生制御 (`video.currentTime = scrollProgress * duration`) | タイムライン演出 |
| シネマグラフ | 短ループ動画(5-10秒) + seamless loop | 環境演出（風、水面） |

**ベストプラクティス**:
- ファイルサイズ: 2-5MB（最大10MB）
- 解像度: 720p（フルスクリーン時のみ1080p検討）
- フレームレート: 24-30fps
- ループ長: 10-30秒
- モバイル: 768px以下はWebP/JPEG静止画にフォールバック
- フォーマット: MP4 (H.264) + WebM

### 2-3. 音声・環境音の使い方

**ブラウザ自動再生制限への対応パターン**:

1. **ユーザージェスチャーアンロック方式**（推奨）
   ```
   初回ロード → 「音声付きで体験する」ボタン表示
   → ユーザークリック → AudioContext.resume()
   → 環境音フェードイン
   ```

2. **ミュート自動再生 + アンミュートUI**
   ```
   ページロード → ミュート状態で動画再生
   → 画面隅にスピーカーアイコン表示
   → クリックでアンミュート
   ```

3. **AudioContext状態チェック**
   ```javascript
   const ctx = new AudioContext();
   if (ctx.state === 'suspended') {
     // ユーザー操作を待つUIを表示
     document.addEventListener('click', () => ctx.resume(), { once: true });
   }
   ```

**Media Engagement Index (MEI)**: Chromeはドメインごとのユーザー操作履歴をスコア化。MEI > 0.8 で自動再生許可される場合がある。

---

## 3. 技術スタックの調査

### 3-1. Next.js + Framer Motion + GSAP で実現できること

| 演出 | 実現可能性 | 主担当ライブラリ |
|------|-----------|----------------|
| スムーズスクロール | ◎ | Lenis |
| スクロール連動アニメーション | ◎ | GSAP ScrollTrigger |
| ページトランジション | ◎ | Framer Motion |
| パララックス効果 | ◎ | GSAP / Framer Motion useScroll |
| カウンターアニメーション | ◎ | Framer Motion AnimateNumber |
| 水平スクロールタイムライン | ◎ | GSAP ScrollTrigger pin |
| 3Dパーティクル | ○ | React Three Fiber (R3F) |
| 音声波形ビジュアライザー | ○ | Web Audio API AnalyserNode + Canvas |
| 動画スクロール制御 | ◎ | GSAP ScrollTrigger + video.currentTime |
| Before/Afterモーフィング | ○ | CSS clip-path + GSAP / CSS Scroll-Driven Animations |

**使い分けの原則**:
- **Framer Motion**: UIトランジション、ページ遷移、whileInView、レイアウトアニメーション
- **GSAP + ScrollTrigger**: 複雑なスクロール連動タイムライン、ピン留め、水平スクロール、SVGモーフ
- **Lenis**: 全体のスムーズスクロール基盤

### 3-2. Lenis（スムーズスクロール）導入パターン

**基本情報**:
- ライブラリ名: `lenis`（旧 `@studio-freight/lenis`）
- 制作: Darkroom Engineering
- GitHub: https://github.com/darkroomengineering/lenis
- 公式サイト: https://lenis.darkroom.engineering/

**Next.js App Router統合パターン**:

```tsx
// app/providers.tsx
'use client';
import { ReactLenis } from 'lenis/react';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ autoRaf: true }}>
      {children}
    </ReactLenis>
  );
}

// app/layout.tsx
import { SmoothScrollProvider } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
```

**GSAP ScrollTrigger連携**:
```tsx
import { useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Lenis の RAF を GSAP ticker に同期
useLenis(() => {
  ScrollTrigger.update();
});
```

**主要機能**:
- `autoRaf`: 自動requestAnimationFrameループ
- `allowNestedScroll`: ネストしたスクロール要素の自動検出
- `scrollTo()`: プログラマティックスクロール
- `useLenis` Hook: React ライフサイクルとの統合

**参考スターター**: Darkroom Engineering の [satus](https://github.com/darkroomengineering/satus) — Next.js App Router向け高度なスターターテンプレート

### 3-3. Three.js / R3F の軽量な使い方

**パーティクルエフェクト向けライブラリ**:

1. **wawa-vfx** (推奨)
   - R3F用のGPUアクセラレーションVFXエンジン
   - パーティクル、バースト、トレイルを軽量に実装
   - URL: https://wawasensei.dev/blog/wawa-vfx-open-source-particle-system-for-react-three-fiber-projects

2. **Three Nebula**
   - Three.js用のパーティクルシステムエンジン
   - URL: https://three-nebula.org/

**パフォーマンス最適化**:

| 手法 | 効果 |
|------|------|
| `frameloop="demand"` | 必要時のみレンダリング（デフォルトは毎フレーム） |
| `instancedArray` | GPU永続バッファでCPU-GPU転送を排除 |
| `useFrame`内で直接ミューテーション | React state更新回避で高速化 |
| オブジェクトプーリング | パーティクル生成/破棄のコスト削減 |
| r3f-perf | パフォーマンスモニタリング |

**WebGPU対応**: Safari 26（2025年9月）以降、全主要ブラウザでWebGPUが利用可能。Three.js WebGPURendererで次世代グラフィックスが可能。

### 3-4. Web Audio API での環境音実装

**AnalyserNode による波形ビジュアライザー**:

```typescript
// AudioContext の初期化（ユーザー操作後）
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;

// 音声ソースの接続
const source = audioCtx.createMediaElementSource(audioElement);
source.connect(analyser);
analyser.connect(audioCtx.destination);

// 波形データの取得
const dataArray = new Uint8Array(analyser.frequencyBinCount);

function draw() {
  requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);
  // Canvas または WebGL で描画
}
```

**環境音の実装パターン**:
- BGM: `AudioBufferSourceNode` でループ再生
- 効果音: 複数の `AudioBufferSourceNode` を用意
- フェードイン/アウト: `GainNode.gain.linearRampToValueAtTime()`
- 空間オーディオ: `PannerNode` でステレオ/3D配置

**参考**: Codropsの3Dオーディオビジュアライザーチュートリアル — Three.js + GSAP + Web Audio API の統合実装例

---

## 4. 具体的な演出アイデア（浪江町メモリアル向け）

### 4-1. ヒーローセクション: 動画背景 + カウンター + 環境音

**実装構成**:

```
[フルスクリーン動画背景]
  浪江町の空撮 or 現在の街並み（ドローン映像）
  ├── 半透明オーバーレイ（暗め）
  ├── カウンターアニメーション
  │   ├── "2011.3.11 14:46" — 発災時刻
  │   ├── "21,000+" — 避難者数（数字がカウントアップ）
  │   └── "XX年XX日" — 経過日数（リアルタイム計算）
  ├── タイトルテキスト（フェードイン）
  └── 「音声付きで体験する」ボタン → クリックで環境音開始
```

**技術実装**:
- 動画: `<video>` MP4 (H.264) + WebMフォールバック、720p、ミュート自動再生
- カウンター: Framer Motion `AnimateNumber`（スプリングアニメーション）
- 環境音: Web Audio API、ユーザークリック後に `AudioContext.resume()`
- モバイル: 静止画WebPにフォールバック

### 4-2. タイムライン: スクロール連動横スクロールタイムライン

**実装構成**:

```
[縦スクロール → 横スクロール変換]
  GSAP ScrollTrigger pin + horizontal animation

  2011.3.11 → 避難指示 → 除染開始 → 帰還困難区域設定 →
  段階的避難指示解除 → 現在の復興状況 → 未来へ

  各年代カード:
  ├── 年号ラベル
  ├── キービジュアル（写真 or イラスト）
  ├── 概要テキスト（2-3行）
  └── 詳細展開リンク
```

**GSAP実装のポイント**:
- `ease: "none"` で線形スクロール
- `pin: true` でコンテナをビューポートに固定
- `scrub: 1` でスクロール量に追従
- 各カードの出現はstagger付きフェードイン
- プログレスバーでタイムライン上の現在位置を表示

### 4-3. 証言セクション: 音声再生 + 波形ビジュアライザー

**実装構成**:

```
[証言カード]
  ├── 証言者の写真（モノクロ → カラーのフェード）
  ├── 名前・年齢・当時の状況
  ├── 再生ボタン → 音声証言再生開始
  ├── 波形ビジュアライザー
  │   └── Web Audio API AnalyserNode → Canvas 2D 描画
  ├── テキスト字幕（音声に同期してハイライト）
  └── 引用テキスト（代表的な一文を大きく表示）
```

**技術実装**:
- 音声: HTML5 `<audio>` + Web Audio API
- 波形: `AnalyserNode.getByteTimeDomainData()` → `<canvas>` リアルタイム描画
- 字幕同期: `timeupdate` イベントで現在の字幕セグメントをハイライト
- デザイン: 波形カラーは柔らかい暖色（灯火のイメージ）

### 4-4. Before/After: スクロール連動モーフィング

**実装構成**（ドラッグスライダーではなくスクロール連動）:

```
[固定表示エリア]
  スクロール 0% → Before画像（2011年3月の浪江町）
  スクロール 50% → 中間状態（clip-pathで徐々に切り替わり）
  スクロール 100% → After画像（現在の浪江町）

  演出オプション:
  A. clip-path モーフィング: 円形/矩形のクリップが拡大して次の画像を露出
  B. opacity クロスフェード: 透明度のスムーズな遷移
  C. CSS filter: grayscale(1) → grayscale(0) で白黒→カラー変換
```

**技術実装**:
- GSAP ScrollTrigger + `scrub: true`
- `clip-path: circle()` or `inset()` のアニメーション
- CSS Scroll-Driven Animations（Chrome/Firefox対応、Safariは非対応のためGSAPフォールバック必須）
- 参考: Codropsの "On-Scroll Shape Morph Animations"

### 4-5. 教訓セクション: インタラクティブデータビジュアライゼーション

**実装構成**:

```
[データビジュアライゼーション群]
  ├── 放射線量マップ: 色分けヒートマップ（時系列スライダー付き）
  ├── 人口推移: エリアチャート（避難前→避難後→帰還状況）
  ├── 除染進捗: プログレスバー群（地区別）
  ├── 比較チャート: 他の原発事故との比較（チェルノブイリ等）
  └── インフォグラフィック: 復興の全体像
```

**技術選択肢**:
- D3.js: 最も柔軟だが学習コスト高
- Recharts / Nivo: React向け、D3.jsベース、実装容易
- GSAP + SVG: カスタムアニメーション付きチャート
- スクロール連動: 各チャートが画面に入ると描画開始（whileInView）

### 4-6. 追悼セクション: パーティクルエフェクト（灯篭流し）

**実装構成**:

```
[Three.js / R3F シーン]
  ├── 暗い水面（ゆらぎシェーダー）
  ├── 灯篭パーティクル
  │   ├── instancedMesh で大量描画（1000-5000個）
  │   ├── 暖色の点光源（PointLight per particle は重いのでシェーダーで偽装）
  │   ├── ゆっくり流れるアニメーション（Perlinノイズ + 基本方向ベクトル）
  │   └── ユーザー操作: クリックで新しい灯篭を追加
  ├── 追悼メッセージ
  │   └── 灯篭に紐づくテキスト（ホバーで表示）
  └── 環境音: 川の流れ + 虫の声（Web Audio API）
```

**技術実装**:
- R3F + wawa-vfx でGPUアクセラレーションパーティクル
- シェーダーで発光表現（`emissive` + `bloom` ポストプロセス）
- `@react-three/postprocessing` の `Bloom` エフェクト
- パフォーマンス: `frameloop="demand"`、`instancedMesh` 使用
- フォールバック: WebGL非対応環境ではCSS animation による簡易版

---

## 5. 推奨技術スタック（まとめ）

```
フレームワーク:    Next.js 15 (App Router)
スタイリング:      Tailwind CSS + CSS Modules（アニメーション用）
スムーズスクロール: Lenis
アニメーション:     GSAP + ScrollTrigger（スクロール連動）
                   Framer Motion（UIトランジション・ページ遷移）
3D/パーティクル:   React Three Fiber + @react-three/drei + wawa-vfx
音声:              Web Audio API + AnalyserNode
データ可視化:       D3.js or Recharts
動画:              HTML5 <video> (MP4 H.264 + WebM)
フォント:          Noto Sans JP + Noto Serif JP（和文）
ホスティング:       Vercel（Next.js最適化 + Edge Functions + Image Optimization）
CMS（証言管理）:    Supabase or microCMS（日本語対応）
```

---

## 6. 参考リンク集

### メモリアルサイト
- [100 Lost Species](https://www.awwwards.com/sites/100-lost-species) — Awwwards SOTD
- [The Fallen of World War II](https://www.fallen.io/ww2/) — データドリブンドキュメンタリー
- [War in Ukraine](https://www.awwwards.com/sites/war-in-ukraine) — Awwwards SOTD
- [Hiroshima Archive](https://hiroshima.mapping.jp/) — Cesium.jsベースの証言マッピング
- [9/11 Memorial](https://www.911memorial.org/) — Webby Award
- [Japan Disasters Digital Archive](https://jdarchive.org/) — ハーバード大学支援
- [NDL東日本大震災アーカイブ](https://kn.ndl.go.jp/) — 国立国会図書館

### スクロールテリング
- [Scrollytelling Examples (Maglr)](https://www.maglr.com/blog/best-scrollytelling-examples)
- [21 Scrollytelling Website Examples (RGD)](https://reallygooddesigns.com/scrollytelling-website-examples/)
- [Awwwards Storytelling Collection](https://www.awwwards.com/websites/storytelling/)

### 技術チュートリアル
- [Lenis + Next.js 統合ガイド](https://bridger.to/lenis-nextjs)
- [Lenis GitHub](https://github.com/darkroomengineering/lenis)
- [Satus (Next.js スターター)](https://github.com/darkroomengineering/satus)
- [GSAP ScrollTrigger ドキュメント](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Smooth Scroll Cards Parallax (Olivier Larose)](https://blog.olivierlarose.com/tutorials/cards-parallax)
- [Award-Winning 3D Website (Next.js + Three.js + GSAP)](https://dev.to/robinzon100/build-an-award-winning-3d-website-with-scroll-based-animations-nextjs-threejs-gsap-3630)

### パーティクル/3D
- [wawa-vfx (R3F VFXエンジン)](https://wawasensei.dev/blog/wawa-vfx-open-source-particle-system-for-react-three-fiber-projects)
- [Three Nebula](https://three-nebula.org/)
- [Interactive Particles (Codrops)](https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/)
- [Particles with R3F and Shaders (Maxime Heckel)](https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/)
- [R3F パフォーマンス最適化](https://r3f.docs.pmnd.rs/advanced/scaling-performance)

### 音声
- [Web Audio API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)
- [Audio Visualizations (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/web-audio-autoplay)
- [3D Audio Visualizer (Codrops)](https://tympanus.net/codrops/2025/06/18/coding-a-3d-audio-visualizer-with-three-js-gsap-web-audio-api/)

### Before/After・モーフィング
- [On-Scroll Shape Morph Animations (Codrops)](https://tympanus.net/codrops/2023/11/16/on-scroll-shape-morph-animations/)
- [CSS Scroll-Driven Animations (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)

### カウンター・数値アニメーション
- [Framer Motion AnimateNumber](https://motion.dev/docs/react-animate-number)
- [Animated Counter (Build UI)](https://buildui.com/recipes/animated-counter)
- [GSAP + Framer Motion Scroll (Medium)](https://medium.com/front-end-weekly/how-to-create-amazing-scroll-based-animations-with-gsap-scrolltrigger-and-framer-motion-c17482ab3f4)

### 動画背景
- [Background Video 最適化ガイド (Design TLC)](https://designtlc.com/how-to-optimize-a-silent-background-video-for-your-websites-hero-area/)
