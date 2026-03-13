'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

type Props = {
  readonly sku: string;
  readonly shareUrl: string;
};

const SHARE_PLATFORMS = [
  {
    name: 'X',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    getUrl: (url: string, text: string) =>
      `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: 'LINE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 5.813 2 10.5c0 3.975 3.525 7.313 8.288 7.95.322.07.762.213.873.488.1.25.065.638.032.888l-.14.875c-.044.262-.2 1.025.887.562 1.088-.462 5.875-3.462 8.013-5.925C21.85 13.212 22 11.912 22 10.5 22 5.813 17.52 2 12 2z" />
      </svg>
    ),
    getUrl: (url: string, _text: string) =>
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Instagram',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    getUrl: () => '#',
  },
] as const;

export function CommunitySection({ sku, shareUrl }: Props) {
  const t = useTranslations('community');

  const shareText = `${t('share')} ${t('hashtag')} #YURA ${sku}`;

  return (
    <section id="community" className="py-24 md:py-32 px-6">
      <div className="max-w-lg mx-auto text-center">
        <motion.h2
          className="font-serif text-2xl md:text-4xl text-accent mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('title')}
        </motion.h2>

        <motion.p
          className="text-foreground/50 text-sm mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('share')}
        </motion.p>

        {/* Share buttons */}
        <motion.div
          className="flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {SHARE_PLATFORMS.map((platform) => (
            <a
              key={platform.name}
              href={platform.getUrl(shareUrl, shareText)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center border border-border text-foreground/60 hover:text-accent hover:border-accent transition-colors"
              aria-label={`Share on ${platform.name}`}
            >
              {platform.icon}
            </a>
          ))}
        </motion.div>

        {/* Hashtag */}
        <motion.p
          className="mt-8 text-accent/70 font-display text-lg tracking-wider"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {t('hashtag')}
        </motion.p>
      </div>
    </section>
  );
}
