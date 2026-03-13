'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

type Props = {
  readonly sku: string;
  readonly garmentName?: string;
  readonly frontImageUrl?: string | null;
  readonly backImageUrl?: string | null;
};

export function HeroSection({ sku, garmentName }: Props) {
  const t = useTranslations('hero');

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* SKU identifier */}
        <motion.p
          className="text-accent-dim text-[10px] tracking-[0.4em] uppercase mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {sku}
        </motion.p>

        {/* Brand name */}
        <motion.h1
          className="font-display text-5xl md:text-7xl lg:text-8xl text-accent tracking-tight mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          YURA
        </motion.h1>

        {/* Garment name */}
        {garmentName && (
          <motion.p
            className="text-foreground/50 text-xs tracking-[0.2em] uppercase mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {garmentName}
          </motion.p>
        )}

        {/* Tagline */}
        <motion.p
          className="font-serif text-lg md:text-xl text-foreground/80 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {t('tagline')}
        </motion.p>

        <motion.p
          className="text-foreground/40 text-sm max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-accent-dim"
            >
              <path
                d="M12 5v14M19 12l-7 7-7-7"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
