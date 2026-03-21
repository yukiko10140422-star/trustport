'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProductBySlug, getProductsByCategory } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { formatPrice, formatPriceWithTax } from '@/lib/format';
import { ProductGrid } from '@/components/product/ProductGrid';
import { RakkanStamp, JuzuLine } from '@/components/ui/BuddhistMotifs';
import { SutraTexture } from '@/components/ui/SutraTexture';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="pt-24 pb-20 text-center">
        <p className="text-[var(--color-nezumi)]">商品が見つかりません</p>
        <Link href="/collections" className="text-[var(--color-shinku)] mt-4 inline-block text-sm">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  function handleAddToCart() {
    if (!selectedSize || !product) return;
    addItem(product, selectedSize);
    setIsAdded(true);
    window.dispatchEvent(new Event('open-cart'));
    setTimeout(() => setIsAdded(false), 2000);
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* パンくず */}
        <nav className="text-[10px] tracking-wider text-[var(--color-nezumi)]/40 mb-10 flex items-center gap-2">
          <Link href="/" className="hover:text-[var(--color-shiro)] transition-colors">HOME</Link>
          <span className="text-[var(--color-kin)]/20">/</span>
          <Link href={`/collections/${product.category}`} className="hover:text-[var(--color-shiro)] transition-colors">
            {product.category.toUpperCase()}
          </Link>
          <span className="text-[var(--color-kin)]/20">/</span>
          <span className="text-[var(--color-shiro)]">{product.nameEn}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* 商品画像 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[3/4] bg-[var(--color-sumi)] flex items-center justify-center border border-white/5 overflow-hidden">
              <SutraTexture opacity={0.02} />
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.15) 0%, transparent 60%)',
                }}
              />
              <div className="relative text-center">
                <span
                  className="text-7xl sm:text-8xl text-[var(--color-nezumi)]/15"
                  style={{ fontFamily: 'var(--font-serif-jp)', fontWeight: 900 }}
                >
                  {product.name.charAt(0)}
                </span>
                <p
                  className="text-[8px] text-[var(--color-nezumi)]/10 mt-4 px-10 break-all leading-[2] tracking-wider"
                  style={{ fontFamily: 'var(--font-serif-jp)' }}
                >
                  色即是空空即是色受想行識亦復如是
                </p>
              </div>
            </div>
          </motion.div>

          {/* 商品情報 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] tracking-[0.3em] text-[var(--color-kin)]/50 mb-3">
              {product.nameEn}
            </p>
            <h1
              className="text-2xl sm:text-3xl tracking-wider mb-6"
              style={{ fontFamily: 'var(--font-serif-jp)' }}
            >
              {product.name}
            </h1>

            <div className="mb-8">
              <span className="text-2xl gold-shimmer inline-block" style={{ fontFamily: 'var(--font-serif-jp)' }}>
                {formatPrice(product.price)}
              </span>
              <span className="text-[11px] text-[var(--color-nezumi)]/40 ml-3">
                {formatPriceWithTax(product.price)}
              </span>
            </div>

            <div className="w-full h-px mb-8" style={{ background: 'linear-gradient(90deg, var(--color-kin)/20, transparent)' }} />

            <p className="text-sm text-[var(--color-nezumi)]/70 leading-[2.2] mb-10" style={{ fontFamily: 'var(--font-serif-jp)' }}>
              {product.description}
            </p>

            {/* サイズ選択 */}
            <div className="mb-8">
              <p className="text-[11px] tracking-[0.2em] text-[var(--color-nezumi)] mb-4">SIZE</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`px-5 py-2.5 text-sm transition-all duration-300 ${
                      selectedSize === size
                        ? 'bg-[var(--color-shinku)]/20 border border-[var(--color-shinku)] text-[var(--color-shiro)]'
                        : 'border border-white/10 text-[var(--color-nezumi)] hover:border-[var(--color-kin)]/30 hover:text-[var(--color-shiro)]'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* カートに追加 */}
            <button
              type="button"
              className={`w-full py-4 text-sm tracking-[0.3em] transition-all duration-500 relative overflow-hidden ${
                !selectedSize
                  ? 'bg-[var(--color-hai)] text-[var(--color-nezumi)]/40 cursor-not-allowed'
                  : isAdded
                    ? 'bg-[var(--color-kin)] text-[var(--color-kuro)]'
                    : 'shu-gradient text-[var(--color-shiro)] hover:shadow-[0_0_30px_rgba(196,30,58,0.3)]'
              }`}
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              {!selectedSize
                ? 'SELECT SIZE'
                : isAdded
                  ? 'ADDED TO CART'
                  : 'ADD TO CART'}
            </button>

            {/* ブランドマーク */}
            <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-4">
              <RakkanStamp text="SWAG" size={44} />
              <div>
                <p className="text-[11px] text-[var(--color-nezumi)]/40 tracking-wider" style={{ fontFamily: 'var(--font-serif-jp)' }}>
                  經典街頭
                </p>
                <p className="text-[10px] text-[var(--color-nezumi)]/25">
                  墨と朱の荘厳
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 関連商品 */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <div className="text-[var(--color-kin)]/10 mb-12">
              <JuzuLine />
            </div>
            <h2
              className="text-lg tracking-[0.3em] mb-10"
              style={{ fontFamily: 'var(--font-serif-jp)' }}
            >
              RELATED ITEMS
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
