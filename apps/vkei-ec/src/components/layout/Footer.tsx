import Link from 'next/link';
import { categories } from '@/data/categories';
import { JuzuLine } from '@/components/ui/BuddhistMotifs';

const SUTRA_BG = '観自在菩薩行深般若波羅蜜多時照見五蘊皆空度一切苦厄';

export function Footer() {
  return (
    <footer className="relative bg-[var(--color-sumi)] border-t border-white/5 overflow-hidden">
      {/* 経文テクスチャ */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none select-none text-[9px] leading-[13px] break-all overflow-hidden"
        style={{ fontFamily: 'var(--font-serif-jp)' }}
        aria-hidden="true"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <p key={i}>{SUTRA_BG}</p>
        ))}
      </div>

      {/* 数珠ライン */}
      <div className="text-[var(--color-kin)]/10">
        <JuzuLine />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          {/* ブランド */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 border border-[var(--color-shu)] flex items-center justify-center rotate-[2deg]">
                <span className="text-[var(--color-shu)] text-[9px] font-bold" style={{ fontFamily: 'var(--font-serif-jp)' }}>
                  SWAG
                </span>
              </div>
              <div>
                <span className="text-base tracking-[0.4em] font-bold" style={{ fontFamily: 'var(--font-serif-jp)' }}>
                  SWAG
                </span>
                <span className="block text-[9px] text-[var(--color-nezumi)]/40 tracking-[0.3em]">
                  經典街頭
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--color-nezumi)]/60 leading-[2]" style={{ fontFamily: 'var(--font-serif-jp)' }}>
              墨と朱の世界観で纏う、
              <br />
              新しい荘厳。
            </p>
          </div>

          {/* カテゴリ */}
          <div>
            <h3 className="text-[11px] tracking-[0.3em] text-[var(--color-kin)]/60 mb-5" style={{ fontFamily: 'var(--font-serif-jp)' }}>
              COLLECTIONS
            </h3>
            <nav className="flex flex-col gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  className="text-xs text-[var(--color-nezumi)]/50 hover:text-[var(--color-shiro)] transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-[8px] text-[var(--color-kin)]/30" style={{ fontFamily: 'var(--font-serif-jp)' }}>
                    {cat.name.charAt(0)}
                  </span>
                  {cat.nameEn}
                </Link>
              ))}
            </nav>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-[11px] tracking-[0.3em] text-[var(--color-kin)]/60 mb-5" style={{ fontFamily: 'var(--font-serif-jp)' }}>
              INFO
            </h3>
            <nav className="flex flex-col gap-3">
              <Link href="/about" className="text-xs text-[var(--color-nezumi)]/50 hover:text-[var(--color-shiro)] transition-colors duration-300">
                About
              </Link>
              <span className="text-xs text-[var(--color-nezumi)]/30">
                info@swag-sutra.jp
              </span>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/5 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[var(--color-nezumi)]/30">
            &copy; 2026 SWAG. All rights reserved.
          </p>
          <p
            className="text-[10px] text-[var(--color-kin)]/20 tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-serif-jp)' }}
          >
            色即是空 空即是色
          </p>
        </div>
      </div>
    </footer>
  );
}
