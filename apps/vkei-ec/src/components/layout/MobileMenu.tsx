'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '@/data/categories';

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
};

export function MobileMenu({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-[70] w-80 bg-kuro border-r border-hai/30 flex flex-col"
          >
            {/* Close button */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-hai/30">
              <span className="text-lg font-bold tracking-[0.3em]" style={{ fontFamily: 'var(--font-serif-jp)' }}>
                SWAG
              </span>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-nezumi hover:text-shiro" aria-label="閉じる">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 px-6 py-8 flex flex-col gap-6">
              <Link href="/collections" onClick={onClose} className="text-xl tracking-wider text-shiro hover:text-shinku transition-colors">
                ALL ITEMS
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  onClick={onClose}
                  className="text-lg tracking-wider text-nezumi hover:text-shinku transition-colors pl-4 border-l border-hai/30"
                >
                  {cat.nameEn}
                </Link>
              ))}
              <div className="border-t border-hai/30 pt-6">
                <Link href="/about" onClick={onClose} className="text-lg tracking-wider text-nezumi hover:text-kin transition-colors">
                  ABOUT
                </Link>
              </div>
            </div>

            {/* Bottom sutra texture */}
            <div className="px-6 py-4 border-t border-hai/30 text-[8px] text-hai leading-relaxed overflow-hidden h-20" style={{ fontFamily: 'var(--font-serif-jp)' }}>
              観自在菩薩行深般若波羅蜜多時照見五蘊皆空度一切苦厄舎利子色不異空空不異色色即是空空即是色受想行識亦復如是
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
