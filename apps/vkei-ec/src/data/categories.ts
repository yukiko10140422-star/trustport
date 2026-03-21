import type { Category } from '@/types';

export const categories: readonly Category[] = [
  {
    id: 'tops',
    slug: 'tops',
    name: 'トップス',
    nameEn: 'TOPS',
    description: '般若心経・写経をまとう',
  },
  {
    id: 'bottoms',
    slug: 'bottoms',
    name: 'ボトムス',
    nameEn: 'BOTTOMS',
    description: '墨と朱の下半身',
  },
  {
    id: 'outerwear',
    slug: 'outerwear',
    name: 'アウター',
    nameEn: 'OUTERWEAR',
    description: '経典を羽織る',
  },
  {
    id: 'accessories',
    slug: 'accessories',
    name: 'アクセサリー',
    nameEn: 'ACCESSORIES',
    description: '数珠・念珠・梵字の荘厳',
  },
  {
    id: 'headwear',
    slug: 'headwear',
    name: 'ヘッドウェア',
    nameEn: 'HEADWEAR',
    description: '頭上の曼荼羅',
  },
] as const;
