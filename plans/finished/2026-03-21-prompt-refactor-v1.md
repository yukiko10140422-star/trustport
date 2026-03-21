# プロンプトアーキテクチャ全面リファクタ

- 作成日: 2026-03-21
- 完了日: 2026-03-21
- 優先度: HIGH

## 背景

「ベースカラーを変えたい」と言ったら、秘書キャラが「どの部署に聞きますか？」とロールプレイで返すだけで、実際のアクションを取らない。

### 根本原因（3つ）

1. **action-detector.ts が死んでいた** — `classifyTask()` は定義されていたが `stream/route.ts` で一切呼ばれていなかった
2. **「〜したい」が全て相談扱い** — `CONSULTATION_PATTERNS` が「ベースカラーを変えたい」にもマッチして `chat` に分類
3. **プロンプトに「行動モード」がなかった** — 全メッセージが同じロールプレイプロンプトで処理

## 完了したフェーズ

### Phase 1: action-detector の改善
- [x] `CHANGE_REQUEST_PATTERNS` を追加（変えたい/直したい/更新したい + 目的語）
- [x] 相談パターンより先に変更依頼パターンを判定する優先順位に修正
- [x] テスト追加（11テスト全通過）

### Phase 2: prompt-builder の2モード化
- [x] `buildSystemPrompt(dept, mode: 'chat' | 'action')` に拡張
- [x] chat モード: 従来のロールプレイ（変更なし）
- [x] action モード: ツール即実行優先、不要な質問返し禁止
- [x] テスト追加（13テスト全通過）

### Phase 3: model-selector の改善
- [x] `selectModel(departmentId, mode, userOverride)` に拡張
- [x] action モード → Sonnet 最低
- [x] テスト追加（8テスト全通過）

### Phase 4: stream/route.ts への統合
- [x] `classifyTask()` でモード判定
- [x] モードに応じた prompt/model 選択
- [x] SSEメタデータに `mode` 追加
- [x] 非ストリーム route.ts も同様に更新

### Phase 5: 検証
- [x] 全150テスト通過
- [x] ビルド成功

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `action-detector.ts` | CHANGE_REQUEST_PATTERNS 追加、判定優先順位修正 |
| `prompt-builder.ts` | PromptMode 型追加、buildActionPrompt 新規、buildChatPrompt 分離 |
| `model-selector.ts` | mode 引数追加、action → sonnet 最低 |
| `stream/route.ts` | classifyTask 統合、モード判定 |
| `route.ts` | 同上 |
| `**/action-detector.test.ts` | 変更依頼テスト追加 |
| `**/prompt-builder.test.ts` | action モードテスト追加 |
| `**/model-selector.test.ts` | mode 引数テスト追加 |
