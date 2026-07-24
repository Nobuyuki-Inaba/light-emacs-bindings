import { describe, expect, it } from 'vitest';
import { computeKillLineTarget } from '../src/killLine';

describe('computeKillLineTarget', () => {
  it('kills to end of line when the cursor is before the end', () => {
    expect(computeKillLineTarget('hello world', 5, false)).toEqual({
      kind: 'toEndOfLine',
      endCharacter: 11,
    });
  });

  it('joins the next line when the cursor is at end of line and more lines follow', () => {
    expect(computeKillLineTarget('hello', 5, false)).toEqual({ kind: 'toStartOfNextLine' });
  });

  it('does nothing when the cursor is at end of the last line', () => {
    expect(computeKillLineTarget('hello', 5, true)).toEqual({ kind: 'nothing' });
  });

  it('joins the next line on an empty, non-last line', () => {
    expect(computeKillLineTarget('', 0, false)).toEqual({ kind: 'toStartOfNextLine' });
  });

  it('does nothing on an empty last line', () => {
    expect(computeKillLineTarget('', 0, true)).toEqual({ kind: 'nothing' });
  });
});
