'use client';

import { NoiseOverlay, ScanLines, CustomCursor } from '@/components/ui/Effects';

export function GlobalEffects() {
  return (
    <>
      <NoiseOverlay />
      <ScanLines />
      <CustomCursor />
    </>
  );
}
