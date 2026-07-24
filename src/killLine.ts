export type KillLineTarget =
  | { kind: 'toEndOfLine'; endCharacter: number }
  | { kind: 'toStartOfNextLine' }
  | { kind: 'nothing' };

export function computeKillLineTarget(
  lineText: string,
  cursorCharacter: number,
  isLastLine: boolean,
): KillLineTarget {
  if (cursorCharacter < lineText.length) {
    return { kind: 'toEndOfLine', endCharacter: lineText.length };
  }
  if (!isLastLine) {
    return { kind: 'toStartOfNextLine' };
  }
  return { kind: 'nothing' }; // matches Emacs: C-k at end of buffer does nothing
}
