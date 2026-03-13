'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

type Props = {
  readonly sku: string;
  readonly shareUrl: string;
  readonly locationName: string;
};

export function TakeActionSection({ sku, shareUrl, locationName }: Props) {
  const t = useTranslations('action');

  const shareText = `${locationName} — ${t('shareText')} #RememberNamie #YURA ${sku}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  return (
    <section id="action" className="py-24 md:py-32 px-6 border-t border-border/30">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          className="font-serif text-2xl md:text-4xl text-accent mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('title')}
        </motion.h2>
        <motion.p
          className="text-foreground/50 text-sm mb-16 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('subtitle')}
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Share */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-accent/70 mb-4 flex justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <h3 className="font-serif text-foreground/80 mb-2">{t('share.title')}</h3>
            <p className="text-foreground/60 text-xs mb-4">{t('share.description')}</p>
            <div className="flex justify-center gap-3">
              <a
                href={`https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border/50 text-foreground/60 text-xs tracking-wider hover:border-accent hover:text-accent transition-colors"
              >
                X
              </a>
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border/50 text-foreground/60 text-xs tracking-wider hover:border-accent hover:text-accent transition-colors"
              >
                LINE
              </a>
            </div>
          </motion.div>

          {/* Visit */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-accent/70 mb-4 flex justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="font-serif text-foreground/80 mb-2">{t('visit.title')}</h3>
            <p className="text-foreground/60 text-xs mb-4">{t('visit.description')}</p>
            <a
              href="https://www.town.namie.fukushima.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 border border-border/50 text-foreground/60 text-xs tracking-wider hover:border-accent hover:text-accent transition-colors"
            >
              {t('visit.link')}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17l9.2-9.2M17 17V7.8H7.8" />
              </svg>
            </a>
          </motion.div>

          {/* Support */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-accent/70 mb-4 flex justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3 className="font-serif text-foreground/80 mb-2">{t('support.title')}</h3>
            <p className="text-foreground/60 text-xs mb-4">{t('support.description')}</p>
            <a
              href="https://www.furusato-tax.jp/city/product/07548"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 border border-border/50 text-foreground/60 text-xs tracking-wider hover:border-accent hover:text-accent transition-colors"
            >
              {t('support.link')}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17l9.2-9.2M17 17V7.8H7.8" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
