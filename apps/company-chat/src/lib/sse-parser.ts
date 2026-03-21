/**
 * SSE (Server-Sent Events) パーサー
 * ストリーミングAPIからのチャンク文字列をパースし、イベントごとにコールバックを呼ぶ。
 */
export function createSSEParser(
  onEvent: (event: string, data: unknown) => void,
) {
  let buffer = '';
  let currentEvent = '';
  let currentData = '';

  return {
    feed(chunk: string) {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 最後の不完全行を保持

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          currentData = line.slice(6);
        } else if (line === '') {
          if (currentEvent && currentData) {
            try {
              onEvent(currentEvent, JSON.parse(currentData));
            } catch {
              // JSON parse失敗は無視
            }
          }
          currentEvent = '';
          currentData = '';
        }
      }
    },
  };
}
