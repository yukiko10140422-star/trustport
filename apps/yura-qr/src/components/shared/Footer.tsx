'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="py-12 px-6 border-t border-border/20">
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-display text-accent/40 text-sm tracking-wider mb-4">YURA</p>
        <p className="text-foreground/25 text-[10px] leading-relaxed max-w-md mx-auto mb-6">
          {t('disclaimer')}
        </p>
        <div className="flex justify-center gap-4 text-foreground/20 text-[10px]">
          <span>{t('sources')}</span>
        </div>
        <p className="text-foreground/15 text-[10px] mt-4">
          &copy; {new Date().getFullYear()} YURA. {t('rights')}
        </p>
      </div>
    </footer>
  );
}
