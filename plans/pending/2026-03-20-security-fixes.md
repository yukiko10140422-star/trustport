# セキュリティ修正

- 作成日: 2026-03-20
- 完了日:
- 優先度: HIGH
- 関連: セキュリティレビュー結果（2026-03-20実施）

## 背景

3エージェント並列スキャンによるセキュリティレビューで、HIGH 5件・MEDIUM 8件・LOW 5件の指摘が検出された。

## 実施内容

### 最優先（HIGH）
- [ ] `next` を 16.2.0 以上にアップグレード（yura-qr, vkei-ec 共通）
  - HTTP リクエストスマグリング、CSRF バイパス等 5件の CVE
- [ ] `npm audit fix` で `flatted` プロトタイプ汚染を修正（両アプリ）
- [ ] CSP から `unsafe-inline` + `unsafe-eval` を除去し nonce ベースに移行（yura-qr）

### 短期（MEDIUM）
- [ ] `/api/scan` にレート制限を実装（yura-qr）
  - Vercel Firewall または upstash/ratelimit
- [ ] `dangerouslyAllowSVG: true` に `contentDispositionType: 'attachment'` 追加（両アプリ）
- [ ] vkei-ec にセキュリティヘッダー追加（CSP, X-Frame-Options, HSTS, Referrer-Policy）
- [ ] `.gitignore` に `.env.production`, `.env.staging` 追加
- [ ] JSON-LD の `dangerouslySetInnerHTML` に `</script>` エスケープ追加（yura-qr）
- [ ] Supabase プロジェクト ID のハードコードを環境変数化（yura-qr）
- [ ] HSTS ヘッダー追加（yura-qr）

### 低優先（LOW）
- [ ] `console.error` のエラーオブジェクト出力を最小化（yura-qr）
- [ ] scan イベント送信の重複除去（yura-qr）
- [ ] `localStorage` カートデータに Zod スキーマ検証追加（vkei-ec）
- [ ] Google Fonts を `next/font/google` に移行（vkei-ec）
- [ ] `.claude/` を `.gitignore` に明示追加

## リスクと対策

| リスク | 深刻度 | 対策 |
|--------|--------|------|
| Next.js アップグレードで破壊的変更 | 中 | アップグレード後にビルド + 全テスト実行で確認 |
| CSP nonce 移行で既存機能が壊れる | 中 | 段階的に移行（まず unsafe-eval 除去 → unsafe-inline 除去） |
| レート制限が正規ユーザーに影響 | 低 | 十分な閾値設定（例: 60req/min） |

## 完了基準

- [ ] `npm audit` で HIGH/CRITICAL が 0 件
- [ ] CSP に `unsafe-eval` が含まれない
- [ ] `/api/scan` にレート制限が動作している
- [ ] 全テストパス + ビルド成功
