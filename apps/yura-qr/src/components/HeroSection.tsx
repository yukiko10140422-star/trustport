'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type Props = {
  readonly sku: string;
  readonly garmentName?: string;
  readonly frontImageUrl?: string | null;
  readonly backImageUrl?: string | null;
};

export function HeroSection({ sku, garmentName, frontImageUrl }: Props) {
  const t = useTranslations('hero');

  const heroImage = frontImageUrl ?? '/images/black-front.png';

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-end overflow-hidden"
    >
      {/* Full-bleed hero image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="YURA collection"
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent" />
      </div>

      {/* Content overlay at bottom */}
      <motion.div
        className="relative z-10 w-full px-6 pb-16 md:pb-24 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* SKU */}
        <motion.p
          className="text-accent-dim text-[10px] tracking-[0.4em] uppercase mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {sku}
        </motion.p>

        {/* Brand name */}
        <motion.h1
          className="font-display text-6xl md:text-8xl lg:text-9xl text-accent tracking-tight mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          YURA
        </motion.h1>

        {/* Garment name */}
        {garmentName && (
          <motion.p
            className="text-foreground/50 text-xs tracking-[0.2em] uppercase mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {garmentName}
          </motion.p>
        )}

        {/* Tagline */}
        <motion.p
          className="font-serif text-lg md:text-2xl text-foreground/90 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {t('tagline')}
        </motion.p>

        <motion.p
          className="text-foreground/60 text-sm max-w-sm mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t('subtitle')}
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="mt-12"
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
              className="text-accent/70 mx-auto"
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
