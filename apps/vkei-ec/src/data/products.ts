import type { Product } from '@/types';

export const products: readonly Product[] = [
  // --- TOPS ---
  {
    id: 'hannya-sweat',
    slug: 'hannya-shingyo-sweatshirt',
    name: '般若心経 スウェット',
    nameEn: 'Heart Sutra Sweatshirt',
    price: 12800,
    description:
      '般若心経の全文を草書体で前面に配置。裾はロウエッジ加工でストリート感を演出。墨染め風の色合いが独特の存在感を放つ。',
    category: 'tops',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { src: '/images/hannya-sweat-front.svg', alt: '般若心経スウェット フロント' },
      { src: '/images/hannya-sweat-back.svg', alt: '般若心経スウェット バック' },
    ],
    inStock: true,
    isNew: true,
  },
  {
    id: 'bonji-tee',
    slug: 'bonji-oversized-tee',
    name: '梵字 オーバーサイズT',
    nameEn: 'Sanskrit Oversized Tee',
    price: 7800,
    description:
      '大日如来を表す梵字「ア」をバックに大胆にプリント。フロントには朱印風のSWAGロゴ。ヘビーウェイト生地でドロップショルダー。',
    category: 'tops',
    sizes: ['M', 'L', 'XL', 'XXL'],
    images: [
      { src: '/images/bonji-tee-front.svg', alt: '梵字Tシャツ フロント' },
      { src: '/images/bonji-tee-back.svg', alt: '梵字Tシャツ バック' },
    ],
    inStock: true,
    isNew: true,
  },
  {
    id: 'shakyo-longtee',
    slug: 'shakyo-long-sleeve',
    name: '写経 ロングスリーブ',
    nameEn: 'Sutra Copy Long Sleeve',
    price: 8900,
    description:
      '袖に沿って般若心経を写経風に配置。黒地に金色のプリントで荘厳な仕上がり。袖口にリブ付き。',
    category: 'tops',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { src: '/images/shakyo-longtee-front.svg', alt: '写経ロンT フロント' },
      { src: '/images/shakyo-longtee-back.svg', alt: '写経ロンT バック' },
    ],
    inStock: true,
    isNew: false,
  },
  {
    id: 'mandala-tank',
    slug: 'mandala-tank-top',
    name: '曼荼羅 タンクトップ',
    nameEn: 'Mandala Tank Top',
    price: 5800,
    description:
      '胸元に曼荼羅模様を配置。サイドにスリット入りで動きやすいシルエット。ライブやフェスに最適。',
    category: 'tops',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { src: '/images/mandala-tank-front.svg', alt: '曼荼羅タンクトップ フロント' },
    ],
    inStock: true,
    isNew: false,
  },
  // --- BOTTOMS ---
  {
    id: 'sutra-cargo',
    slug: 'sutra-cargo-pants',
    name: '経典 カーゴパンツ',
    nameEn: 'Sutra Cargo Pants',
    price: 14800,
    description:
      'カーゴポケットに般若心経の一節を刺繍。ワイドシルエットで裾にドローコード。墨黒染め。',
    category: 'bottoms',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      { src: '/images/sutra-cargo-front.svg', alt: '経典カーゴ フロント' },
    ],
    inStock: true,
    isNew: true,
  },
  {
    id: 'mokugyo-jogger',
    slug: 'mokugyo-jogger-pants',
    name: '木魚 ジョガーパンツ',
    nameEn: 'Mokugyo Jogger Pants',
    price: 9800,
    description:
      'サイドに木魚と蓮華のグラフィック。テーパードシルエットのジョガー。リラックスフィット。',
    category: 'bottoms',
    sizes: ['M', 'L', 'XL'],
    images: [
      { src: '/images/mokugyo-jogger-front.svg', alt: '木魚ジョガー フロント' },
    ],
    inStock: true,
    isNew: false,
  },
  // --- OUTERWEAR ---
  {
    id: 'kesa-hoodie',
    slug: 'kesa-pullover-hoodie',
    name: '袈裟 プルオーバーパーカー',
    nameEn: 'Kesa Pullover Hoodie',
    price: 16800,
    description:
      '袈裟の色彩パターンをモダンに再解釈。背面に般若心経の「色即是空」を大書。フードの裏地に経典テキスト。',
    category: 'outerwear',
    sizes: ['M', 'L', 'XL', 'XXL'],
    images: [
      { src: '/images/kesa-hoodie-front.svg', alt: '袈裟パーカー フロント' },
      { src: '/images/kesa-hoodie-back.svg', alt: '袈裟パーカー バック' },
    ],
    inStock: true,
    isNew: true,
  },
  {
    id: 'daikoku-ma1',
    slug: 'daikoku-bomber-jacket',
    name: '大黒 MA-1ジャケット',
    nameEn: 'Daikoku Bomber Jacket',
    price: 24800,
    description:
      '背面にスカジャン風の書道刺繍。「南無阿弥陀仏」を草書で大胆に。裏地は金色のサテン。',
    category: 'outerwear',
    sizes: ['M', 'L', 'XL'],
    images: [
      { src: '/images/daikoku-ma1-front.svg', alt: '大黒MA-1 フロント' },
      { src: '/images/daikoku-ma1-back.svg', alt: '大黒MA-1 バック' },
    ],
    inStock: true,
    isNew: false,
  },
  // --- ACCESSORIES ---
  {
    id: 'juzu-bracelet',
    slug: 'juzu-onyx-bracelet',
    name: '数珠 オニキスブレスレット',
    nameEn: 'Juzu Onyx Bracelet',
    price: 4800,
    description:
      'オニキスビーズの数珠ブレスレット。親玉に梵字「キリーク」を刻印。シルバー925金具。',
    category: 'accessories',
    sizes: ['FREE'],
    images: [
      { src: '/images/juzu-bracelet.svg', alt: '数珠ブレスレット' },
    ],
    inStock: true,
    isNew: true,
  },
  {
    id: 'rakkan-ring',
    slug: 'rakkan-signet-ring',
    name: '落款 シグネットリング',
    nameEn: 'Rakkan Signet Ring',
    price: 6800,
    description:
      '落款（印章）をモチーフにしたシグネットリング。「SWAG」の朱印デザイン。シルバー925製。',
    category: 'accessories',
    sizes: ['15号', '17号', '19号', '21号'],
    images: [
      { src: '/images/rakkan-ring.svg', alt: '落款リング' },
    ],
    inStock: true,
    isNew: false,
  },
  {
    id: 'nenju-necklace',
    slug: 'nenju-chain-necklace',
    name: '念珠 チェーンネックレス',
    nameEn: 'Nenju Chain Necklace',
    price: 8800,
    description:
      '念珠をモチーフにしたチェーンネックレス。ペンダントトップは蓮華と梵字。ステンレススチール。',
    category: 'accessories',
    sizes: ['FREE'],
    images: [
      { src: '/images/nenju-necklace.svg', alt: '念珠ネックレス' },
    ],
    inStock: true,
    isNew: true,
  },
  // --- HEADWEAR ---
  {
    id: 'sutra-cap',
    slug: 'sutra-embroidered-cap',
    name: '経文 刺繍キャップ',
    nameEn: 'Sutra Embroidered Cap',
    price: 5800,
    description:
      'フロントに「空」の一文字を刺繍。サイドに般若心経の一節。バックに朱印SWAGロゴ。',
    category: 'headwear',
    sizes: ['FREE'],
    images: [
      { src: '/images/sutra-cap.svg', alt: '経文キャップ' },
    ],
    inStock: true,
    isNew: false,
  },
  {
    id: 'bonno-beanie',
    slug: 'bonno-knit-beanie',
    name: '煩悩 ニットビーニー',
    nameEn: 'Bonno Knit Beanie',
    price: 4200,
    description:
      '折り返し部分に「百八煩悩」の文字を編み込み。ブラック×ゴールドのカラーリング。',
    category: 'headwear',
    sizes: ['FREE'],
    images: [
      { src: '/images/bonno-beanie.svg', alt: '煩悩ビーニー' },
    ],
    inStock: true,
    isNew: true,
  },
] as const;

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): readonly Product[] {
  return products.filter((p) => p.category === category);
}

export function getNewProducts(): readonly Product[] {
  return products.filter((p) => p.isNew);
}
