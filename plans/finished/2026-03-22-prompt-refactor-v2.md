# プロンプトアーキテクチャ v2: 統一プロンプト化

## Context

「ベースカラーを変えたい」と言うと、正規表現が「したい」にマッチして chat 分類 → Haiku → ロールプレイ → 「どの部署に聞きますか？」と返すだけで実行しない。
v1 で2モード制（chat/action）に分けたが、正規表現の柔軟性の限界は変わらない。
**LLM自身に判断させる統一プロンプト**に作り直す。

## 方針

- 正規表現による chat/light 分類を**廃止**
- 1つの賢いプロンプトでロールプレイ＋ツール判断を両立
- モデルは常に **Sonnet**（ツール推論に必要な知性）
- **プロンプトキャッシュ**でコスト増を相殺
- heavy タスク検出（タスクキュー用）のみ正規表現を残す

## 実装ステップ（TDD）

### Step 1: action-detector.ts — heavy 検出のみに簡素化

**ファイル**: `src/lib/action-detector.ts`, `src/lib/tools/__tests__/action-detector.test.ts`

- `classifyTask()`, `needsExecution()`, `TaskClassification` 型を削除
- `CONSULTATION_PATTERNS`, `CHANGE_REQUEST_PATTERNS`, `CHAT_ONLY_PATTERNS`, `BUSINESS_KEYWORDS`, `DATA_QUERY_KEYWORDS`, `TOOL_KEYWORDS` を削除
- `HEAVY_EXECUTION_PATTERNS` のみ残す
- 新エクスポート: `isHeavyTask(message): { isHeavy: boolean; taskType: TaskType | null }`
- テスト: heavy パターンのみ。~8 テストケース

### Step 2: prompt-builder.ts — 統一プロンプト

**ファイル**: `src/lib/prompt-builder.ts`, `src/lib/__tests__/prompt-builder.test.ts`

- `PromptMode` 型を削除
- `buildChatPrompt()`, `buildActionPrompt()` を削除
- 新: `buildSystemPrompt(dept: Department): string` — 単一プロンプト
- 新: `buildCacheableSystemPrompt(dept): Anthropic.TextBlockParam[]` — キャッシュ対応版

統一プロンプト構造（秘書）:
```
あなたは仮想会社「Company」の秘書、藤崎ひなたです。
[人物像: personality/tone/catchphrases]
[部署一覧]

## 行動原則
- 全部署の知識で回答、たらい回ししない
- 簡潔に

## 会話とアクションの判断基準     ← ★ 核心
会話で応答: 雑談、壁打ち、意見求め
ツールを使う: データアクセス、実行依頼、変更依頼、検索
迷ったら: まず実行。確認は最小限。

[ツール利用/ファイル操作/リッチコンテンツ指示]
[日付]
```

キャッシュ: 静的部分（人物像〜ツール指示）に `cache_control: { type: 'ephemeral' }` を付与。日付だけ動的。

### Step 3: model-selector.ts — 常に Sonnet

**ファイル**: `src/lib/model-selector.ts`, `src/lib/__tests__/model-selector.test.ts`

- `mode` 引数を削除
- デフォルト Sonnet。ユーザー指定のみオーバーライド
- `SONNET_DEPARTMENTS`, `OPUS_DEPARTMENTS` 削除

### Step 4: API ルート — 分類ロジック削除

**ファイル**: `src/app/api/chat/route.ts`, `src/app/api/chat/stream/route.ts`

- `classifyTask` インポート削除
- `PromptMode` インポート削除
- `buildCacheableSystemPrompt(dept)` を使用（配列形式の system パラメータ）
- `selectModel(dept.id, userModel)` に簡素化
- SSE meta から `mode` フィールド削除

### Step 5: tasks/route.ts — isHeavyTask に切替

**ファイル**: `src/app/api/tasks/route.ts`

- `classifyTask` → `isHeavyTask` に変更
- `classification.weight === 'heavy'` → `result.isHeavy`
- `classification.taskType` → `result.taskType`

### Step 6: フロントエンド — isHeavyTask + デフォルト Sonnet

**ファイル**: `src/app/chat/page.tsx`

- L8: `classifyTask` → `isHeavyTask` に変更
- L24: デフォルトモデル `'haiku'` → `'sonnet'` に変更
- L100-103: `classification.weight === 'heavy'` → `isHeavyTask(text).isHeavy`

### Step 7: デッドコード削除 + 全体検証

- 未使用 import の整理
- `npx vitest run` — 全テスト通過
- `npx next build` — ビルド成功

## テスト影響

| テストファイル | 変更 | 理由 |
|-------------|------|------|
| `action-detector.test.ts` | 全書き直し | classifyTask → isHeavyTask |
| `prompt-builder.test.ts` | action モード削除、統一テスト追加 | mode 廃止 |
| `model-selector.test.ts` | mode テスト削除、簡素化 | mode 廃止 |
| 他16ファイル | 変更なし | 影響なし |

## 手動QA（実装後）

1. 「こんにちは」→ キャラで応答、ツール不使用
2. 「今月の予定教えて」→ get_calendar_events 使用
3. 「ベースカラーを変えたい」→ read_file → 提案
4. 「新機能の方向性どう思う？」→ 会話で応答、ツール不使用
5. 「スライドを作ってください」→ /api/tasks にルーティング

## コスト影響

- Haiku→Sonnet: 入力3.75x、出力6.25x
- プロンプトキャッシュで **システムプロンプト部分90%削減**（2回目以降）
- 短い挨拶: 絶対コスト ~$0.001/msg → 許容範囲
- 改善される品質（ツール推論、文脈理解）がコスト増を正当化
