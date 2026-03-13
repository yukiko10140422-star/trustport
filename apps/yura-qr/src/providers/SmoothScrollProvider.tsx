'use client';

import { ReactLenis } from 'lenis/react';
import type { ReactNode } from 'react';

type Props = {
  readonly children: ReactNode;
};

export function SmoothScrollProvider({ children }: Props) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 0.8,
      }}
    >
      {children}
    </ReactLenis>
  );
}
