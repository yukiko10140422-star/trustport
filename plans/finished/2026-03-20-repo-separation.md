# リポジトリ分離（yura-qr / vkei-ec）

- 作成日: 2026-03-20
- 完了日: 2026-03-21
- 優先度: MEDIUM
- 関連: [2026-03-20-security-fixes.md](2026-03-20-security-fixes.md)

## 背景

COMPANYリポジトリ（trustport）に2つの独立したNext.jsアプリ（yura-qr, vkei-ec）が同居しており、依存関係の衝突・デプロイの複雑化・git履歴の汚染リスクがある。各アプリを独立リポジトリに分離し、COMPANYリポを「会社運営の司令塔 + 資料制作ツール」に整理する。

## 前提条件（オーナー回答が必要）

- [ ] yura-qr の新リポジトリ名を決定
- [ ] vkei-ec の新リポジトリ名を決定
- [ ] GitHub組織/ユーザーは `yukiko10140422-star` のまま？
- [ ] 未コミット変更の扱い（先にコミット / stash / そのまま）
- [ ] vkei-ec は今後も開発継続するか？（アーカイブ化の検討）
- [ ] remotion-video はCOMPANYに残すか、yura-qr側に移すか？

## 手法

`git subtree split` を採用（元リポジトリに一切変更を加えない安全な手法）

## 実施内容

### Phase 0: バックアップ（10分）
- [ ] リポジトリ全体のローカルコピー
- [ ] `.env.local` の退避
- [ ] gitリモートと同期確認

### Phase 1: yura-qr 分離（40分）
- [ ] GitHubに新リポジトリ作成
- [ ] `git subtree split --prefix=apps/yura-qr -b yura-qr-split`
- [ ] 新リポジトリにpush
- [ ] ビルド・テスト検証（69テスト全パス）
- [ ] `.gitignore`, `.env.local` 等の必要ファイル追加
- [ ] Vercelプロジェクト再接続（rootDirectory変更）

### Phase 2: vkei-ec 分離（15分）
- [ ] GitHubに新リポジトリ作成
- [ ] `git subtree split --prefix=apps/vkei-ec -b vkei-ec-split`
- [ ] 新リポジトリにpush + ビルド検証

### Phase 3: COMPANYリポ整理（25分）
- [ ] `git rm -r apps/`
- [ ] package.json の説明更新
- [ ] コミット・プッシュ

### Phase 4: 検証・クリーンアップ（30分）
- [ ] 全リポのビルド・テスト最終確認
- [ ] Vercel本番URL確認
- [ ] 一時ブランチ・ディレクトリ削除
- [ ] バックアップ保持（1-2週間後に削除）

## リスクと対策

| リスク | 深刻度 | 対策 |
|--------|--------|------|
| Vercel再接続時のダウンタイム | 高 | プレビューデプロイで事前確認、問題時は即元リポに戻す |
| `.env.local` 紛失 | 高 | Phase 0で明示バックアップ + Vercel環境変数から復元可能 |
| subtree splitでコミット欠落 | 中 | split後に `git log` でコミット数スポットチェック |

## ロールバック

- Phase 1-2: 元リポは不変。新リポを削除すればクリーン
- Phase 3: `git revert` またはバックアップから復元
- Vercel: ダッシュボードで元リポに即座に戻せる

## 完了基準

- [ ] yura-qr 新リポでビルド・全69テストパス
- [ ] yura-qr Vercelデプロイ正常動作
- [ ] vkei-ec 新リポでビルド成功
- [ ] COMPANYリポに apps/ が存在しない
- [ ] `.env.local` が一切gitにコミットされていない
