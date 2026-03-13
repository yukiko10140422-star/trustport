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
  /** Use procedural ocean wave synthesis when no ambientUrl is provided */
  readonly useProceduralOcean?: boolean;
  readonly children: ReactNode;
};

/**
 * Creates a procedural ocean wave sound using Web Audio API.
 * Uses filtered noise with LFO modulation to simulate gentle waves.
 * No external files needed — fully synthesized in real-time.
 */
function createOceanSynth(ctx: AudioContext, masterGain: GainNode) {
  // White noise source via AudioWorklet fallback: ScriptProcessor
  const bufferSize = 4096;
  const noiseNode = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 10, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseNode.buffer = noiseBuffer;
  noiseNode.loop = true;

  // Bandpass filter to shape noise into "wave" character
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 400;
  bandpass.Q.value = 0.5;

  // Lowpass for warmth
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 800;
  lowpass.Q.value = 0.7;

  // LFO for wave rhythm (slow volume oscillation)
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08; // ~one wave every 12 seconds
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.15;

  // Secondary LFO for variation
  const lfo2 = ctx.createOscillator();
  lfo2.type = 'sine';
  lfo2.frequency.value = 0.13;
  const lfo2Gain = ctx.createGain();
  lfo2Gain.gain.value = 0.08;

  // Output gain
  const outputGain = ctx.createGain();
  outputGain.gain.value = 0;

  // Connect: noise → bandpass → lowpass → outputGain → masterGain
  noiseNode.connect(bandpass);
  bandpass.connect(lowpass);
  lowpass.connect(outputGain);
  outputGain.connect(masterGain);

  // Connect LFOs to modulate output volume
  lfo.connect(lfoGain);
  lfoGain.connect(outputGain.gain);
  lfo2.connect(lfo2Gain);
  lfo2Gain.connect(outputGain.gain);

  // Fade in
  outputGain.gain.setValueAtTime(0, ctx.currentTime);
  outputGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3);

  noiseNode.start();
  lfo.start();
  lfo2.start();

  return {
    stop: () => {
      outputGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
      setTimeout(() => {
        try { noiseNode.stop(); } catch { /* ok */ }
        try { lfo.stop(); } catch { /* ok */ }
        try { lfo2.stop(); } catch { /* ok */ }
      }, 2500);
    },
  };
}

export function AudioProvider({ ambientUrl, useProceduralOcean = true, children }: Props) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const ambientRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientBufferRef = useRef<AudioBuffer | null>(null);
  const oceanSynthRef = useRef<{ stop: () => void } | null>(null);

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

    if (buffer) {
      // File-based ambient: stop existing
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
    } else if (useProceduralOcean) {
      // Procedural ocean wave synthesis
      if (oceanSynthRef.current) {
        oceanSynthRef.current.stop();
      }
      oceanSynthRef.current = createOceanSynth(ctx, gain);
    }

    setIsAmbientPlaying(true);
  }, [useProceduralOcean]);

  const stopAmbient = useCallback(() => {
    // Stop file-based ambient
    if (ambientRef.current) {
      const ctx = audioCtxRef.current;
      try {
        ambientRef.current.stop(ctx ? ctx.currentTime + 1 : 0);
      } catch { /* already stopped */ }
      ambientRef.current = null;
    }

    // Stop procedural ocean
    if (oceanSynthRef.current) {
      oceanSynthRef.current.stop();
      oceanSynthRef.current = null;
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
      if (oceanSynthRef.current) {
        try { oceanSynthRef.current.stop(); } catch { /* ok */ }
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
