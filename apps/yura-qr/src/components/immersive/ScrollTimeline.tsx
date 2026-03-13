'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { localizedWithFallback, type Locale } from '@/lib/i18n';
import { sanitizeExternalUrl } from '@/lib/url';
import type { DisasterTimelineEvent } from '@/types/database';

gsap.registerPlugin(ScrollTrigger);

const EVENT_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
  earthquake: { bg: 'bg-red-900/20', dot: 'bg-red-600', text: 'text-red-500/80' },
  tsunami: { bg: 'bg-blue-900/20', dot: 'bg-blue-600', text: 'text-blue-400/80' },
  nuclear: { bg: 'bg-yellow-900/20', dot: 'bg-yellow-500', text: 'text-yellow-400/80' },
  evacuation: { bg: 'bg-gray-800/30', dot: 'bg-gray-400', text: 'text-gray-400/80' },
  recovery: { bg: 'bg-emerald-900/20', dot: 'bg-emerald-500', text: 'text-emerald-400/80' },
};

type Props = {
  readonly events: readonly DisasterTimelineEvent[];
  readonly locale: Locale;
};

export function ScrollTimeline({ events, locale }: Props) {
  const t = useTranslations('timeline');
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    const progressBar = progressRef.current;
    if (!container || !track || !progressBar || events.length === 0) return;

    // Calculate how far to scroll horizontally
    const totalWidth = track.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      // Pin the section and scroll horizontally
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, {
        x: -totalWidth,
        ease: 'none',
      });

      // Progress bar
      tl.to(progressBar, {
        scaleX: 1,
        ease: 'none',
      }, 0);

      // Stagger in each card
      const cards = track.querySelectorAll('[data-timeline-card]');
      cards.forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0.2, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            scrollTrigger: {
              trigger: card,
              containerAnimation: tl,
              start: 'left 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, container);

    return () => ctx.revert();
  }, [events.length]);

  if (events.length === 0) return null;

  return (
    <section id="timeline" className="relative" ref={containerRef}>
      {/* Header - fixed during pin */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-8 pb-4 px-6 bg-gradient-to-b from-background via-background/95 to-transparent pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <p className="text-foreground/40 text-[10px] tracking-[0.4em] uppercase mb-2">
              {t('subtitle')}
            </p>
            <h2 className="font-serif text-xl md:text-3xl text-accent/90">
              {t('title')}
            </h2>
          </div>

          {/* Event type legend */}
          <div className="hidden md:flex items-center gap-4">
            {Object.entries(EVENT_COLORS).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <span className="text-foreground/50 text-[9px] tracking-wider uppercase">
                  {t(`type.${type}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30">
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-red-700 via-yellow-500 to-emerald-500 origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Horizontal scroll track */}
      <div
        ref={trackRef}
        className="flex items-center gap-0 pt-28 pb-12 min-h-screen"
        style={{ width: `${events.length * 420 + 200}px` }}
      >
        {/* Initial spacer */}
        <div className="w-[100px] shrink-0" />

        {events.map((event, i) => {
          const title = localizedWithFallback(locale, event.title_ja, event.title_en);
          const description = event.description_ja
            ? localizedWithFallback(locale, event.description_ja, event.description_en)
            : null;
          const impact = event.impact_ja
            ? localizedWithFallback(locale, event.impact_ja, event.impact_en)
            : null;
          const colors = EVENT_COLORS[event.event_type] ?? EVENT_COLORS.recovery;
          const sourceHref = sanitizeExternalUrl(event.source_url);

          return (
            <div
              key={event.id}
              data-timeline-card
              className="w-[380px] shrink-0 mx-5"
            >
              <div className={`relative p-6 md:p-8 border border-border/30 ${colors.bg} backdrop-blur-sm`}>
                {/* Time indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${colors.dot} shadow-lg shadow-current/20`} />
                  <div>
                    <span className="text-foreground/50 text-xs font-mono tracking-wide">
                      {event.event_date}
                      {event.event_time && (
                        <span className="text-foreground/50 ml-2">
                          {event.event_time.slice(0, 5)}
                        </span>
                      )}
                    </span>
                  </div>
                  <span className={`text-[9px] tracking-[0.15em] uppercase ml-auto ${colors.text}`}>
                    {t(`type.${event.event_type}`)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-foreground/90 text-lg md:text-xl leading-snug mb-3">
                  {title}
                </h3>

                {/* Description */}
                {description && (
                  <p className="text-foreground/60 text-sm leading-relaxed mb-4">
                    {description}
                  </p>
                )}

                {/* Image */}
                {event.image_url && (
                  <div className="mb-4 -mx-2 overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={title}
                      className="w-full max-h-40 object-cover opacity-70 hover:opacity-90 transition-opacity duration-500"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Impact */}
                {impact && (
                  <p className="text-accent/70 text-xs font-mono tracking-wide mb-3 border-l-2 border-accent/30 pl-3">
                    {impact}
                  </p>
                )}

                {/* Source */}
                {event.source && (
                  <p className="text-foreground/40 text-[10px]">
                    {sourceHref ? (
                      <a href={sourceHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground/60 transition-colors">
                        {event.source}
                      </a>
                    ) : event.source}
                  </p>
                )}

                {/* Card number */}
                <div className="absolute top-4 right-4 text-foreground/8 text-[10px] font-mono">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            </div>
          );
        })}

        {/* End spacer */}
        <div className="w-[200px] shrink-0" />
      </div>
    </section>
  );
}
