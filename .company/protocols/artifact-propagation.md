# アーティファクト伝播プロトコル

## 概要

部署間のアーティファクト（成果物）の生成・検証・伝播を管理するプロトコル。

## アーティファクトとは

各部署の `outputs` で宣言された成果物（ドキュメント・分析・決定事項など）。

```
Artifact = {
  id:           UUID
  departmentId: 生成元部署ID
  type:         成果物タイプ（部署のoutputsに定義）
  title:        タイトル
  path:         ファイルパス
  status:       created → in-progress → completed → delivered
  createdAt:    ISO 8601 タイムスタンプ
}
```

## 伝播フロー

```
1. 部署が成果物を生成 (createArtifact)
2. レジストリで検証 (validateArtifact)
   - 部署が存在するか
   - 部署がその type を outputs に宣言しているか
3. 下流部署を特定 (findDownstream)
   - その部署を dependencies に含む部署 = 下流
4. 伝播計画を構築 (buildPropagationPlan)
   - source: 生成元部署
   - recipients: 下流部署リスト
   - artifact: 対象アーティファクト
5. マニフェストに記録 (addToManifest)
```

## 伝播の方向性

```
secretary → ceo → pm → ...
    │               └→ engineering
    ├→ research
    └→ finance → sales
```

- `dependencies: [X]` = 「Xから入力を受け取る」
- 伝播方向: 生成元 → 依存元（下流）
- 例: secretary が todos を生成 → ceo, research, finance に伝播

## 部署別 outputs 一覧

| 部署 | outputs |
|------|---------|
| secretary | todos, notes, inbox |
| ceo | decisions |
| pm | projects, tickets |
| research | topics |
| finance | invoices, expenses |
| marketing | content-plan, campaigns |
| engineering | debug-log, docs |
| sales | clients, proposals |
| creative | briefs, assets |
| hr | hiring |
| legal | contracts, compliance |
| logistics | inventory, shipping |
| ebay | listings, analytics, operations |
| apparel | collections, brand, production |
| dx | products, architecture, roadmap |

## マニフェスト

全アーティファクトの履歴を JSON で管理。

- ファイル: `.company/artifacts/manifest.json`
- 操作: createManifest, addToManifest, saveManifest, loadManifest
- 検索: getArtifactsByDepartment, getArtifactsByType

## API リファレンス

```
scripts/lib/artifact.js

createArtifact(opts)              → Artifact
updateArtifactStatus(a, status)   → Artifact
validateArtifact(a, registry)     → { valid, errors }
findDownstream(registry, deptId)  → DepartmentMeta[]
buildPropagationPlan(a, registry) → { source, recipients, artifact }
createManifest()                  → Manifest
addToManifest(manifest, a)        → Manifest
getArtifactsByDepartment(m, id)   → Artifact[]
getArtifactsByType(m, type)       → Artifact[]
saveManifest(path, manifest)      → void
loadManifest(path)                → Manifest
```
