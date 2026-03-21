# 開発部 - 部署概要

## 概要
Claude Codeのナレッジベース・設計書・デバッグログを管理する部署。
everything-claude-codeリポジトリのコンテンツを社内リソースとして統合。

## コンテンツ構成

| フォルダ | 内容 |
|---------|------|
| `agents/` | 特化型サブエージェント（planner, code-reviewer, tdd-guide等） |
| `skills/` | ワークフロー定義・ドメイン知識 |
| `commands/` | スラッシュコマンド（/tdd, /plan, /e2e等） |
| `hooks/` | トリガーベース自動化 |
| `rules/` | セキュリティ・コーディングスタイル・テストガイドライン |
| `mcp-configs/` | MCPサーバー設定 |
| `scripts/` | クロスプラットフォームユーティリティ |
| `debug-log/` | デバッグ・バグ調査ログ（社内用） |

## ソース
- リポジトリ: https://github.com/affaan-m/everything-claude-code
- 取得日: 2026-03-13
- 方式: `--depth 1` クローン → `.git` 除去 → 不要ファイル削除後に配置
