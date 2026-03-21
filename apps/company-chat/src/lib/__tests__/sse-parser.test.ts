import { describe, it, expect, vi } from 'vitest';
import { createSSEParser } from '../sse-parser';

describe('createSSEParser', () => {
  it('完全なSSEイベントをパースする', () => {
    const handler = vi.fn();
    const parser = createSSEParser(handler);

    parser.feed('event: meta\ndata: {"id":1}\n\n');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('meta', { id: 1 });
  });

  it('複数イベントを一度にパースする', () => {
    const handler = vi.fn();
    const parser = createSSEParser(handler);

    parser.feed('event: text\ndata: {"text":"hello"}\n\nevent: text\ndata: {"text":" world"}\n\n');

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, 'text', { text: 'hello' });
    expect(handler).toHaveBeenNthCalledWith(2, 'text', { text: ' world' });
  });

  it('不完全なチャンクをバッファリングする', () => {
    const handler = vi.fn();
    const parser = createSSEParser(handler);

    // 途中で切れたチャンク
    parser.feed('event: meta\ndata: {"i');
    expect(handler).not.toHaveBeenCalled();

    // 残りが来る
    parser.feed('d":1}\n\n');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('meta', { id: 1 });
  });

  it('不正なJSONでクラッシュしない', () => {
    const handler = vi.fn();
    const parser = createSSEParser(handler);

    parser.feed('event: bad\ndata: {invalid json}\n\n');

    expect(handler).not.toHaveBeenCalled(); // パースエラーで呼ばれない
  });

  it('eventなしのデータ行は無視する', () => {
    const handler = vi.fn();
    const parser = createSSEParser(handler);

    parser.feed('data: {"orphan":true}\n\n');

    expect(handler).not.toHaveBeenCalled();
  });

  it('dataなしのイベント行は無視する', () => {
    const handler = vi.fn();
    const parser = createSSEParser(handler);

    parser.feed('event: lonely\n\n');

    expect(handler).not.toHaveBeenCalled();
  });

  it('連続呼び出しで状態が正しく維持される', () => {
    const handler = vi.fn();
    const parser = createSSEParser(handler);

    parser.feed('event: a\ndata: {"v":1}\n\n');
    parser.feed('event: b\ndata: {"v":2}\n\n');

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, 'a', { v: 1 });
    expect(handler).toHaveBeenNthCalledWith(2, 'b', { v: 2 });
  });
});
