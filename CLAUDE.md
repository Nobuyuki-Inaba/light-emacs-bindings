# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Run the unit test suite (vitest)
npm test

# Type-check + bundle (run before testing manually)
npm run compile

# Watch mode during development
npm run watch

# Regenerate images/icon.png from images/icon.svg
npm run icon

# Package as .vsix for distribution
npm run package
```

`compile` runs `tsc --noEmit` for type checking, then `esbuild` to produce `out/extension.js`. The two steps are separate so TypeScript errors surface before bundling.

To launch the Extension Development Host, open this folder in VS Code and press **F5**.

## Architecture

Keep logic that doesn't touch the `vscode` API in plain, pure functions (see `src/config.ts`, `src/ctrlXPrefix.ts`, `src/killLine.ts`) and unit-test those directly with vitest — no Extension Development Host required. Reserve `src/extension.ts` for thin `vscode`-API glue (commands, `setContext` calls, event listeners) that wires those pure functions together; it's inherently harder to unit-test and should stay small enough that it doesn't need to be.

This extension contributes Emacs-style keybindings that intentionally override several VS Code defaults (Select All, Find, Toggle Line Comment, Save, etc.) — see `README.md` (English, primary) / `README.ja.md` (Japanese — keep both in sync when editing either) for the full rationale and list. All bindings are gated by settings-derived context keys so any group can be disabled independently.

**Explicit product policy: never touch Copy/Cut/Paste (`Ctrl+C`/`Ctrl+X`/`Ctrl+V`).** `Ctrl+V` is not bound to anything by this extension (kept 100% native). `Ctrl+X` is used as the Emacs `C-x` prefix, but only via the hand-rolled `src/ctrlXPrefix.ts` state machine specifically so that native Cut still fires (after a short timeout) if the user didn't intend a chord — see the dedicated note below. When adding new bindings, this constraint overrides the general "minimize conflicts" goal for these three keys specifically; other single-key overrides (Select All, Save, Toggle Line Comment, Find, Trigger Suggest, Go to Line) are accepted case-by-case and documented in the README's "Overrides" section instead.

### Key source files

| File | Responsibility |
|---|---|
| `src/extension.ts` | `activate`/`deactivate` — registers commands, applies context keys, wires the ctrlXPrefix controller |
| `src/contextKeys.ts` | String constants for every `when`-clause context key this extension sets |
| `src/config.ts` | Reads settings shape (`LightEmacsConfig`) and derives context-key values (`computeContextKeys`) — pure, cascading master-enable logic |
| `src/ctrlXPrefix.ts` | Hand-rolled `Ctrl+X` prefix/timeout state machine — pure, testable with fake timers |
| `src/killLine.ts` | Pure function computing the kill-line target range from line text/cursor/last-line-flag |
| `test/*.test.ts` | vitest coverage for the pure-logic modules above |

### Important constraints

- **`moduleResolution: "node"`** (not `"bundler"`) — required because `module: "commonjs"`. TypeScript 5.x does not support `"bundler"` with `"commonjs"`.
- Keep runtime dependencies at zero where possible — bundle devDependencies into `out/extension.js` via esbuild so the `.vsix` ships with no `node_modules`.
- **`setContext` is write-only.** There is no `vscode.*` API to read a context key's current value back. `extension.ts` therefore mirrors every state change (mark active, Ctrl+X prefix active, settings-derived groups) via `executeCommand('setContext', ...)` immediately after updating its own in-memory state — never assume you can "read" a context key.
- **Why `Ctrl+X` is a hand-rolled prefix instead of a native VS Code chord keybinding**: registering `ctrl+x ctrl+f` as a native chord would make VS Code permanently swallow bare `Ctrl+X` (Cut) whenever the second key isn't pressed, with no fallback to the shadowed single-key command — a confirmed, open VS Code limitation ([microsoft/vscode#140226](https://github.com/microsoft/vscode/issues/140226)). `src/ctrlXPrefix.ts` works around this with its own short timeout window and an explicit fallback to `editor.action.clipboardCutAction`. Follow-up chords currently dispatched through it: `Ctrl+F` (go to file), `Space` (rectangle mark), `Ctrl+S` (save).
- **`Ctrl+S` is dual-purpose** — bare `Ctrl+S` triggers incremental search (`actions.find` / `editor.action.nextMatchFindAction` depending on `findWidgetVisible`), but the *same physical key* is also the `Ctrl+X` follow-up for Save. Both sets of keybindings for `ctrl+s` in `package.json` include `&& !lightEmacsBindings.ctrlXPrefixActive` / `&& lightEmacsBindings.ctrlXPrefixActive` respectively so they never both match at once — mirrors the same pattern already used for `ctrl+f` (go-to-file vs forward-char). `Ctrl+R` mirrors the same open/next-vs-previous shape (`actions.find` / `editor.action.previousMatchFindAction`) for isearch-backward.
- **The `findWidgetVisible`-gated rows for `Ctrl+S`/`Ctrl+R` deliberately omit `editorTextFocus`.** Once the Find widget's input has focus, `editorTextFocus` is false (focus moved off the Monaco editor's text area onto the widget's own input element) — a keybinding requiring `editorTextFocus` there will never fire, silently falling through to VS Code's default for that key (e.g. `Ctrl+R`'s "Switch Window/Workspace", or "reload the Extension Development Host" in a dev host window). This was hit during development: it initially looked like `Ctrl+R` was an unoverridable, EDH-reserved key, but that was a red herring — it was this same `editorTextFocus` bug (the binding simply never matched while the find input had focus), not a real VS Code limitation. Once `editorTextFocus` was dropped from the `findWidgetVisible` rows, `Ctrl+R` was overridden correctly like any other extension-contributed keybinding, in the EDH included. Only the "open search" rows (`!findWidgetVisible`) require `editorTextFocus`, since those are meant to trigger from the editor itself.
- **`Ctrl+K` in the integrated terminal needs its own `terminalFocus` binding.** VS Code's built-in `Ctrl+K …` chord family (`Ctrl+K Ctrl+S`, `Ctrl+K Z`, …) is matched *inside the terminal too*, because `terminal.integrated.allowChords` defaults to `true` — so bare `Ctrl+K` puts the workbench into "waiting for second key" state and never delivers `0x0B` to the shell, breaking readline's kill-line in bash. Our editor binding is `editorTextFocus`-gated and is **not** the cause. The fix is a second `ctrl+k` row bound to `workbench.action.terminal.sendSequence` with `args.text` = `\u000b`, `when: terminalFocus && lightEmacsBindings.killLine.enabled`: an extension-contributed keybinding outranks the built-in chord, so the resolver returns a complete command instead of entering chord mode, and `sendSequence` is in VS Code's default `commandsToSkipShell` so it reaches the shell. Keep `args.text` written as the `\u000b` JSON escape — a literal `0x0B` byte in `package.json` is invalid JSON.
- **Movement keys in the integrated terminal need their own `terminalFocus` rows too, for a different reason than `Ctrl+K`.** VS Code binds `Ctrl+E` as the *secondary* keybinding of `workbench.action.quickOpen` (`C9={primary:2094 /* Ctrl+P */, secondary:[2083] /* Ctrl+E */}` in `workbench.desktop.main.js`) with **no `when` clause**, and `workbench.action.quickOpen` is in VS Code's *default* `terminal.integrated.commandsToSkipShell` list (the bundled `crt` array) — so with the terminal focused, `Ctrl+E`/`Ctrl+P` open Go to File and never deliver `0x05`/`0x10` to the shell. `Ctrl+F` is stolen the same way by `workbench.action.terminal.focusFind` (`primary:2084`, `when: terminalFocus`, also skip-shell by default). `Ctrl+A`/`Ctrl+B`/`Ctrl+N` do reach the shell natively (their defaults — `editor.action.selectAll`, `toggleSidebarVisibility`, `files.newUntitledFile` — are *not* in the skip-shell list), but all six get explicit `terminalFocus` + `sendSequence` rows anyway so terminal behaviour doesn't depend on the user's `commandsToSkipShell` config. Same `\uXXXX`-escape rule as `Ctrl+K`: never write a literal control byte into `package.json`.
- **Manual sync risk**: the `CTX` constants in `src/contextKeys.ts`, the `contributes.configuration` property names in `package.json`, and the `when` clauses in `contributes.keybindings` (also in `package.json`) must be kept in sync by hand — `package.json` can't import TypeScript constants, and there is no automated check that catches a mismatch today.
- **`activationEvents` must include `"onStartupFinished"`.** Every keybinding this extension contributes is gated behind a `lightEmacsBindings.*` context key that only becomes true once `activate()` has run and called `setContext`. Implicit activation (an empty `activationEvents` array, or relying on `contributes.commands`) only activates the extension when one of *our own* commands is invoked — but our own commands are themselves only reachable via those same context-key-gated keybindings, so without an explicit startup activation event the extension never activates and every keybinding silently falls through to VS Code's defaults (this was hit and fixed during initial development).
