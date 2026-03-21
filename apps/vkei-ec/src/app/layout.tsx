import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { GlobalEffects } from '@/components/layout/GlobalEffects';

export const metadata: Metadata = {
  title: 'SWAG - お経 × V系 ストリートウェア',
  description:
    '般若心経と仏教美学をストリートファッションに昇華。墨と朱の世界観で纏う、新しい荘厳。',
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&family=Noto+Sans+JP:wght@300;400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <GlobalEffects />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
