import { useState, useRef, useCallback } from 'react';

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

// ブラウザ互換性
function getSpeechRecognitionClass(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    (new () => SpeechRecognitionInstance) | null;
}

export function useSpeechRecognition(): SpeechResult {
  const SRClass = getSpeechRecognitionClass();
  const supported = SRClass !== null;

  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const start = useCallback(() => {
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
  }, [SRClass]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setStatus('idle');
  }, []);

  return { supported, status, transcript, start, stop, reset };
}
