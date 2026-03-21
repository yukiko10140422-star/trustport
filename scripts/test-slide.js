const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "OTHRE SERVICE";
pres.title = "ChatGPT + PPTX 統合テスト";

// ブランドカラー
const COLORS = {
  primary: "0f3460",
  secondary: "533483",
  accent: "e94560",
  bgLight: "f8f9fa",
  textDark: "2d3436",
  white: "FFFFFF",
};

// --- スライド1: タイトルスライド（画像背景） ---
const slide1 = pres.addSlide();

// ChatGPT生成画像を背景として使用
slide1.addImage({
  path: path.resolve(__dirname, "../outputs/images/sunset-coast.png"),
  x: 0, y: 0, w: 10, h: 5.625,
  sizing: { type: "cover", w: 10, h: 5.625 },
});

// 半透明オーバーレイ
slide1.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 5.625,
  fill: { color: COLORS.primary, transparency: 40 },
});

// タイトルテキスト
slide1.addText("YURA", {
  x: 0.8, y: 1.2, w: 8.4, h: 1.2,
  fontSize: 54, fontFace: "Noto Sans JP",
  color: COLORS.white, bold: true,
  charSpacing: 12,
});

// サブタイトル
slide1.addText([
  { text: "被災地 x デジタルアーカイブ x アパレル", options: { breakLine: true } },
  { text: "記憶の揺らぎを力に変える", options: {} },
], {
  x: 0.8, y: 2.6, w: 8.4, h: 1.2,
  fontSize: 22, fontFace: "Noto Sans JP",
  color: COLORS.white,
  lineSpacingMultiple: 1.5,
});

// アクセントライン
slide1.addShape(pres.shapes.LINE, {
  x: 0.8, y: 4.2, w: 2, h: 0,
  line: { color: COLORS.accent, width: 3 },
});

// 日付
slide1.addText("2026.03.12", {
  x: 0.8, y: 4.5, w: 3, h: 0.5,
  fontSize: 14, fontFace: "Inter",
  color: COLORS.white,
});

// --- スライド2: コンテンツスライド ---
const slide2 = pres.addSlide();

// 背景
slide2.background = { color: COLORS.bgLight };

// ヘッダーバー
slide2.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.8,
  fill: { color: COLORS.primary },
});

slide2.addText("ターゲティング分析", {
  x: 0.8, y: 0.1, w: 8, h: 0.6,
  fontSize: 22, fontFace: "Noto Sans JP",
  color: COLORS.white, bold: true,
  margin: 0,
});

// セクションタイトル
slide2.addText("4つの顧客セグメント", {
  x: 0.8, y: 1.1, w: 8, h: 0.6,
  fontSize: 20, fontFace: "Noto Sans JP",
  color: COLORS.primary, bold: true,
});

// セグメントカード x 4
const segments = [
  { name: "A. アーバンミレニアル", desc: "28-38歳 / 都市部 / SNS活用", size: "300-400万人", color: COLORS.primary },
  { name: "B. ソーシャルコンシャス", desc: "25-45歳 / エシカル消費 / 女性65%", size: "150-200万人", color: COLORS.secondary },
  { name: "C. アートカルチャー", desc: "25-50歳 / 限定品好き / 美術館好き", size: "100-150万人", color: COLORS.accent },
  { name: "D. 被災地応援層", desc: "30-60歳 / ふるさと納税 / ボランティア", size: "200-300万人", color: "2d8659" },
];

segments.forEach((seg, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.8 + col * 4.4;
  const y = 1.9 + row * 1.7;

  // カード背景
  slide2.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: x, y: y, w: 4, h: 1.4,
    fill: { color: COLORS.white },
    rectRadius: 0.1,
    shadow: { type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.1 },
  });

  // カラーアクセント（左）
  slide2.addShape(pres.shapes.RECTANGLE, {
    x: x, y: y, w: 0.08, h: 1.4,
    fill: { color: seg.color },
  });

  // セグメント名
  slide2.addText(seg.name, {
    x: x + 0.25, y: y + 0.1, w: 3.5, h: 0.4,
    fontSize: 14, fontFace: "Noto Sans JP",
    color: seg.color, bold: true,
    margin: 0,
  });

  // 説明
  slide2.addText(seg.desc, {
    x: x + 0.25, y: y + 0.5, w: 3.5, h: 0.35,
    fontSize: 11, fontFace: "Noto Sans JP",
    color: COLORS.textDark,
    margin: 0,
  });

  // 規模
  slide2.addText(seg.size, {
    x: x + 0.25, y: y + 0.9, w: 3.5, h: 0.35,
    fontSize: 13, fontFace: "Inter",
    color: seg.color, bold: true,
    margin: 0,
  });
});

// --- スライド3: 画像+テキスト 2カラムレイアウト ---
const slide3 = pres.addSlide();
slide3.background = { color: COLORS.white };

// 左: 画像
slide3.addImage({
  path: path.resolve(__dirname, "../outputs/images/sunset-coast.png"),
  x: 0, y: 0, w: 5, h: 5.625,
  sizing: { type: "cover", w: 5, h: 5.625 },
});

// 右: テキストコンテンツ
slide3.addText("リバーシブルデザイン", {
  x: 5.5, y: 0.8, w: 4, h: 0.6,
  fontSize: 22, fontFace: "Noto Sans JP",
  color: COLORS.primary, bold: true,
});

slide3.addShape(pres.shapes.LINE, {
  x: 5.5, y: 1.5, w: 1.5, h: 0,
  line: { color: COLORS.accent, width: 2 },
});

slide3.addText("現在と過去 / 美しい時と残酷な時", {
  x: 5.5, y: 1.8, w: 4, h: 0.5,
  fontSize: 16, fontFace: "Noto Sans JP",
  color: COLORS.secondary, bold: true,
});

slide3.addText([
  { text: "表面: ", options: { bold: true, breakLine: false } },
  { text: "復興した風景、希望、再生の美しさ", options: { breakLine: true } },
  { text: "", options: { breakLine: true, fontSize: 8 } },
  { text: "裏面: ", options: { bold: true, breakLine: false } },
  { text: "被災直後の記憶、喪失、痛み", options: { breakLine: true } },
  { text: "", options: { breakLine: true, fontSize: 8 } },
  { text: "着る人が自分でどちらの面を見せるか選べる。", options: { breakLine: true } },
  { text: "「風化防止」を日常の選択行為に。", options: {} },
], {
  x: 5.5, y: 2.5, w: 4, h: 2.5,
  fontSize: 13, fontFace: "Noto Sans JP",
  color: COLORS.textDark,
  lineSpacingMultiple: 1.4,
  valign: "top",
});

// フッター
slide3.addShape(pres.shapes.RECTANGLE, {
  x: 5, y: 5.1, w: 5, h: 0.525,
  fill: { color: COLORS.primary },
});

slide3.addText("YURA  |  風化防止ファッション", {
  x: 5.5, y: 5.15, w: 4, h: 0.4,
  fontSize: 11, fontFace: "Noto Sans JP",
  color: COLORS.white,
  margin: 0,
});

// 出力
const outputPath = path.resolve(__dirname, "../outputs/slides/integration-test.pptx");
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log("Generated: " + outputPath);
});
