import { useState, useRef, useCallback, useEffect } from 'react';

export type SpeechStatus = 'idle' | 'listening' | 'error';

interface SpeechResult {
  supported: boolean;
  status: SpeechStatus;
  transcript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

function getSpeechRecognitionClass(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    (new () => SpeechRecognitionInstance) | null;
}

export function useSpeechRecognition(): SpeechResult {
  // SSR時はfalse、クライアント側でuseEffectで再判定
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const srClassRef = useRef<(new () => SpeechRecognitionInstance) | null>(null);

  // クライアント側でのみSpeechRecognition対応を判定
  useEffect(() => {
    const SRClass = getSpeechRecognitionClass();
    srClassRef.current = SRClass;
    setSupported(SRClass !== null);
  }, []);

  const start = useCallback(() => {
    const SRClass = srClassRef.current;
    if (!SRClass) return;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SRClass();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: { results: { length: number; [i: number]: { [j: number]: { transcript: string } } } }) => {
      const results = event.results;
      let finalText = '';
      for (let i = 0; i < results.length; i++) {
        finalText += results[i][0].transcript;
      }
      setTranscript(finalText);
    };

    recognition.onerror = () => {
      setStatus('error');
    };

    recognition.onend = () => {
      setStatus('idle');
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setStatus('listening');
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setStatus('idle');
  }, []);

  return { supported, status, transcript, start, stop, reset };
}
