'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type AudioContextState = {
  /** Whether user has unlocked audio via gesture */
  readonly isUnlocked: boolean;
  /** Whether ambient sound is currently playing */
  readonly isAmbientPlaying: boolean;
  /** Master volume 0-1 */
  readonly volume: number;
  /** Unlock audio context (must be called from user gesture) */
  readonly unlock: () => void;
  /** Toggle ambient sound on/off */
  readonly toggleAmbient: () => void;
  /** Set master volume */
  readonly setVolume: (v: number) => void;
  /** Get the raw AudioContext for visualizers etc. */
  readonly getAudioContext: () => AudioContext | null;
  /** Play a one-shot sound effect */
  readonly playSfx: (url: string, vol?: number) => void;
};

const Ctx = createContext<AudioContextState | null>(null);

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}

type Props = {
  /** URL to the ambient loop audio file */
  readonly ambientUrl?: string;
  readonly children: ReactNode;
};

export function AudioProvider({ ambientUrl, children }: Props) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const ambientRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientBufferRef = useRef<AudioBuffer | null>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3);

  // Initialize AudioContext lazily
  const getOrCreateCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      gainRef.current = audioCtxRef.current.createGain();
      gainRef.current.gain.value = volume;
      gainRef.current.connect(audioCtxRef.current.destination);
    }
    return audioCtxRef.current;
  }, [volume]);

  // Load ambient audio buffer
  useEffect(() => {
    if (!ambientUrl || !isUnlocked) return;
    const ctx = getOrCreateCtx();

    fetch(ambientUrl)
      .then((res) => res.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        ambientBufferRef.current = decoded;
      })
      .catch(() => {
        // Failed to load ambient audio — degrade gracefully
      });
  }, [ambientUrl, isUnlocked, getOrCreateCtx]);

  const unlock = useCallback(() => {
    const ctx = getOrCreateCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => setIsUnlocked(true));
    } else {
      setIsUnlocked(true);
    }
  }, [getOrCreateCtx]);

  const startAmbient = useCallback(() => {
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;

    const buffer = ambientBufferRef.current;
    if (!buffer) return;

    // Stop existing source
    if (ambientRef.current) {
      try { ambientRef.current.stop(); } catch { /* already stopped */ }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Fade in
    const fadeGain = ctx.createGain();
    fadeGain.gain.setValueAtTime(0, ctx.currentTime);
    fadeGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);

    source.connect(fadeGain);
    fadeGain.connect(gain);
    source.start();
    ambientRef.current = source;

    setIsAmbientPlaying(true);
  }, []);

  const stopAmbient = useCallback(() => {
    if (ambientRef.current) {
      const ctx = audioCtxRef.current;
      try {
        ambientRef.current.stop(ctx ? ctx.currentTime + 1 : 0);
      } catch { /* already stopped */ }
      ambientRef.current = null;
    }

    setIsAmbientPlaying(false);
  }, []);

  const toggleAmbient = useCallback(() => {
    if (isAmbientPlaying) {
      stopAmbient();
    } else {
      startAmbient();
    }
  }, [isAmbientPlaying, startAmbient, stopAmbient]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (gainRef.current) {
      gainRef.current.gain.value = v;
    }
  }, []);

  const getAudioContext = useCallback(() => audioCtxRef.current, []);

  const playSfx = useCallback((url: string, vol = 0.5) => {
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) return;

    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        const sfxGain = ctx.createGain();
        sfxGain.gain.value = vol;
        source.connect(sfxGain);
        sfxGain.connect(gain);
        source.start();
      })
      .catch(() => { /* sfx load failed */ });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ambientRef.current) {
        try { ambientRef.current.stop(); } catch { /* ok */ }
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => { /* ok */ });
      }
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        isUnlocked,
        isAmbientPlaying,
        volume,
        unlock,
        toggleAmbient,
        setVolume,
        getAudioContext,
        playSfx,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
