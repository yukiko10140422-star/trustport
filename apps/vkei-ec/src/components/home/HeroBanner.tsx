'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SutraTexture } from '@/components/ui/SutraTexture';
import { RakkanStamp, IncenseSmoke, HaloEffect } from '@/components/ui/BuddhistMotifs';
import { GlitchText, Marquee, ParallaxContainer } from '@/components/ui/Effects';

export function HeroBanner() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[var(--color-kuro)]">
      {/* 深い闇のグラデーション */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(74,32,64,0.18) 0%, rgba(27,40,56,0.1) 40%, transparent 70%)',
        }}
      />

      <SutraTexture opacity={0.04} />
      <HaloEffect className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* 香煙 */}
      <div className="absolute left-[12%] bottom-[15%] opacity-30">
        <IncenseSmoke />
      </div>
      <div className="absolute right-[12%] bottom-[15%] opacity-30">
        <IncenseSmoke />
      </div>

      {/* 横スクロール経文 */}
      <div className="absolute top-[18%] left-0 right-0 opacity-[0.04]">
        <Marquee
          text="色即是空 空即是色 受想行識 亦復如是"
          speed={60}
          className="text-[11px] tracking-[0.5em]"
        />
      </div>
      <div className="absolute bottom-[18%] left-0 right-0 opacity-[0.04]">
        <Marquee
          text="照見五蘊皆空 度一切苦厄"
          speed={80}
          className="text-[11px] tracking-[0.5em]"
        />
      </div>

      {/* 中央コンテンツ */}
      <ParallaxContainer intensity={40} className="relative z-10 text-center px-4">
        {/* 朱印ロゴ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mb-10"
        >
          <RakkanStamp text="SWAG" size={110} />
        </motion.div>

        {/* メインタイトル — グリッチ */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glitch-heavy"
        >
          <GlitchText
            text="SWAG"
            as="h1"
            className="text-5xl sm:text-8xl md:text-9xl tracking-[0.5em] font-bold gold-shimmer"
          />
        </motion.div>

        {/* ディバイダー */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-40 h-px mx-auto my-8"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-shinku), var(--color-kin), transparent)' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-base sm:text-xl tracking-[0.5em] text-[var(--color-kin)] mb-2 neon-gold flicker"
          style={{ fontFamily: 'var(--font-serif-jp)' }}
        >
          經典街頭
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-xs tracking-[0.4em] text-[var(--color-nezumi)] mb-16"
          style={{ fontFamily: 'var(--font-serif-jp)' }}
        >
          墨と朱の世界観で纏う、新しい荘厳
        </motion.p>

        {/* CTAボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Link
            href="/collections"
            className="group relative px-10 py-4 overflow-hidden"
          >
            <div className="absolute inset-0 shu-gradient opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 30px rgba(196,30,58,0.4), inset 0 0 30px rgba(196,30,58,0.1)' }} />
            <span className="relative text-sm tracking-[0.3em] font-medium">ENTER</span>
          </Link>
          <Link
            href="/about"
            className="group px-10 py-4 border border-[var(--color-kin)]/20 text-sm tracking-[0.3em] hover:border-[var(--color-kin)] hover:text-[var(--color-kin)] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-500"
          >
            OUR CREED
          </Link>
        </motion.div>
      </ParallaxContainer>

      {/* 下部グラデーション */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-kuro)] to-transparent" />

      {/* スクロールインジケーター */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="text-[9px] tracking-[0.4em] text-[var(--color-nezumi)]">SCROLL</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-[var(--color-shu)] to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
