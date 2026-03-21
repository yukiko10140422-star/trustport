# エージェントチーム プロトコル

## 概要

ユーザーの入力を分析し、適切な部署にルーティングし、並列チームを編成して実行するプロトコル。

## ルーティングフロー

```
1. ユーザー入力を受信
2. キーワードマッチング (routeRequest)
   - 各部署に定義されたキーワードと照合
   - マッチしない場合は秘書室にフォールバック
3. 並列計画生成 (planParallel)
   - 複数部署 → parallel: true
   - 単独部署 → parallel: false
4. プロンプト生成 (generatePrompt)
   - 部署メタ情報 + ユーザー依頼 → エージェントプロンプト
5. チーム編成 (composeTeam)
   - メンバーリスト + サマリー生成
```

## キーワード → 部署マッピング

| 部署 | キーワード |
|------|-----------|
| 秘書室 | TODO, メモ, 壁打ち, 雑談, 相談 |
| CEO | 判断, 決定, 方針, 振り分け, 承認 |
| PM | プロジェクト, マイルストーン, 進捗, スケジュール |
| リサーチ | 調査, 調べ, 競合, 市場, トレンド |
| マーケティング | コンテンツ, SNS, 集客, 広告, LP |
| 開発 | 実装, 設計, アーキテクチャ, バグ, コード |
| 経理 | 請求, 経費, 売上, 確定申告 |
| 営業 | クライアント, 提案, 見積, 案件 |
| クリエイティブ | デザイン, ロゴ, バナー, ブランド |
| 人事 | 採用, チーム, メンバー |
| 法務 | 契約, 規約, コンプライアンス |
| 物流 | 在庫, 配送, 仕入れ, 倉庫 |
| eBay | eBay, リスティング, 出品 |
| アパレル | アパレル, コレクション, 被災地 |
| DX | DXソフト, プロダクト, SaaS |

## 並列実行パターン

```
# 独立タスク → 並列
  ┌→ リサーチ: 市場調査
  ├→ 開発: アーキテクチャ設計
  └→ マーケ: 戦略策定

# 依存タスク → Pipeline Engine を使用
  リサーチ → CEO決定 → [PM, 開発, マーケ] → キックオフ
```

## CLI

```bash
# ルーティング確認
node scripts/orchestrate.js route "市場調査をお願い"

# フルオーケストレーション
node scripts/orchestrate.js run "設計してコード書いて"

# チーム手動編成
node scripts/orchestrate.js team "ceo,pm,engineering"
```

## API リファレンス

```
scripts/lib/orchestrator.js

routeRequest(registry, input)           → DepartmentMeta[]
planParallel(registry, deptIds)         → { departments, parallel }
generatePrompt(registry, deptId, input) → string
composeTeam(registry, deptIds)          → { members, summary }
orchestrate(registry, input)            → { routed, plan, prompts, team }
```
