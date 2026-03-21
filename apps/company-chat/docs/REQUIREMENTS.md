# Company 秘書アプリ — 要件定義 v1.0

- **作成日**: 2026-03-20
- **種別**: 個人補助ツール（スマホメイン）

## コンセプト

スマホから仮想会社の秘書「藤崎 ひなた」にチャットで話しかけ、
カレンダー・TODO・資料検索・eBay確認など日常業務を一元管理する個人アプリ。

## ユーザー

- オーナー1名のみ（個人利用）
- 認証: Google ログイン

## 機能一覧

### MVP（Phase 1-2）

| # | 機能 | 説明 | データソース |
|---|------|------|-------------|
| 1 | **チャット** | ひなたに自然言語で依頼・質問 | Claude API |
| 2 | **Google Calendar** | 空き確認「この日空いてる？」/ 予定追加「来週火曜に会議入れて」 | Google Calendar API |
| 3 | **TODO管理** | タスク一覧・追加・完了をスマホで管理 | Google Tasks API |
| 4 | **モデル切替** | Haiku（デフォルト）/ Sonnet / Opus をタスクに応じて自動or手動切替 | Claude API |
| 5 | **認証** | Google ログイン（OAuth 2.0） | Google OAuth |

### Phase 3

| # | 機能 | 説明 | データソース |
|---|------|------|-------------|
| 6 | **資料検索** | 決定事項・調査結果・提案書を検索・閲覧 | .company/ 配下のMDファイル |
| 7 | **進捗確認** | プロジェクト状況を聞ける | .company/pm/projects/ 等 |
| 8 | **部署直接指定** | 「開発に聞きたい」で部署を手動選択 | orchestrator ルーティング |

### Phase 4

| # | 機能 | 説明 | データソース |
|---|------|------|-------------|
| 9 | **eBay確認** | 売上・リスティング・注文状況 | eBay API |
| 10 | **組織図** | 部署一覧・依存関係の可視化 | department-registry |
| 11 | **PWA** | ホーム画面追加・オフライン対応 | — |

## 画面構成

### 1. ログイン画面
- Google ログインボタン1つ
- ログイン後はチャット画面に遷移

### 2. チャット画面（メイン）
- LINE風のバブルUI
- ひなたが常駐窓口
- キーワードに応じて各部署キャラが応答
- 画面下部に入力欄（固定）
- ヘッダーにモデル切替セレクタ

### 3. カレンダー画面
- チャットから「カレンダー見せて」で遷移、または下部タブ
- 月表示 / 週表示
- 予定の追加・確認

### 4. TODO画面
- チャットから「TODO見せて」で遷移、または下部タブ
- Google Tasks と同期
- リスト表示（チェックボックス）
- 追加・完了・削除

### ナビゲーション（下部タブ）
```
[チャット] [カレンダー] [TODO] [設定]
```

## 技術スタック

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フレームワーク | Next.js 15 (App Router) | Vercel デプロイ最適 |
| UI | React 19 + Tailwind CSS | モバイルファーストが容易 |
| AI | @anthropic-ai/sdk | Claude API 公式SDK |
| 認証 | NextAuth.js + Google Provider | Google OAuth を簡単に実装 |
| カレンダー | Google Calendar API v3 | 予定の読み書き |
| TODO | Google Tasks API v1 | タスクの CRUD + 同期 |
| eBay (Phase 4) | eBay REST API | 売上・注文データ |
| デプロイ | Vercel | 指定 |

## Google OAuth スコープ

```
openid
email
profile
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/tasks
```

## モデル自動切替ルール

| タスク種別 | モデル | 例 |
|-----------|--------|-----|
| 雑談・TODO・メモ・カレンダー | **Haiku** | 「今日の予定は？」「牛乳買う追加して」 |
| 開発・リサーチ・法務・資料検索 | **Sonnet** | 「設計方針を相談したい」「市場調査して」 |
| CEO意思決定・複雑分析 | **Opus** | ユーザーが手動選択時のみ |

## 環境変数

| 変数名 | 用途 |
|--------|------|
| `ANTHROPIC_API_KEY` | Claude API キー |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth クライアントシークレット |
| `NEXTAUTH_SECRET` | NextAuth セッション暗号化キー |
| `NEXTAUTH_URL` | アプリのURL（デプロイ後に設定） |

## 非機能要件

- **レスポンス**: チャット応答はストリーミング表示（待ち時間を感じさせない）
- **モバイル最適化**: タップ操作、スクロール、キーボード表示時のレイアウト
- **セキュリティ**: API キーはサーバーサイドのみ、Google トークンは暗号化保存
- **コスト**: Haiku ベースで月額 ¥100〜300 目標

## 関連プロジェクト

| プロジェクト | パス | 関係 |
|-------------|------|------|
| Company 仮想組織 | `C:\dev\OTHRE SERVICE\COMPANY` | 部署データ・オーケストレーション基盤 |
| Nexsus | `C:\dev\software\Nexsus` | eBay管理ツール（別アプリ、Phase 4で連携） |
| NexsusWeb | `C:\dev\web\NexsusWeb` | Nexsus LP（別アプリ） |
