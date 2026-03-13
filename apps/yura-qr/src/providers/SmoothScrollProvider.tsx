'use client';

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ReactNode } from 'react';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  readonly children: ReactNode;
};

/**
 * Bridges Lenis smooth scroll with GSAP ScrollTrigger.
 * Without this, ScrollTrigger reads native scroll position
 * while Lenis interpolates it — causing animation desync.
 */
function LenisScrollTriggerBridge() {
  useLenis((data) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    // Tell GSAP to use Lenis's scroll wrapper for calculations
    gsap.ticker.lagSmoothing(0);

    // Connect GSAP ticker to requestAnimationFrame (Lenis already drives RAF)
    ScrollTrigger.defaults({ toggleActions: 'play none none reverse' });
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.killAll();
    };
  }, []);

  return null;
}

export function SmoothScrollProvider({ children }: Props) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 0.8,
        syncTouch: true,
      }}
    >
      <LenisScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
