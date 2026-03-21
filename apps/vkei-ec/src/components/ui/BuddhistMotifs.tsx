'use client';

/** 蓮華（Lotus）SVG */
export function LotusIcon({ size = 40, className = '' }: { readonly size?: number; readonly className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 中央の花弁 */}
      <ellipse cx="50" cy="45" rx="8" ry="25" fill="currentColor" opacity="0.9" />
      {/* 左の花弁 */}
      <ellipse cx="50" cy="45" rx="8" ry="25" fill="currentColor" opacity="0.7" transform="rotate(-30 50 55)" />
      <ellipse cx="50" cy="45" rx="8" ry="25" fill="currentColor" opacity="0.5" transform="rotate(-60 50 55)" />
      {/* 右の花弁 */}
      <ellipse cx="50" cy="45" rx="8" ry="25" fill="currentColor" opacity="0.7" transform="rotate(30 50 55)" />
      <ellipse cx="50" cy="45" rx="8" ry="25" fill="currentColor" opacity="0.5" transform="rotate(60 50 55)" />
      {/* 台座 */}
      <path d="M25 70 Q50 60 75 70 Q50 80 25 70Z" fill="currentColor" opacity="0.3" />
      <path d="M20 75 Q50 65 80 75 Q50 85 20 75Z" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

/** 梵字 (バン) - 大日如来 SVG風 */
export function BonjiIcon({ size = 60, className = '' }: { readonly size?: number; readonly className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <text x="50" y="58" textAnchor="middle" fontSize="36" fill="currentColor" fontFamily="var(--font-serif-jp)" fontWeight="bold">
        梵
      </text>
    </svg>
  );
}

/** 数珠（念珠）パターン — 横ライン装飾 */
export function JuzuLine({ className = '' }: { readonly className?: string }) {
  return (
    <svg width="100%" height="12" viewBox="0 0 400 12" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      {Array.from({ length: 33 }, (_, i) => (
        <circle key={i} cx={6 + i * 12} cy="6" r="3" fill="currentColor" opacity={i % 11 === 0 ? 0.8 : 0.3} />
      ))}
    </svg>
  );
}

/** 落款（朱印）スタンプ */
export function RakkanStamp({
  text = 'SWAG',
  size = 64,
  className = '',
}: {
  readonly text?: string;
  readonly size?: number;
  readonly className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 外枠 — かすれた朱印感 */}
      <div
        className="absolute inset-0 border-2 border-[var(--color-shu)] rotate-[2deg]"
        style={{
          maskImage: 'linear-gradient(135deg, black 40%, transparent 45%, black 50%, transparent 55%, black 60%)',
          WebkitMaskImage: 'linear-gradient(135deg, black 40%, transparent 45%, black 50%, transparent 55%, black 60%)',
        }}
      />
      {/* 内側の枠 */}
      <div className="absolute inset-[3px] border border-[var(--color-shu)]/40 rotate-[2deg]" />
      {/* テキスト */}
      <span
        className="relative text-[var(--color-shu)] font-bold rotate-[2deg]"
        style={{
          fontFamily: 'var(--font-serif-jp)',
          fontSize: size * 0.28,
          letterSpacing: '0.05em',
        }}
      >
        {text}
      </span>
    </div>
  );
}

/** 光背（後光）エフェクト */
export function HaloEffect({ className = '' }: { readonly className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <div
        className="w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, var(--color-kin) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

/** 香煙（インセンス）アニメーション */
export function IncenseSmoke({ className = '' }: { readonly className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {[0, 0.8, 1.6].map((delay) => (
        <div
          key={delay}
          className="w-0.5 h-8 bg-gradient-to-t from-[var(--color-nezumi)]/30 to-transparent rounded-full incense-smoke"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
      {/* 香炉のドット */}
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-shu)]/60" />
    </div>
  );
}
