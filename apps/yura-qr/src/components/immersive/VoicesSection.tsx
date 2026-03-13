'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { localizedWithFallback, type Locale } from '@/lib/i18n';
import type { Testimony } from '@/types/database';

type Props = {
  readonly testimonies: readonly Testimony[];
  readonly locale: Locale;
};

function AudioWaveform({
  audioUrl,
  isPlaying,
  onToggle,
}: {
  audioUrl: string;
  isPlaying: boolean;
  onToggle: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
      audioRef.current?.pause();
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const initAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyserRef.current = analyser;

    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    return audio;
  }, [audioUrl]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser || !isPlaying) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / bufferLength;
      const centerY = height / 2;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * centerY * 0.8;
        const x = i * barWidth;

        // Gold gradient
        const alpha = 0.3 + (dataArray[i] / 255) * 0.5;
        ctx.fillStyle = `rgba(196, 168, 130, ${alpha})`;

        // Mirror bars from center
        ctx.fillRect(x, centerY - barHeight, barWidth - 1, barHeight);
        ctx.fillRect(x, centerY, barWidth - 1, barHeight * 0.6);
      }
    };

    draw();

    return () => cancelAnimationFrame(frameRef.current);
  }, [isPlaying]);

  // Idle waveform (gentle pulse)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isPlaying) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    let time = 0;

    const drawIdle = () => {
      frameRef.current = requestAnimationFrame(drawIdle);
      time += 0.02;

      ctx.clearRect(0, 0, width, height);
      const centerY = height / 2;
      const bars = 40;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        const wave = Math.sin(time + i * 0.3) * 0.3 + 0.4;
        const barHeight = wave * centerY * 0.2;

        ctx.fillStyle = 'rgba(196, 168, 130, 0.15)';
        ctx.fillRect(i * barWidth, centerY - barHeight, barWidth - 1, barHeight * 2);
      }
    };

    drawIdle();
    return () => cancelAnimationFrame(frameRef.current);
  }, [isPlaying]);

  const handleToggle = () => {
    const audio = initAudio();

    if (isPlaying) {
      audio.pause();
    } else {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audio.play().catch(() => {});
    }
    onToggle();
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full h-16 md:h-20"
      />
      <button
        onClick={handleToggle}
        className="absolute inset-0 flex items-center justify-center group cursor-pointer"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        <div className="w-12 h-12 rounded-full border border-accent/30 flex items-center justify-center bg-background/50 backdrop-blur-sm group-hover:border-accent/60 transition-colors">
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-accent">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-accent ml-0.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </div>
      </button>
    </div>
  );
}

export function VoicesSection({ testimonies, locale }: Props) {
  const t = useTranslations('testimony');
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (testimonies.length === 0) return null;

  return (
    <section id="voices" className="py-24 md:py-36 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-foreground/15 text-[10px] tracking-[0.4em] uppercase mb-4">
            Testimony
          </p>
          <h2 className="font-serif text-2xl md:text-4xl text-accent/90">
            {t('title')}
          </h2>
        </motion.div>

        <div className="space-y-16 md:space-y-24">
          {testimonies.map((testimony, i) => {
            const content = localizedWithFallback(
              locale,
              testimony.content_ja,
              testimony.content_en,
            );
            const isPlaying = playingId === testimony.id;

            return (
              <motion.div
                key={testimony.id}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                {/* Quote mark */}
                <div className="text-accent/10 text-[80px] md:text-[120px] font-serif leading-none absolute -top-8 -left-2 md:-left-6 select-none pointer-events-none">
                  &ldquo;
                </div>

                {/* Content */}
                <blockquote className="relative z-10">
                  <p className="font-serif text-foreground/75 text-lg md:text-xl lg:text-2xl leading-[1.8] md:leading-[2] mb-6">
                    {content}
                  </p>

                  {/* Audio waveform */}
                  {testimony.audio_url && (
                    <div className="mb-6">
                      <AudioWaveform
                        audioUrl={testimony.audio_url}
                        isPlaying={isPlaying}
                        onToggle={() => setPlayingId(isPlaying ? null : testimony.id)}
                      />
                    </div>
                  )}

                  {/* Attribution */}
                  <footer className="flex items-baseline gap-3">
                    <div className="w-8 h-[1px] bg-accent/30" />
                    <div>
                      <cite className="text-foreground/50 text-sm not-italic font-serif">
                        {testimony.speaker_name}
                        {testimony.speaker_age_at_time && (
                          <span className="text-foreground/25 ml-1">
                            ({testimony.speaker_age_at_time})
                          </span>
                        )}
                      </cite>
                      {testimony.speaker_role && (
                        <p className="text-foreground/20 text-[10px] tracking-wider mt-0.5">
                          {testimony.speaker_role}
                        </p>
                      )}
                    </div>
                  </footer>
                </blockquote>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
