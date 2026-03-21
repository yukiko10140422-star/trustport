'use client';

const SUTRA_TEXT =
  '観自在菩薩行深般若波羅蜜多時照見五蘊皆空度一切苦厄舎利子色不異空空不異色色即是空空即是色受想行識亦復如是';

export function SutraTexture({
  opacity = 0.03,
  className = '',
}: {
  readonly opacity?: number;
  readonly className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <div
        className="text-[10px] leading-[14px] break-all text-[var(--color-shiro)] whitespace-pre-wrap"
        style={{ fontFamily: 'var(--font-serif-jp)' }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>{SUTRA_TEXT}</p>
        ))}
      </div>
    </div>
  );
}
