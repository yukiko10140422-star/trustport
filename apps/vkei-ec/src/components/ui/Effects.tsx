'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/** フィルムグレイン・ノイズオーバーレイ */
export function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.035]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
        mixBlendMode: 'overlay',
      }}
    />
  );
}

/** グリッチテキスト */
export function GlitchText({
  text,
  className = '',
  as: Tag = 'span',
}: {
  readonly text: string;
  readonly className?: string;
  readonly as?: 'span' | 'h1' | 'h2' | 'p';
}) {
  return (
    <Tag className={`relative inline-block glitch-wrapper ${className}`}>
      <span className="glitch-text" data-text={text}>
        {text}
      </span>
    </Tag>
  );
}

/** カスタムカーソル — 朱色の円 */
export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { damping: 25, stiffness: 300 });
  const springY = useSpring(cursorY, { damping: 25, stiffness: 300 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // モバイルではカーソル非表示
    if (window.matchMedia('(pointer: coarse)').matches) return;

    setIsVisible(true);

    function onMove(e: MouseEvent) {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    }

    function onEnterInteractive() { setIsHovering(true); }
    function onLeaveInteractive() { setIsHovering(false); }

    window.addEventListener('mousemove', onMove);

    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, [data-cursor-hover]').forEach((el) => {
        el.addEventListener('mouseenter', onEnterInteractive);
        el.addEventListener('mouseleave', onLeaveInteractive);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll('a, button, [data-cursor-hover]').forEach((el) => {
      el.addEventListener('mouseenter', onEnterInteractive);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      observer.disconnect();
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      {/* メインカーソル */}
      <motion.div
        className="fixed top-0 left-0 z-[10000] pointer-events-none mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full border border-[var(--color-shu)]"
          animate={{
            width: isHovering ? 50 : 20,
            height: isHovering ? 50 : 20,
            borderColor: isHovering ? 'var(--color-kin)' : 'var(--color-shu)',
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        />
      </motion.div>
      {/* ドット */}
      <motion.div
        className="fixed top-0 left-0 z-[10000] pointer-events-none w-1 h-1 rounded-full bg-[var(--color-shu)]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      {/* デフォルトカーソル非表示 */}
      <style>{`* { cursor: none !important; }`}</style>
    </>
  );
}

/** スキャンライン — VHS風 */
export function ScanLines() {
  return (
    <div
      className="fixed inset-0 z-[9998] pointer-events-none opacity-[0.03]"
      style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)',
        backgroundSize: '100% 2px',
      }}
    />
  );
}

/** マウス追従パララックスコンテナ */
export function ParallaxContainer({
  children,
  intensity = 20,
  className = '',
}: {
  readonly children: React.ReactNode;
  readonly intensity?: number;
  readonly className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { damping: 30, stiffness: 150 });
  const smoothY = useSpring(y, { damping: 30, stiffness: 150 });

  useEffect(() => {
    function handleMouse(e: MouseEvent) {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) / intensity);
      y.set((e.clientY - centerY) / intensity);
    }
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [intensity, x, y]);

  return (
    <motion.div ref={ref} style={{ x: smoothX, y: smoothY }} className={className}>
      {children}
    </motion.div>
  );
}

/** マーキー（無限スクロールテキスト） */
export function Marquee({
  text,
  speed = 30,
  className = '',
}: {
  readonly text: string;
  readonly className?: string;
  readonly speed?: number;
}) {
  const repeated = `${text} \u00B7 `.repeat(10);
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="inline-block"
        style={{
          animation: `sutra-scroll-horizontal ${speed}s linear infinite`,
        }}
      >
        <span className="inline-block">{repeated}</span>
        <span className="inline-block">{repeated}</span>
      </div>
    </div>
  );
}
