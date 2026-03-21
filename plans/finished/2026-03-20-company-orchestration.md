# Company 仮想組織オーケストレーション基盤

- **作成日**: 2026-03-20
- **完了日**: 2026-03-20
- **優先度**: HIGH
- **ステータス**: completed

## 概要

Company仮想組織（16部署）を、ドキュメント管理から**実行可能なマルチエージェントオーケストレーション基盤**に進化させる。

## フェーズ

### Phase 1: Department Registry（部署メタデータパーサー） ✅
- [x] テスト作成: `department-registry.test.js` (32テスト)
- [x] ライブラリ: `department-registry.js` — YAMLサブセットパーサー + レジストリ
- [x] 全15部署 CLAUDE.md に `<!-- META -->` ブロック追加（reviews/ は CLAUDE.md なし）

### Phase 2: Artifact System（アーティファクト伝播） ✅
- [x] テスト作成: `artifact.test.js` (31テスト)
- [x] ライブラリ: `artifact.js` — 成果物の生成・検証・伝播
- [x] プロトコル: `artifact-propagation.md`

### Phase 3: Pipeline Engine（パイプライン実行） ✅
- [x] テスト作成: `pipeline.test.js` (30テスト)
- [x] ライブラリ: `pipeline.js` — パイプライン定義・DAG検証・実行状態管理
- [x] CLI: `pipeline-runner.js`

### Phase 4: Agent Orchestrator（並列エージェント） ✅
- [x] テスト作成: `orchestrator.test.js` (18テスト)
- [x] ライブラリ: `orchestrator.js` — ルーティング・並列計画・プロンプト生成
- [x] CLI: `orchestrate.js` + プロトコル: `agent-teams.md`

### Phase 5: 統合 ✅
- [x] package.json 更新 (test / test:company スクリプト追加)
- [x] 全テスト一括通過: 145テスト (既存34 + 新規111)

## 技術方針
- Node.js v24, CommonJS, ゼロ外部依存
- TDD: node:test, テストカバレッジ 80%+
- イミュータブルパターン（Object.freeze, スプレッド構文）
- remote-control.js のアーキテクチャ踏襲
