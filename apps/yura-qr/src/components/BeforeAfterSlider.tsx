'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Props = {
  readonly beforeSrc: string;
  readonly afterSrc: string;
  readonly beforeAlt: string;
  readonly afterAlt: string;
  readonly beforeLabel?: string;
  readonly afterLabel?: string;
  readonly caption?: string;
  readonly source?: string;
  readonly sourceUrl?: string;
};

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel = 'Before',
  afterLabel = 'After',
  caption,
  source,
  sourceUrl,
}: Props) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percentage);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      updatePosition(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] overflow-hidden cursor-col-resize select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="slider"
        aria-label="Before and after comparison"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 2));
          if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 2));
        }}
      >
        {/* After image (background layer) */}
        <div className="absolute inset-0">
          <Image
            src={afterSrc}
            alt={afterAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>

        {/* Before image (clipped foreground layer) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={beforeSrc}
            alt={beforeAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-accent z-10 pointer-events-none"
          style={{ left: `${position}%` }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-accent bg-background/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-accent"
            >
              <path
                d="M4 8L1 8M1 8L3 6M1 8L3 10M12 8L15 8M15 8L13 6M15 8L13 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <motion.div
          className="absolute top-4 left-4 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: position > 15 ? 1 : 0 }}
        >
          <span className="text-xs tracking-[0.2em] uppercase bg-background/70 backdrop-blur-sm px-3 py-1 text-foreground/80">
            {beforeLabel}
          </span>
        </motion.div>
        <motion.div
          className="absolute top-4 right-4 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: position < 85 ? 1 : 0 }}
        >
          <span className="text-xs tracking-[0.2em] uppercase bg-background/70 backdrop-blur-sm px-3 py-1 text-foreground/80">
            {afterLabel}
          </span>
        </motion.div>
      </div>

      {/* Caption & Source */}
      {(caption || source) && (
        <div className="mt-3 text-center">
          {caption && (
            <p className="text-sm text-foreground/60 font-serif">{caption}</p>
          )}
          {source && (
            <p className="text-xs text-foreground/50 mt-1">
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  {source}
                </a>
              ) : (
                source
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
