import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RichContent from '../RichContent';

describe('RichContent', () => {
  it('プレーンテキストをそのまま描画する', () => {
    render(<RichContent content="こんにちは" />);
    expect(screen.getByText('こんにちは')).toBeDefined();
  });

  it('空文字列でクラッシュしない', () => {
    const { container } = render(<RichContent content="" />);
    expect(container).toBeDefined();
  });

  it('Markdownの見出しを描画する', () => {
    render(<RichContent content="## テスト見出し" />);
    const heading = screen.getByText('テスト見出し');
    expect(heading.tagName).toBe('H2');
  });

  it('Markdownのリストを描画する', () => {
    const md = "- アイテム1\n- アイテム2";
    const { container } = render(<RichContent content={md} />);
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBeGreaterThanOrEqual(1);
    // テキストがDOM内に存在することを確認
    expect(container.textContent).toContain('アイテム1');
    expect(container.textContent).toContain('アイテム2');
  });

  it('Markdownのテーブルを描画する', () => {
    const md = `| 名前 | 値 |
| --- | --- |
| A | 1 |`;
    render(<RichContent content={md} />);
    expect(screen.getByText('名前')).toBeDefined();
    expect(screen.getByText('A')).toBeDefined();
  });

  it('コードブロックを描画する', () => {
    const md = '```javascript\nconst x = 1;\n```';
    const { container } = render(<RichContent content={md} />);
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toContain('const x = 1;');
  });

  it('インラインコードを描画する', () => {
    render(<RichContent content="これは `code` です" />);
    const code = screen.getByText('code');
    expect(code.tagName).toBe('CODE');
  });

  it('artifact ブロックがあるとiframeを描画する', () => {
    const content = `テキスト\n\n~~~artifact:html title="テスト"\n<div>Hello</div>\n~~~\n\n続きのテキスト`;
    const { container } = render(<RichContent content={content} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('title')).toBe('テスト');
  });

  it('artifact が無いテキストではiframeが生成されない', () => {
    const { container } = render(<RichContent content="普通のテキスト" />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeNull();
  });

  it('複数のartifactブロックを描画する', () => {
    const content = `~~~artifact:html title="A"\n<div>A</div>\n~~~\n\n~~~artifact:html title="B"\n<div>B</div>\n~~~`;
    const { container } = render(<RichContent content={content} />);
    const iframes = container.querySelectorAll('iframe');
    expect(iframes.length).toBe(2);
  });

  it('太字を描画する', () => {
    render(<RichContent content="**太字テスト**" />);
    const strong = screen.getByText('太字テスト');
    expect(strong.tagName).toBe('STRONG');
  });

  it('リンクをtarget=_blankで描画する', () => {
    render(<RichContent content="[リンク](https://example.com)" />);
    const link = screen.getByText('リンク');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});
