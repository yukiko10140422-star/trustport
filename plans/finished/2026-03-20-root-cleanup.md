# ルートディレクトリ整理

- 作成日: 2026-03-20
- 完了日: 2026-03-20
- 優先度: HIGH
- コミット: 413ba43

## 背景

ルートディレクトリにデバッグ用スクリーンショット17枚、キャッシュディレクトリ（.playwright-mcp/, .next/, .serena/）、旧パス（research/, ceo/）が散乱していた。

## 実施内容

- [x] ルートPNG 17枚を削除
- [x] .playwright-mcp/ キャッシュを削除（ログ40件+画像16枚）
- [x] .next/ ビルドキャッシュを削除
- [x] .serena/ キャッシュを削除
- [x] research/ → .company/research/ に統合済みのため旧パス削除（git rm）
- [x] ceo/decisions/yura-deep-research.md → .company/ceo/decisions/ に移動
- [x] ceo/ 旧パス削除（git rm）
- [x] GITHUB_ISSUE_GUIDE.md, .marprc.yml, themes/ を削除（未使用）
- [x] .gitignore を更新（outputs/, *.png, *.mp4, キャッシュディレクトリを除外）

## 結果

11ファイル変更、27行追加、1,898行削除。ルートがクリーンな状態になった。
