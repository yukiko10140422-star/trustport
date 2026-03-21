'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/categories';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (y) => setIsScrolled(y > 50));
  }, [scrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[var(--color-kuro)]/95 backdrop-blur-lg border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* ハンバーガー */}
          <button
            type="button"
            className="sm:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <motion.span
              className="block w-6 h-[1px] bg-[var(--color-shiro)]"
              animate={isMobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            />
            <motion.span
              className="block w-4 h-[1px] bg-[var(--color-shiro)]"
              animate={isMobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
            />
            <motion.span
              className="block w-6 h-[1px] bg-[var(--color-shiro)]"
              animate={isMobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
            />
          </button>

          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 border border-[var(--color-shu)] flex items-center justify-center rotate-[2deg] group-hover:rotate-0 transition-transform duration-500"
              style={{
                maskImage: 'linear-gradient(135deg, black 50%, rgba(0,0,0,0.7) 100%)',
                WebkitMaskImage: 'linear-gradient(135deg, black 50%, rgba(0,0,0,0.7) 100%)',
              }}
            >
              <span
                className="text-[var(--color-shu)] text-[9px] font-bold tracking-wider"
                style={{ fontFamily: 'var(--font-serif-jp)' }}
              >
                SWAG
              </span>
            </div>
            <div className="hidden sm:block">
              <span
                className="text-base tracking-[0.4em] text-[var(--color-shiro)] font-bold"
                style={{ fontFamily: 'var(--font-serif-jp)' }}
              >
                SWAG
              </span>
              <span className="block text-[9px] text-[var(--color-nezumi)]/50 tracking-[0.3em]">
                經典街頭
              </span>
            </div>
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden sm:flex items-center gap-8">
            <Link
              href="/collections"
              className="relative text-[11px] tracking-[0.25em] text-[var(--color-nezumi)] hover:text-[var(--color-shiro)] transition-colors duration-300 py-1 group"
            >
              ALL
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--color-kin)] group-hover:w-full transition-all duration-300" />
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className="relative text-[11px] tracking-[0.25em] text-[var(--color-nezumi)] hover:text-[var(--color-shiro)] transition-colors duration-300 py-1 group"
              >
                {cat.nameEn}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--color-kin)] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            <Link
              href="/about"
              className="relative text-[11px] tracking-[0.25em] text-[var(--color-nezumi)] hover:text-[var(--color-shiro)] transition-colors duration-300 py-1 group"
            >
              ABOUT
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--color-kin)] group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          {/* カートアイコン */}
          <button
            type="button"
            className="relative p-2 group"
            aria-label="Cart"
            data-cart-toggle
          >
            <svg
              className="w-5 h-5 text-[var(--color-shiro)] group-hover:text-[var(--color-kin)] transition-colors duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-shu)] text-white text-[9px] flex items-center justify-center"
                style={{ fontFamily: 'var(--font-serif-jp)' }}
              >
                {itemCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden bg-[var(--color-kuro)]/98 backdrop-blur-xl border-t border-white/5"
          >
            <nav className="flex flex-col px-6 py-6 gap-5">
              <Link
                href="/collections"
                className="text-[11px] tracking-[0.3em] text-[var(--color-nezumi)] hover:text-[var(--color-kin)] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ALL ITEMS
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  className="text-[11px] tracking-[0.3em] text-[var(--color-nezumi)] hover:text-[var(--color-kin)] transition-colors flex items-center justify-between"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{cat.nameEn}</span>
                  <span className="text-[var(--color-nezumi)]/30" style={{ fontFamily: 'var(--font-serif-jp)' }}>
                    {cat.name}
                  </span>
                </Link>
              ))}
              <div className="border-t border-white/5 pt-5">
                <Link
                  href="/about"
                  className="text-[11px] tracking-[0.3em] text-[var(--color-nezumi)] hover:text-[var(--color-kin)] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ABOUT
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
