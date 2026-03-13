import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="font-display text-5xl md:text-7xl text-accent tracking-tight mb-6">
        YURA
      </h1>
      <p className="font-serif text-xl md:text-2xl text-foreground/80 mb-4">
        {t('hero.tagline')}
      </p>
      <p className="text-foreground/50 text-sm mb-12 max-w-md text-center">
        {t('hero.subtitle')}
      </p>
      <Link
        href="/garment/SAMPLE-001"
        className="border border-accent text-accent px-8 py-3 text-sm tracking-widest uppercase hover:bg-accent hover:text-background transition-colors duration-300"
      >
        {t('hero.cta')}
      </Link>
    </main>
  );
}
