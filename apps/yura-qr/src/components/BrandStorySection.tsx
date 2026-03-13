'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { BrandContent } from '@/types/database';

type Props = {
  readonly content: BrandContent | null;
  readonly locale: string;
};

export function BrandStorySection({ content, locale }: Props) {
  const t = useTranslations('story');

  const title = content
    ? (locale === 'en' ? content.title_en : content.title_ja)
    : t('title');

  const body = content
    ? (locale === 'en' && content.body_en ? content.body_en : content.body_ja)
    : null;

  return (
    <section id="story" className="py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          className="font-serif text-2xl md:text-4xl text-accent mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.h2>

        {body ? (
          <motion.div
            className="font-serif text-foreground/70 text-sm md:text-base leading-relaxed space-y-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {body.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center text-foreground/30 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p>YURAは「記憶を着る」をコンセプトに、</p>
            <p className="mt-2">被災地の風化しゆく記憶をファッションを通じて日常に溶け込ませる</p>
            <p className="mt-2">デジタルアーカイブ・ファッションブランドです。</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
