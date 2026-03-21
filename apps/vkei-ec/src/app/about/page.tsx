'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SutraTexture } from '@/components/ui/SutraTexture';
import { LotusIcon, RakkanStamp, JuzuLine, IncenseSmoke, HaloEffect } from '@/components/ui/BuddhistMotifs';

const PILLARS = [
  {
    kanji: '墨',
    title: 'SUMI',
    subtitle: '書の力',
    body: '草書・行書の筆致をグラフィックに。一筆一筆が宿す生命力を、衣に刻む。',
  },
  {
    kanji: '朱',
    title: 'SHU',
    subtitle: '印の覚悟',
    body: '落款はアイデンティティの証。SWAGの朱印は、纏う者の覚悟を象徴する。',
  },
  {
    kanji: '空',
    title: 'KU',
    subtitle: '空の自由',
    body: '全ては空。だからこそ、何にでもなれる。反骨と悟りが交差する地点。',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-20 pb-20">
      {/* ヒーロー */}
      <section className="relative py-40 overflow-hidden">
        <SutraTexture opacity={0.03} />
        <HaloEffect className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="absolute left-[20%] top-[30%] opacity-30">
          <IncenseSmoke />
        </div>
        <div className="absolute right-[20%] top-[30%] opacity-30">
          <IncenseSmoke />
        </div>

        <div className="relative text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <RakkanStamp text="SWAG" size={90} className="mx-auto mb-10" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl sm:text-5xl tracking-[0.5em] mb-4 gold-shimmer inline-block"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            OUR STORY
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-24 h-px mx-auto mt-6"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-kin), transparent)' }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.8 }}
            className="text-xs tracking-[0.3em] text-[var(--color-nezumi)] mt-6"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            經典街頭 — 墨と朱の荘厳
          </motion.p>
        </div>
      </section>

      {/* コンセプト */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <LotusIcon size={40} className="text-[var(--color-kin)]/30 mx-auto mb-6" />
          <h2 className="text-lg tracking-[0.3em] text-[var(--color-kin)]/60 mb-1" style={{ fontFamily: 'var(--font-serif-jp)' }}>
            CONCEPT
          </h2>
        </motion.div>

        <div className="space-y-8">
          {[
            'SWAGは、経典の美学とV系カルチャーの反骨精神を融合させたストリートウェアブランド。',
            '「色即是空、空即是色」—— 全ての形あるものは空であり、空だからこそ自由に形を取る。この哲学をファッションに昇華し、纏う者に自由を提供する。',
            '書道の筆致が生む一期一会の線。朱印が刻む覚悟の印。経典の文字が織りなすテクスチャ。伝統の美意識を、ストリートという現代の表現空間に解き放つ。',
          ].map((text, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.7, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-sm text-[var(--color-nezumi)] leading-[2.5] tracking-wider text-center"
              style={{ fontFamily: 'var(--font-serif-jp)' }}
            >
              {text}
            </motion.p>
          ))}
        </div>
      </section>

      {/* 数珠ライン */}
      <div className="text-[var(--color-kin)]/10 max-w-2xl mx-auto px-6">
        <JuzuLine />
      </div>

      {/* デザイン哲学 — 三本柱 */}
      <section className="relative bg-[var(--color-sumi)] py-24 overflow-hidden">
        <SutraTexture opacity={0.02} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg tracking-[0.3em] text-center text-[var(--color-kin)]/60 mb-16"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            DESIGN PHILOSOPHY
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.kanji}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative text-center group"
              >
                {/* 巨大背景文字 */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-700"
                  style={{ fontFamily: 'var(--font-serif-jp)', fontSize: '120px', fontWeight: 900 }}
                  aria-hidden="true"
                >
                  {pillar.kanji}
                </div>

                <span
                  className="text-5xl text-[var(--color-shu)] group-hover:text-[var(--color-shinku)] transition-colors duration-500"
                  style={{ fontFamily: 'var(--font-serif-jp)', fontWeight: 900 }}
                >
                  {pillar.kanji}
                </span>

                <div className="w-8 h-px mx-auto my-5" style={{ background: 'linear-gradient(90deg, transparent, var(--color-kin)/40, transparent)' }} />

                <h3 className="text-[11px] tracking-[0.3em] mb-1">{pillar.title}</h3>
                <p className="text-[10px] text-[var(--color-kin)]/40 tracking-wider mb-4" style={{ fontFamily: 'var(--font-serif-jp)' }}>
                  {pillar.subtitle}
                </p>
                <p className="text-xs text-[var(--color-nezumi)]/60 leading-[2]" style={{ fontFamily: 'var(--font-serif-jp)' }}>
                  {pillar.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(74,32,64,0.08) 0%, transparent 60%)',
          }}
        />

        <div className="relative text-center px-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl tracking-[0.5em] mb-10 gold-shimmer inline-block"
            style={{ fontFamily: 'var(--font-serif-jp)', fontWeight: 700 }}
          >
            般若心經
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/collections"
              className="group relative inline-block px-10 py-4 overflow-hidden"
            >
              <div className="absolute inset-0 shu-gradient opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-sm tracking-[0.3em]">EXPLORE COLLECTION</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
