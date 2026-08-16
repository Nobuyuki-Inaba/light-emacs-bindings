# Light Emacs Bindings

*[English version here → README.md](README.md)*

**VS CodeのEmacsキーバインド拡張機能で、コピペができなくなったことはありませんか？あるパネルでは動くのに、別の場所では効かない……そんな経験、ありませんか？**この拡張機能ではそれが起きません。コピー・カット・ペーストは常にVS Code標準のまま動きます。コピペは標準を使いましょう — この拡張機能はまさにそのために作られています。追加するのは、エディタと喧嘩しないEmacsの手癖だけです。どうしても衝突が避けられない箇所は事前にドキュメント化し、ワンクリックで無効化できるようにしています。

## 方針

- **コピー・カット・ペースト(`Ctrl+C` / `Ctrl+X` / `Ctrl+V`)は絶対に壊しません。** `Ctrl+X` はEmacsの `C-x` プレフィックスも兼ねますが、約0.5秒以内に続きの入力が無ければ自動的にネイティブなCutにフォールバックします([Ctrl+Xの仕組み](#ctrlxの仕組み)参照)。
- それ以外の上書きはすべて下記に一覧化し、各機能グループはVS Code標準の設定画面から個別にON/OFFできます。独自のWebview設定画面は使いません。

## カテゴリ別キーバインド一覧

### カーソル移動

| キー | 動作 | 上書きする既定動作 |
|---|---|---|
| `Ctrl+F` | 前進(文字) | Find(`Ctrl+S` またはコマンドパレットから利用可) |
| `Ctrl+B` | 後退(文字) | サイドバー表示切り替え |
| `Ctrl+N` | 次行 | 新規ファイル |
| `Ctrl+P` | 前行 | Quick Open |
| `Ctrl+A` | 行頭 | 全選択 |
| `Ctrl+E` | 行末 | Quick Open(VS Codeが `Ctrl+P` の第2キーとして割り当てている) |
| `Alt+F` | 単語単位で前進 | File メニューのニーモニック(メニューバー表示時のみ) |
| `Alt+B` | 単語単位で後退 | — |
| `Alt+V` | 前ページへスクロール | — |
| `Alt+Shift+,`(`Alt+<`) | バッファ先頭 | — |
| `Alt+Shift+.`(`Alt+>`) | バッファ末尾 | — |

`Ctrl+V`・`Ctrl+C` はこの拡張機能では一切割り当てません — 貼り付け・コピーは常に標準のままです。

**統合ターミナルでは**、`Ctrl+F`・`Ctrl+B`・`Ctrl+N`・`Ctrl+P`・`Ctrl+A`・`Ctrl+E` は対応する生の制御文字(`0x06`・`0x02`・`0x0E`・`0x10`・`0x01`・`0x05`)を送出し、シェル自身のreadlineによる移動が動くようにしています。これが無いと、`Ctrl+E`・`Ctrl+P` はVS Code側のQuick Openに、`Ctrl+F` はターミナルの検索ウィジェットに横取りされ、シェルまで届きません。実際に壊れているのはこの3つですが、`terminal.integrated.commandsToSkipShell` の設定に左右されず挙動が一定になるよう残り3つも同様に割り当てています。

### Mark・選択

| キー | 動作 | 上書きする既定動作 |
|---|---|---|
| `Ctrl+Space` | mark設定 — 選択を開始し、移動キーで拡張 | Trigger Suggest(手動呼び出しのみ。タイピング中の自動候補表示は影響なし) |
| `Ctrl+X Space` | 矩形(カラム)選択トグル | *([Ctrl+X](#ctrlxの仕組み)参照)* |
| `Ctrl+G` | keyboard-quit — mark/選択解除、`Ctrl+X` 待機のキャンセル | Go to Line(コマンドパレットから利用可) |

### 検索

| キー | 動作 | 上書きする既定動作 |
|---|---|---|
| `Ctrl+S` | インクリメンタル検索(前方) — 開始、再度押すと次候補へ | **保存**(`Ctrl+X Ctrl+S` に移動) |
| `Ctrl+R` | インクリメンタル検索(後方) — 開始、再度押すと前候補へ | ウィンドウ/ワークスペース切り替え |

### ファイル・編集

| キー | 動作 | 上書きする既定動作 |
|---|---|---|
| `Ctrl+X Ctrl+F` | find-file — Quick Openを開く | *([Ctrl+X](#ctrlxの仕組み)参照)* |
| `Ctrl+X Ctrl+S` | save-buffer — 現在のファイルを保存 | *([Ctrl+X](#ctrlxの仕組み)参照)* |
| `Ctrl+K` | kill-line — 行末まで削除(行末なら次行と連結)、クリップボードにコピー。統合ターミナルでは代わりに生の `C-k`(`0x0B`)を送出し、シェル自身のkill-lineを動かす | VS Code純正の `Ctrl+K …` チェインコマンド群(行コメント切り替え・フォーマット・Zenモードなど。コマンドパレットから利用可) |
| `Ctrl+D` | delete-char — カーソル直後の1文字を削除(選択範囲があればその範囲を削除) | 次の一致を選択に追加(コマンドパレットから利用可) |
| `Ctrl+;` | comment-line — 行コメント切り替え | *(既定では未割り当て — VS Code純正の行コメント切り替えの移動先)* |
| `Ctrl+/` | Undo | 行コメント切り替え(`Ctrl+;` に移動) |
| `Ctrl+Shift+/` | Redo(Emacs流の `C-?` 慣習) | *(既定では未割り当て)* — `Ctrl+Z`/`Ctrl+Y` も引き続き有効 |

### コマンド

| キー | 動作 | 上書きする既定動作 |
|---|---|---|
| `Alt+X` | execute-extended-command — コマンドパレットを開く | *(既定では未割り当て)* |
| *(未割り当て — 自分で設定)* | `Light Emacs Bindings: Toggle Enabled` — マスタースイッチの切り替え | — |

## `Ctrl+X` の仕組み

`Ctrl+X` は VS Code のネイティブなチェインキー(chord)としては実装して**いません**。VS Codeには既知の未解決の制限があり([microsoft/vscode#140226](https://github.com/microsoft/vscode/issues/140226))、一度あるキーがチェインの1打鍵目として登録されると、単体で押して何も続かなかった場合に元の動作へフォールバックせず、そのまま無視されてしまいます。`Ctrl+X` の場合、これはCutが失われることを意味します。そこで:

1. `Ctrl+X` を押すと約0.5秒間の待機ウィンドウが始まります。
2. その間に `Ctrl+F`(Go to File)・`Space`(矩形選択トグル)・`Ctrl+S`(保存)を押すと、それぞれの動作が実行されます。
3. 何も入力が無ければ、ウィンドウ終了時に自動的に **Cut** が実行されます(単体の `Ctrl+X` と全く同じ挙動)。
4. `Ctrl+G` で待機をキャンセルできます(Cutは実行されません)。

## 上書き一覧

| 上書きされる VS Code の既定動作 | 引き続き実行する方法 |
|---|---|
| サイドバー表示切り替え(`Ctrl+B`) | View メニュー / コマンドパレット |
| 新規ファイル(`Ctrl+N`) | File メニュー / コマンドパレット |
| Quick Open(`Ctrl+P`、および第2キーの `Ctrl+E`) | `Ctrl+X Ctrl+F` / コマンドパレット |
| ターミナルの検索ウィジェット(ターミナルにフォーカスがある時の `Ctrl+F`) | コマンドパレット |
| Find(`Ctrl+F`) | `Ctrl+S` / コマンドパレット |
| Go to Line(`Ctrl+G`) | コマンドパレット |
| 全選択(`Ctrl+A`) | Edit メニュー / コマンドパレット |
| Trigger Suggest 手動呼び出し(`Ctrl+Space`) | コマンドパレット |
| 行コメント切り替え(`Ctrl+/`) | `Ctrl+;` |
| 保存(`Ctrl+S`) | `Ctrl+X Ctrl+S` / File メニュー |
| ウィンドウ/ワークスペース切り替え(`Ctrl+R`) | コマンドパレット |
| 次の一致を選択に追加(`Ctrl+D`) | コマンドパレット |
| `Ctrl+K …` チェインコマンド群 | コマンドパレット |

コピー・カット・ペーストはこの一覧に含まれません — 一切変更していないためです。

## 設定

設定画面で **"Light Emacs Bindings"** を検索するか、`settings.json` に直接記述してください:

| 設定 | 既定値 | 対象 |
|---|---|---|
| `lightEmacsBindings.enable` | `true` | 全キーバインドのマスタースイッチ |
| `lightEmacsBindings.movement.enabled` | `true` | カーソル移動カテゴリ |
| `lightEmacsBindings.mark.enabled` | `true` | mark(`Ctrl+Space`) |
| `lightEmacsBindings.rectangleSelection.enabled` | `true` | 矩形選択(`Ctrl+X Space`) |
| `lightEmacsBindings.goToFile.enabled` | `true` | Go to file(`Ctrl+X Ctrl+F`) |
| `lightEmacsBindings.save.enabled` | `true` | 保存(`Ctrl+X Ctrl+S`) |
| `lightEmacsBindings.commandPalette.enabled` | `true` | コマンドパレット(`Alt+X`) |
| `lightEmacsBindings.killLine.enabled` | `true` | kill-line(`Ctrl+K`) |
| `lightEmacsBindings.deleteChar.enabled` | `true` | delete-char(`Ctrl+D`) |
| `lightEmacsBindings.comment.enabled` | `true` | コメント切り替え(`Ctrl+;`) |
| `lightEmacsBindings.undoRedo.enabled` | `true` | Undo/Redo(`Ctrl+/` / `Ctrl+Shift+/`) |
| `lightEmacsBindings.incrementalSearch.enabled` | `true` | 検索(`Ctrl+S` / `Ctrl+R`) |

```json
{
  "lightEmacsBindings.movement.enabled": false,
  "lightEmacsBindings.killLine.enabled": false
}
```

### トグル用キーを自分で割り当てる

`lightEmacsBindings.toggleEnabled` には既定のキーバインドがありません。`keybindings.json` に追記してください:

```json
{
  "key": "ctrl+alt+e",
  "command": "lightEmacsBindings.toggleEnabled"
}
```

## 既知の制限・ロードマップ

- **キーボードマクロは v1 のスコープ外です。** VS Code には汎用的なマクロ記録APIが無く、任意のコマンド実行を横取りする一般的な方法もありません。将来的には、本拡張が自前で定義しているコマンド(移動・mark・矩形選択・goto-file等)に限定した「限定版マクロ」であれば低リスクで実現できる可能性があります。
- `rectangleSelection.enabled` / `goToFile.enabled` / `save.enabled` のうち一部だけを無効にした場合、`Ctrl+X` の待機中に対応する2打鍵目(`Space`・`Ctrl+F`・`Ctrl+S`)を押すと、そのキーのVS Code既定動作にフォールバックします。
- `Alt+F` / `Alt+B` は、メニューバーが表示されている環境では File メニューのニーモニックと衝突する可能性があります(メニューバーを非表示にしていれば問題ありません)。

## Requirements

- VS Code 1.85.0 以降。

## Development

```bash
npm install       # 依存関係のインストール
npm run compile   # 型チェック後、esbuildでバンドル
npm run watch     # 保存時に自動リビルド
npm test          # vitestによる単体テスト実行
npm run icon      # images/icon.svg から images/icon.png を再生成
npm run package   # .vsix を生成
```

VS Codeで **F5** を押すとExtension Development Hostが起動します。

## Release

`v*` タグをpushすると `.github/workflows/release.yml` が起動し、`.vsix` をビルドしてGitHub Releaseに添付します。

## License

MIT — [LICENSE](LICENSE) 参照。
