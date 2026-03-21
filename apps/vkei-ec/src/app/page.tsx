'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { HeroBanner } from '@/components/home/HeroBanner';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getNewProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { SutraTexture } from '@/components/ui/SutraTexture';
import { LotusIcon, JuzuLine, RakkanStamp } from '@/components/ui/BuddhistMotifs';
import { GlitchText, Marquee } from '@/components/ui/Effects';

/** スクロール連動パララックスセクション */
function ParallaxSection({ children, className = '' }: { readonly children: React.ReactNode; readonly className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const newProducts = getNewProducts();

  return (
    <>
      <HeroBanner />

      {/* マーキーバンド — アンダーグラウンド感 */}
      <div className="bg-[var(--color-shinku)] py-2 overflow-hidden">
        <Marquee
          text="SWAG \u00B7 經典街頭 \u00B7 色即是空 \u00B7 NEW COLLECTION"
          speed={20}
          className="text-[10px] tracking-[0.4em] font-bold text-[var(--color-shiro)]"
        />
      </div>

      {/* 新着セクション */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex items-end justify-between mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 0.4, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] tracking-[0.4em] text-[var(--color-shinku)] mb-3 uppercase"
            >
              New Drop
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glitch-heavy"
            >
              <GlitchText
                text="NEW ARRIVALS"
                as="h2"
                className="text-2xl sm:text-4xl tracking-[0.3em]"
              />
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="h-px w-24 mt-4 origin-left"
              style={{ background: 'linear-gradient(90deg, var(--color-shinku), transparent)' }}
            />
          </div>
          <Link
            href="/collections"
            className="text-[11px] text-[var(--color-nezumi)] hover:text-[var(--color-shinku)] transition-colors tracking-[0.2em] group flex items-center gap-2"
          >
            ALL
            <span className="inline-block group-hover:translate-x-2 transition-transform duration-300">&rarr;</span>
          </Link>
        </div>
        <ProductGrid products={newProducts} />
      </section>

      {/* 巨大テキストパララックスセクション */}
      <ParallaxSection className="py-40 bg-[var(--color-sumi)]">
        <SutraTexture opacity={0.03} />

        {/* 巨大背景文字 */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span
            className="text-[200px] sm:text-[300px] font-bold opacity-[0.025] neon-red"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            空
          </span>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <LotusIcon size={50} className="text-[var(--color-shinku)]/40 mx-auto mb-8" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glitch-heavy mb-8"
          >
            <GlitchText
              text="色即是空"
              as="p"
              className="text-4xl sm:text-6xl tracking-[0.5em] gold-shimmer font-bold"
            />
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-32 h-px mx-auto mb-10"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-shinku), var(--color-kin), transparent)' }}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.5, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-[var(--color-nezumi)] tracking-wider leading-[2.8] max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            形あるものは全て空であり、
            <br />
            空であるからこそ形を成す。
            <br />
            <span className="text-[var(--color-shinku)]/80">
              SWAGは、この哲学をストリートウェアに込める。
            </span>
          </motion.p>
        </div>
      </ParallaxSection>

      {/* マーキーバンド2 */}
      <div className="bg-[var(--color-kuro)] border-y border-white/5 py-3 overflow-hidden">
        <Marquee
          text="般若波羅蜜多 \u00B7 照見五蘊皆空 \u00B7 度一切苦厄 \u00B7 SWAG"
          speed={40}
          className="text-[9px] tracking-[0.5em] text-[var(--color-kin)]/20"
        />
      </div>

      {/* カテゴリセクション */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glitch-heavy"
            >
              <GlitchText
                text="COLLECTIONS"
                as="h2"
                className="text-2xl sm:text-3xl tracking-[0.4em]"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link
                  href={`/collections/${cat.slug}`}
                  className="group relative aspect-[3/4] bg-[var(--color-sumi)] flex flex-col items-center justify-center overflow-hidden border border-white/5 hover:border-[var(--color-shinku)]/40 transition-all duration-500 distort-hover"
                >
                  {/* ホバーグラデーション */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 60%, rgba(196,30,58,0.08) 0%, transparent 70%)',
                    }}
                  />

                  <span
                    className="text-4xl sm:text-5xl text-[var(--color-nezumi)]/15 group-hover:text-[var(--color-shinku)]/40 transition-all duration-700 group-hover:scale-125"
                    style={{ fontFamily: 'var(--font-serif-jp)', fontWeight: 900 }}
                  >
                    {cat.name.charAt(0)}
                  </span>

                  <span className="text-[10px] tracking-[0.3em] text-[var(--color-nezumi)]/50 mt-4 group-hover:text-[var(--color-shiro)] transition-colors duration-500">
                    {cat.nameEn}
                  </span>

                  {/* ボトムグロー */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-[var(--color-shinku)]/50 transition-all duration-700" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 数珠ライン */}
      <div className="text-[var(--color-shinku)]/10 max-w-4xl mx-auto px-6">
        <JuzuLine />
      </div>

      {/* ブランドCTA */}
      <section className="relative py-36 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, var(--color-kuro) 0%, rgba(74,32,64,0.1) 50%, var(--color-kuro) 100%)',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <RakkanStamp text="SWAG" size={90} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.5, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-[var(--color-nezumi)] leading-[2.8] tracking-wider mb-12"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            書の筆致が生み出す一期一会の線。
            <br />
            朱印が刻む覚悟の印。
            <br />
            <span className="neon-red">経典の文字が織りなすテクスチャ。</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/about"
              className="inline-block px-10 py-4 border border-[var(--color-shinku)]/30 text-sm tracking-[0.3em] hover:border-[var(--color-shinku)] hover:text-[var(--color-shinku)] hover:shadow-[0_0_30px_rgba(196,30,58,0.2)] transition-all duration-500"
              style={{ fontFamily: 'var(--font-serif-jp)' }}
            >
              OUR CREED
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
