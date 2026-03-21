'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/format';

export function ProductCard({ product }: { readonly product: Product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        {/* 商品画像エリア */}
        <div className="relative aspect-[3/4] bg-[var(--color-sumi)] overflow-hidden mb-4 border border-white/5 group-hover:border-[var(--color-shinku)]/30 transition-all duration-500 distort-hover">
          {/* ホバーグロー */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: 'radial-gradient(ellipse at 50% 40%, rgba(196,30,58,0.1) 0%, transparent 60%)',
            }}
          />

          {/* プレースホルダー */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span
                className="block text-5xl sm:text-6xl text-[var(--color-nezumi)]/15 group-hover:text-[var(--color-shinku)]/25 transition-all duration-700 group-hover:scale-110"
                style={{ fontFamily: 'var(--font-serif-jp)', fontWeight: 900 }}
              >
                {product.name.charAt(0)}
              </span>
              <p
                className="text-[7px] text-[var(--color-nezumi)]/8 mt-3 px-6 break-all leading-[1.8] tracking-wider group-hover:text-[var(--color-nezumi)]/15 transition-colors duration-700"
                style={{ fontFamily: 'var(--font-serif-jp)' }}
              >
                色即是空空即是色
              </p>
            </div>
          </div>

          {/* ボトムグラデーション */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--color-kuro)]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* NEW */}
          {product.isNew && (
            <div className="absolute top-3 left-3">
              <div className="relative px-2 py-0.5">
                <div className="absolute inset-0 bg-[var(--color-shinku)] rotate-[1deg]" />
                <span className="relative text-[9px] tracking-[0.2em] font-bold">NEW</span>
              </div>
            </div>
          )}

          {/* SOLD OUT */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center">
              <span className="text-sm tracking-[0.4em] text-[var(--color-nezumi)] neon-red">SOLD OUT</span>
            </div>
          )}

          {/* ホバー時ボーダーグロー */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 40px rgba(196,30,58,0.08)' }}
          />

          {/* スキャンライン風エフェクト */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
            }}
          />
        </div>

        {/* 商品情報 */}
        <div className="px-1">
          <h3 className="text-sm font-medium group-hover:text-[var(--color-shiro)] transition-colors duration-300 truncate">
            {product.name}
          </h3>
          <p className="text-[10px] text-[var(--color-nezumi)]/40 mt-0.5 tracking-wider">
            {product.nameEn}
          </p>
          <p
            className="text-sm mt-2 gold-shimmer inline-block"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
