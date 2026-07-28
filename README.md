# Light Emacs Bindings

*[日本語版はこちら / Japanese version here → README.ja.md](README.ja.md)*

**Ever had an Emacs keybinding extension quietly break copy-paste on you — working in one panel, dead in another? Not this one.** Copy, Cut, and Paste stay exactly as VS Code intends, always, everywhere. This extension only adds the Emacs muscle memory that doesn't fight your editor — and anywhere a conflict truly can't be avoided, it's documented up front and can be switched off in one click.

## Policy

- **Copy / Cut / Paste (`Ctrl+C` / `Ctrl+X` / `Ctrl+V`) are never broken.** `Ctrl+X` doubles as the Emacs `C-x` prefix, but if nothing follows within ~1 second it automatically falls back to a native Cut — see [How Ctrl+X works](#how-ctrlx-works).
- Every other override is listed below, and every feature group can be toggled independently from VS Code's own Settings UI — no custom webview, no extra app to learn.

## Keybindings by category

### Movement

| Key | Action | Overrides |
|---|---|---|
| `Ctrl+F` | forward-char | Find (still reachable via `Ctrl+S` or the Command Palette) |
| `Ctrl+B` | backward-char | Toggle Sidebar Visibility |
| `Ctrl+N` | next-line | New File |
| `Ctrl+P` | previous-line | Quick Open |
| `Ctrl+A` | beginning-of-line | Select All |
| `Ctrl+E` | end-of-line | *(unbound by default)* |
| `Alt+F` | forward-word | File-menu mnemonic (only if the menu bar is shown) |
| `Alt+B` | backward-word | — |
| `Alt+V` | scroll up a page | — |
| `Alt+Shift+,` (`Alt+<`) | beginning-of-buffer | — |
| `Alt+Shift+.` (`Alt+>`) | end-of-buffer | — |

`Ctrl+V` and `Ctrl+C` are never bound by this extension — Paste and Copy stay native.

### Mark & selection

| Key | Action | Overrides |
|---|---|---|
| `Ctrl+Space` | set-mark-command — start a selection, extend it by moving | Trigger Suggest (manual invocation only; auto-popups while typing are unaffected) |
| `Ctrl+X Space` | toggle rectangle (column) selection | *(see [Ctrl+X](#how-ctrlx-works))* |
| `Ctrl+G` | keyboard-quit — clear mark/selection, cancel a pending `Ctrl+X` | Go to Line (still on the Command Palette) |

### Search

| Key | Action | Overrides |
|---|---|---|
| `Ctrl+S` | isearch-forward — open search, then jump to the next match on repeat | **Save** (moved to `Ctrl+X Ctrl+S`) |
| `Ctrl+R` | isearch-backward — open search, then jump to the previous match on repeat | Switch Window/Workspace |

### File & editing

| Key | Action | Overrides |
|---|---|---|
| `Ctrl+X Ctrl+F` | find-file — opens Quick Open | *(see [Ctrl+X](#how-ctrlx-works))* |
| `Ctrl+X Ctrl+S` | save-buffer — saves the current file | *(see [Ctrl+X](#how-ctrlx-works))* |
| `Ctrl+K` | kill-line — delete to end of line (joining the next line at EOL), copied to the clipboard | VS Code's entire `Ctrl+K …` chord family (comment toggling, formatting, Zen Mode, etc. — still on the Command Palette) |
| `Ctrl+D` | delete-char — delete the character after the cursor (or the selection, if any) | Add Selection To Next Find Match (still on the Command Palette) |
| `Ctrl+;` | comment-line — toggle the line comment | *(unbound by default — this is where VS Code's own Toggle Line Comment moved to)* |
| `Ctrl+/` | undo | Toggle Line Comment (moved to `Ctrl+;`) |
| `Ctrl+Shift+/` | redo (Emacs-style `C-?` convention) | *(unbound by default)* — `Ctrl+Z`/`Ctrl+Y` keep working natively too |

### Commands

| Key | Action | Overrides |
|---|---|---|
| `Alt+X` | execute-extended-command — opens the Command Palette | *(unbound by default)* |
| *(unbound — bind your own)* | `Light Emacs Bindings: Toggle Enabled` — flips the master switch | — |

## How `Ctrl+X` works

`Ctrl+X` is **not** implemented as a native VS Code chord. VS Code has a confirmed, open limitation ([microsoft/vscode#140226](https://github.com/microsoft/vscode/issues/140226)): once a key is registered as the first half of a chord, pressing it alone and not following up doesn't fall back to whatever it used to do — it's just silently swallowed. For `Ctrl+X`, that would mean losing Cut. So instead:

1. `Ctrl+X` alone starts a ~1 second window.
2. `Ctrl+F` (go to file), `Space` (toggle rectangle selection), or `Ctrl+S` (save) within that window does the corresponding action.
3. Nothing follows within the window → a native **Cut** fires automatically, exactly as bare `Ctrl+X` always would.
4. `Ctrl+G` cancels the window without cutting.

## Overrides at a glance

| VS Code default this replaces | Still reachable via |
|---|---|
| Toggle Sidebar Visibility (`Ctrl+B`) | View menu / Command Palette |
| New File (`Ctrl+N`) | File menu / Command Palette |
| Quick Open (`Ctrl+P`) | `Ctrl+X Ctrl+F` / Command Palette |
| Find (`Ctrl+F`) | `Ctrl+S` / Command Palette |
| Go to Line (`Ctrl+G`) | Command Palette |
| Select All (`Ctrl+A`) | Edit menu / Command Palette |
| Trigger Suggest, manual (`Ctrl+Space`) | Command Palette |
| Toggle Line Comment (`Ctrl+/`) | `Ctrl+;` |
| Save (`Ctrl+S`) | `Ctrl+X Ctrl+S` / File menu |
| Switch Window/Workspace (`Ctrl+R`) | Command Palette |
| Add Selection To Next Find Match (`Ctrl+D`) | Command Palette |
| `Ctrl+K …` chord family | Command Palette |

Copy, Cut, and Paste are never in this table — they're not touched.

## Settings

Search **"Light Emacs Bindings"** in VS Code's Settings UI, or edit `settings.json` directly:

| Setting | Default | Controls |
|---|---|---|
| `lightEmacsBindings.enable` | `true` | Master switch for every keybinding |
| `lightEmacsBindings.movement.enabled` | `true` | Movement category |
| `lightEmacsBindings.mark.enabled` | `true` | Mark (`Ctrl+Space`) |
| `lightEmacsBindings.rectangleSelection.enabled` | `true` | Rectangle selection (`Ctrl+X Space`) |
| `lightEmacsBindings.goToFile.enabled` | `true` | Go to file (`Ctrl+X Ctrl+F`) |
| `lightEmacsBindings.save.enabled` | `true` | Save (`Ctrl+X Ctrl+S`) |
| `lightEmacsBindings.commandPalette.enabled` | `true` | Command Palette (`Alt+X`) |
| `lightEmacsBindings.killLine.enabled` | `true` | Kill-line (`Ctrl+K`) |
| `lightEmacsBindings.deleteChar.enabled` | `true` | Delete-char (`Ctrl+D`) |
| `lightEmacsBindings.comment.enabled` | `true` | Comment toggle (`Ctrl+;`) |
| `lightEmacsBindings.undoRedo.enabled` | `true` | Undo/Redo (`Ctrl+/` / `Ctrl+Shift+/`) |
| `lightEmacsBindings.incrementalSearch.enabled` | `true` | Search (`Ctrl+S` / `Ctrl+R`) |

```json
{
  "lightEmacsBindings.movement.enabled": false,
  "lightEmacsBindings.killLine.enabled": false
}
```

### Bind your own toggle key

`lightEmacsBindings.toggleEnabled` ships with no default keybinding. Add one in `keybindings.json`:

```json
{
  "key": "ctrl+alt+e",
  "command": "lightEmacsBindings.toggleEnabled"
}
```

## Known limitations / Roadmap

- **Keyboard macros are out of scope for v1.** VS Code has no general-purpose macro-recording API and no way to intercept arbitrary command execution. A future version might offer a *scoped* recorder limited to this extension's own commands (movement, mark, rectangle selection, go-to-file, etc.) — that would be low-risk; a general one would not.
- If you disable only one of `rectangleSelection.enabled` / `goToFile.enabled` / `save.enabled`, its `Ctrl+X` follow-up key falls through to that key's own VS Code default during the ~1 second window instead of doing nothing.
- `Alt+F` / `Alt+B` may collide with File-menu mnemonics if your menu bar is visible (no issue if it's hidden).

## Requirements

- VS Code 1.85.0 or later.

## Development

```bash
npm install       # install dependencies
npm run compile   # type-check, then bundle with esbuild
npm run watch     # rebuild on save
npm test          # run the vitest unit tests
npm run icon      # regenerate images/icon.png from images/icon.svg
npm run package   # produce a .vsix
```

Press **F5** in VS Code to launch an Extension Development Host with this extension loaded.

## Release

Push a `v*` tag to trigger `.github/workflows/release.yml`, which builds a `.vsix` and attaches it to a GitHub Release.

## License

MIT — see [LICENSE](LICENSE).
