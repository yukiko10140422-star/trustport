import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// SpeechRecognition のモック
class MockSpeechRecognition {
  lang = '';
  interimResults = false;
  continuous = false;
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn(() => {
    // stop後にonendが呼ばれる
    setTimeout(() => this.onend?.(), 0);
  });
  abort = vi.fn();
}

describe('useSpeechRecognition', () => {
  let mockInstance: MockSpeechRecognition;

  beforeEach(async () => {
    vi.resetModules();
    mockInstance = new MockSpeechRecognition();
    // new で呼べるコンストラクタモック
    const MockConstructor = function(this: MockSpeechRecognition) {
      Object.assign(this, mockInstance);
      // メソッドは同じインスタンスを参照するため再代入
      this.start = mockInstance.start;
      this.stop = mockInstance.stop;
      this.abort = mockInstance.abort;
      // onresult等のコールバック設定をmockInstanceに転送
      const self = this;
      Object.defineProperty(mockInstance, 'onresult', {
        get() { return self.onresult; },
        set(v) { self.onresult = v; },
        configurable: true,
      });
      Object.defineProperty(mockInstance, 'onend', {
        get() { return self.onend; },
        set(v) { self.onend = v; },
        configurable: true,
      });
    } as unknown as new () => SpeechRecognition;
    (globalThis as Record<string, unknown>).webkitSpeechRecognition = MockConstructor;
  });

  it('ブラウザ対応時は supported: true を返す', async () => {
    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const { result } = renderHook(() => useSpeechRecognition());
    // useEffect後にsupportedが更新される
    await act(async () => {});
    expect(result.current.supported).toBe(true);
  });

  it('ブラウザ非対応時は supported: false を返す', async () => {
    delete (globalThis as Record<string, unknown>).webkitSpeechRecognition;
    delete (globalThis as Record<string, unknown>).SpeechRecognition;
    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => {});
    expect(result.current.supported).toBe(false);
  });

  it('初期状態は idle', async () => {
    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => {});
    expect(result.current.status).toBe('idle');
    expect(result.current.transcript).toBe('');
  });

  it('start() で listening に遷移する', async () => {
    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => {}); // useEffect完了待ち

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe('listening');
    expect(mockInstance.start).toHaveBeenCalled();
  });

  it('stop() で idle に戻る', async () => {
    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => {});

    act(() => {
      result.current.start();
    });

    await act(async () => {
      result.current.stop();
      // onendコールバックの実行を待つ
      await new Promise(r => setTimeout(r, 10));
    });

    expect(result.current.status).toBe('idle');
    expect(mockInstance.stop).toHaveBeenCalled();
  });

  it('音声結果が transcript に反映される', async () => {
    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => {});

    act(() => {
      result.current.start();
    });

    // 音声結果をシミュレート
    act(() => {
      mockInstance.onresult?.({
        resultIndex: 0,
        results: [
          [{ transcript: 'こんにちは', confidence: 0.9 }],
        ],
      });
    });

    expect(result.current.transcript).toBe('こんにちは');
  });

  it('非対応時は start() が何もしない', async () => {
    delete (globalThis as Record<string, unknown>).webkitSpeechRecognition;
    delete (globalThis as Record<string, unknown>).SpeechRecognition;
    const { useSpeechRecognition } = await import('../useSpeechRecognition');
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => {});

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe('idle');
  });
});
