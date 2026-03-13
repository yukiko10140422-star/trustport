'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Testimony } from '@/types/database';

type Props = {
  readonly testimony: Testimony;
  readonly locale: string;
};

export function TestimonyCard({ testimony, locale }: Props) {
  const t = useTranslations('testimony');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const content = locale === 'en' && testimony.content_en
    ? testimony.content_en
    : testimony.content_ja;

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      className="bg-surface border border-border p-6 md:p-8 max-w-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
    >
      {/* Quote mark */}
      <div className="text-accent/50 font-display text-4xl leading-none mb-4">&ldquo;</div>

      {/* Content */}
      <p className="font-serif text-foreground/80 text-sm md:text-base leading-relaxed mb-6">
        {content}
      </p>

      {/* Speaker info */}
      <div className="flex items-center justify-between">
        <div>
          {testimony.speaker_name && (
            <p className="text-foreground/60 text-sm">{testimony.speaker_name}</p>
          )}
          {testimony.speaker_role && (
            <p className="text-foreground/50 text-xs mt-0.5">{testimony.speaker_role}</p>
          )}
        </div>

        {/* Audio button */}
        {testimony.audio_url && (
          <button
            onClick={toggleAudio}
            className="flex items-center gap-2 text-accent text-xs tracking-wider hover:text-accent-dim transition-colors"
            aria-label={t('listen')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-current">
              {isPlaying ? (
                <rect x="4" y="3" width="3" height="10" rx="0.5" fill="currentColor" />
              ) : (
                <path d="M4 3L13 8L4 13V3Z" fill="currentColor" />
              )}
              {isPlaying && (
                <rect x="9" y="3" width="3" height="10" rx="0.5" fill="currentColor" />
              )}
            </svg>
            {t('listen')}
          </button>
        )}
      </div>

      {/* Source */}
      {testimony.source && (
        <p className="text-foreground/45 text-[10px] mt-4">
          {testimony.source_url ? (
            <a href={testimony.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              {testimony.source}
            </a>
          ) : (
            testimony.source
          )}
        </p>
      )}

      {testimony.audio_url && (
        <audio
          ref={audioRef}
          src={testimony.audio_url}
          onEnded={() => setIsPlaying(false)}
          preload="none"
        />
      )}
    </motion.div>
  );
}
