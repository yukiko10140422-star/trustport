'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAudio } from '@/providers/AudioProvider';

type Props = {
  readonly locationName: string;
  readonly disasterDate: string;
  readonly heroVideoUrl?: string | null;
  readonly heroImageUrl?: string | null;
  readonly summary?: string | null;
};

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url) || /^[a-zA-Z0-9_-]{11}$/.test(url);
}

function extractYouTubeId(url: string): string {
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const match = url.match(YOUTUBE_REGEX);
  return match?.[1] ?? '';
}

/**
 * YouTube facade: shows a lightweight thumbnail first,
 * then lazy-loads the iframe after initial paint to avoid LCP penalty.
 */
function YouTubeFacade({
  videoId,
  fallbackImageUrl,
}: {
  videoId: string;
  fallbackImageUrl?: string | null;
}) {
  const [loadIframe, setLoadIframe] = useState(false);

  useEffect(() => {
    // Delay iframe load until after FCP/LCP to avoid blocking metrics.
    // Use requestIdleCallback where available, fallback to setTimeout.
    const id = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback(() => setLoadIframe(true), { timeout: 3000 })
      : setTimeout(() => setLoadIframe(true), 2000);

    return () => {
      if (typeof cancelIdleCallback !== 'undefined' && typeof id === 'number') {
        cancelIdleCallback(id);
      } else {
        clearTimeout(id as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <>
      {/* Lightweight thumbnail facade — loads instantly */}
      <img
        src={fallbackImageUrl ?? thumbnailUrl}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[3s] ${
          loadIframe ? 'opacity-0' : 'opacity-25'
        }`}
      />

      {/* YouTube iframe — loaded after idle to avoid LCP penalty */}
      {loadIframe && (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] md:w-[140%] md:h-[140%] opacity-35 pointer-events-none"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            allow="autoplay; encrypted-media"
            title="Memorial background video"
            loading="lazy"
          />
        </div>
      )}
    </>
  );
}

function useDaysSince(dateStr: string): number {
  return useMemo(() => {
    const disaster = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - disaster.getTime()) / (1000 * 60 * 60 * 24));
  }, [dateStr]);
}

function AnimatedCounter({ target, duration = 2.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Delay start for dramatic effect
    const delay = setTimeout(() => setHasStarted(true), 800);
    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();
    let frame: number;

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [hasStarted, target, duration]);

  return <>{count.toLocaleString()}</>;
}

export function ImmersiveOpening({
  locationName,
  disasterDate,
  heroVideoUrl,
  heroImageUrl,
  summary,
}: Props) {
  const t = useTranslations('memorial');
  const { isUnlocked, unlock, toggleAmbient, isAmbientPlaying } = useAudio();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const daysSince = useDaysSince(disasterDate);

  // Attempt to play video when loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setVideoLoaded(true);
      video.play().catch(() => {
        // Autoplay blocked — video will show as poster
      });
    };

    video.addEventListener('canplaythrough', handleCanPlay);
    return () => video.removeEventListener('canplaythrough', handleCanPlay);
  }, []);

  const handleSoundUnlock = () => {
    unlock();
    // Start ambient after short delay
    setTimeout(() => {
      toggleAmbient();
    }, 300);
  };

  return (
    <section
      id="memorial"
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Video / Image Background */}
      <div className="absolute inset-0">
        {heroVideoUrl && isYouTubeUrl(heroVideoUrl) ? (
          <YouTubeFacade
            videoId={extractYouTubeId(heroVideoUrl)}
            fallbackImageUrl={heroImageUrl}
          />
        ) : heroVideoUrl ? (
          <>
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[3s] ${
                videoLoaded ? 'opacity-40' : 'opacity-0'
              }`}
              src={heroVideoUrl}
              poster={heroImageUrl ?? undefined}
              muted
              loop
              playsInline
              preload="auto"
            />
            {/* Fallback image while video loads */}
            {heroImageUrl && !videoLoaded && (
              <img
                src={heroImageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
          </>
        ) : heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : null}

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent" />

        {/* Film grain effect */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 text-center">
        {/* Thin horizontal rule */}
        <motion.div
          className="w-12 h-[1px] bg-accent/40 mx-auto mb-10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />

        {/* Days since counter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <p className="text-foreground/25 text-[10px] tracking-[0.4em] uppercase mb-3">
            {disasterDate}
          </p>
          <p className="font-display text-5xl md:text-7xl lg:text-8xl text-accent/90 tabular-nums">
            <AnimatedCounter target={daysSince} duration={3} />
          </p>
          <p className="text-foreground/30 text-xs tracking-[0.25em] uppercase mt-2">
            {t('daysSince')}
          </p>
        </motion.div>

        {/* Location name */}
        <motion.h1
          className="font-serif text-3xl md:text-5xl lg:text-6xl text-foreground/95 mb-6 leading-[1.15] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.25, 0.1, 0, 1] }}
        >
          {locationName}
        </motion.h1>

        {/* Summary */}
        {summary && (
          <motion.p
            className="font-serif text-foreground/45 text-sm md:text-base leading-[1.8] max-w-lg mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.8 }}
          >
            {summary}
          </motion.p>
        )}

        {/* Sound unlock button */}
        <AnimatePresence>
          {!isUnlocked && (
            <motion.button
              onClick={handleSoundUnlock}
              className="inline-flex items-center gap-3 px-6 py-3 border border-accent/30 text-accent/80 text-xs tracking-[0.2em] uppercase hover:border-accent/60 hover:text-accent transition-all duration-500 group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8, delay: 2.5 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="group-hover:scale-110 transition-transform"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              {t('experienceWithSound')}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Sound controls (after unlock) */}
        <AnimatePresence>
          {isUnlocked && (
            <motion.button
              onClick={toggleAmbient}
              className="inline-flex items-center gap-2 text-foreground/20 text-[10px] tracking-[0.2em] uppercase hover:text-foreground/40 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {isAmbientPlaying ? (
                <span className="flex items-center gap-1.5">
                  <span className="flex gap-[2px]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-[2px] bg-accent/50 rounded-full"
                        animate={{ height: [3, 10, 3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: i * 0.15,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </span>
                  {t('soundOn')}
                </span>
              ) : (
                t('soundOff')
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <svg width="20" height="32" viewBox="0 0 20 32" fill="none" className="text-foreground/15">
            <rect x="1" y="1" width="18" height="30" rx="9" stroke="currentColor" strokeWidth="1" />
            <motion.circle
              cx="10"
              cy="10"
              r="2.5"
              fill="currentColor"
              animate={{ cy: [8, 16, 8] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
