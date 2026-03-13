'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type ColorVariant = 'black' | 'white';
type ViewState = 'front' | 'back' | 'inside-out';

type Props = {
  readonly locale: string;
};

const IMAGES: Record<ColorVariant, Record<ViewState, string>> = {
  black: {
    front: '/images/black-front.png',
    back: '/images/black-back.png',
    'inside-out': '/images/black-inside-out.png',
  },
  white: {
    front: '/images/white-front.png',
    back: '/images/white-back.png',
    'inside-out': '/images/white-inside-out.png',
  },
};

export function ReversibleShowcase({ locale }: Props) {
  const t = useTranslations('reversible');
  const [color, setColor] = useState<ColorVariant>('black');
  const [view, setView] = useState<ViewState>('front');

  const views: readonly ViewState[] = ['front', 'back', 'inside-out'];

  const handleNext = () => {
    const currentIndex = views.indexOf(view);
    const nextIndex = (currentIndex + 1) % views.length;
    setView(views[nextIndex]);
  };

  return (
    <section id="reversible" className="py-24 md:py-32 px-6 bg-surface">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-serif text-2xl md:text-4xl text-accent mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('title')}
        </motion.h2>

        <motion.p
          className="text-foreground/40 text-sm text-center mb-12 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('subtitle')}
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <motion.div
            className="relative aspect-[3/4] overflow-hidden cursor-pointer group"
            onClick={handleNext}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${color}-${view}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={IMAGES[color][view]}
                  alt={`YURA ${color} t-shirt ${view}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Tap hint overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-foreground/60 text-xs tracking-wider bg-background/60 backdrop-blur-sm px-4 py-2">
                {t('tap')}
              </span>
            </div>
          </motion.div>

          {/* Controls & Description */}
          <div className="flex flex-col gap-8">
            {/* Color selector */}
            <div className="flex items-center gap-4">
              <span className="text-foreground/30 text-xs tracking-wider uppercase">
                {t('color')}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setColor('black')}
                  className={`w-8 h-8 rounded-full border-2 transition-colors bg-[#111] ${
                    color === 'black' ? 'border-accent' : 'border-border'
                  }`}
                  aria-label="Black"
                />
                <button
                  onClick={() => setColor('white')}
                  className={`w-8 h-8 rounded-full border-2 transition-colors bg-[#E8E4DF] ${
                    color === 'white' ? 'border-accent' : 'border-border'
                  }`}
                  aria-label="White"
                />
              </div>
            </div>

            {/* View selector */}
            <div className="flex flex-col gap-3">
              {views.map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`text-left px-4 py-3 border transition-all ${
                    view === v
                      ? 'border-accent bg-accent/5 text-accent'
                      : 'border-border text-foreground/40 hover:text-foreground/70 hover:border-foreground/20'
                  }`}
                >
                  <span className="text-xs tracking-wider uppercase block">
                    {t(`views.${v}.label`)}
                  </span>
                  <span className="text-[11px] mt-1 block opacity-60">
                    {t(`views.${v}.description`)}
                  </span>
                </button>
              ))}
            </div>

            {/* Concept text */}
            <div className="border-t border-border pt-6">
              <p className="font-serif text-foreground/60 text-sm leading-relaxed">
                {t('concept')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
