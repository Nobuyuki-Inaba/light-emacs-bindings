import * as vscode from 'vscode';
import { CTX } from './contextKeys';
import { computeContextKeys, LightEmacsConfig } from './config';
import { createCtrlXPrefixController } from './ctrlXPrefix';
import { computeKillLineTarget } from './killLine';

function readConfig(): LightEmacsConfig {
  const c = vscode.workspace.getConfiguration('lightEmacsBindings');
  return {
    enable: c.get<boolean>('enable', true),
    movementEnabled: c.get<boolean>('movement.enabled', true),
    markEnabled: c.get<boolean>('mark.enabled', true),
    rectangleSelectionEnabled: c.get<boolean>('rectangleSelection.enabled', true),
    goToFileEnabled: c.get<boolean>('goToFile.enabled', true),
    commandPaletteEnabled: c.get<boolean>('commandPalette.enabled', true),
    killLineEnabled: c.get<boolean>('killLine.enabled', true),
    deleteCharEnabled: c.get<boolean>('deleteChar.enabled', true),
    commentEnabled: c.get<boolean>('comment.enabled', true),
    undoRedoEnabled: c.get<boolean>('undoRedo.enabled', true),
    incrementalSearchEnabled: c.get<boolean>('incrementalSearch.enabled', true),
    saveEnabled: c.get<boolean>('save.enabled', true),
  };
}

async function applyContextKeys(values: Record<string, boolean>): Promise<void> {
  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      vscode.commands.executeCommand('setContext', key, value),
    ),
  );
}

function ignoreRejection(promise: Thenable<unknown>): void {
  void promise.then(
    () => undefined,
    () => undefined,
  );
}

export function activate(context: vscode.ExtensionContext): void {
  const setMarkActive = (value: boolean): void => {
    void vscode.commands.executeCommand('setContext', CTX.MARK_ACTIVE, value);
  };
  const setCtrlXPrefixActive = (value: boolean): void => {
    void vscode.commands.executeCommand('setContext', CTX.CTRL_X_PREFIX_ACTIVE, value);
  };

  const ctrlXPrefix = createCtrlXPrefixController({
    onActivate: () => setCtrlXPrefixActive(true),
    onDeactivate: () => setCtrlXPrefixActive(false),
    onFallbackCut: () => {
      ignoreRejection(vscode.commands.executeCommand('editor.action.clipboardCutAction'));
    },
  });

  const applyConfig = (): void => {
    void applyContextKeys(computeContextKeys(readConfig()));
  };

  setMarkActive(false);
  setCtrlXPrefixActive(false);
  applyConfig();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('lightEmacsBindings')) applyConfig();
    }),

    vscode.commands.registerCommand('lightEmacsBindings.toggleEnabled', async () => {
      const c = vscode.workspace.getConfiguration('lightEmacsBindings');
      await c.update('enable', !c.get<boolean>('enable', true), vscode.ConfigurationTarget.Global);
    }),

    vscode.commands.registerCommand('lightEmacsBindings.setMarkCommand', () => {
      setMarkActive(true);
    }),

    vscode.commands.registerCommand('lightEmacsBindings.keyboardQuit', () => {
      setMarkActive(false);
      ctrlXPrefix.dismiss();
      ignoreRejection(vscode.commands.executeCommand('cancelSelection'));
    }),

    vscode.commands.registerCommand('lightEmacsBindings.ctrlXPrefix', () => {
      ctrlXPrefix.activate();
    }),

    vscode.commands.registerCommand('lightEmacsBindings.goToFile', () => {
      ctrlXPrefix.dismiss();
      ignoreRejection(vscode.commands.executeCommand('workbench.action.quickOpen'));
    }),

    vscode.commands.registerCommand('lightEmacsBindings.rectangleMark', () => {
      ctrlXPrefix.dismiss();
      ignoreRejection(vscode.commands.executeCommand('editor.action.toggleColumnSelection'));
    }),

    vscode.commands.registerCommand('lightEmacsBindings.save', () => {
      ctrlXPrefix.dismiss();
      ignoreRejection(vscode.commands.executeCommand('workbench.action.files.save'));
    }),

    vscode.commands.registerCommand('lightEmacsBindings.killLine', () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const pos = editor.selection.active;
      const doc = editor.document;
      const line = doc.lineAt(pos.line);
      const target = computeKillLineTarget(line.text, pos.character, pos.line === doc.lineCount - 1);
      if (target.kind === 'nothing') return;
      const endPos =
        target.kind === 'toEndOfLine'
          ? new vscode.Position(pos.line, target.endCharacter)
          : new vscode.Position(pos.line + 1, 0);
      editor.selection = new vscode.Selection(pos, endPos);
      ignoreRejection(vscode.commands.executeCommand('editor.action.clipboardCutAction'));
    }),

    { dispose: () => ctrlXPrefix.dispose() },
  );
}

export function deactivate(): void {}
