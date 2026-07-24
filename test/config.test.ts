import { describe, expect, it } from 'vitest';
import { CTX } from '../src/contextKeys';
import { computeContextKeys, LightEmacsConfig } from '../src/config';

const allEnabled: LightEmacsConfig = {
  enable: true,
  movementEnabled: true,
  markEnabled: true,
  rectangleSelectionEnabled: true,
  goToFileEnabled: true,
  commandPaletteEnabled: true,
  killLineEnabled: true,
  commentEnabled: true,
  undoRedoEnabled: true,
  incrementalSearchEnabled: true,
  saveEnabled: true,
};

describe('computeContextKeys', () => {
  it('derives every key as true when master and all groups are enabled', () => {
    const result = computeContextKeys(allEnabled);

    expect(result[CTX.ACTIVE]).toBe(true);
    expect(result[CTX.MOVEMENT_ENABLED]).toBe(true);
    expect(result[CTX.MARK_ENABLED]).toBe(true);
    expect(result[CTX.RECTANGLE_SELECTION_ENABLED]).toBe(true);
    expect(result[CTX.GO_TO_FILE_ENABLED]).toBe(true);
    expect(result[CTX.COMMAND_PALETTE_ENABLED]).toBe(true);
    expect(result[CTX.KILL_LINE_ENABLED]).toBe(true);
    expect(result[CTX.COMMENT_ENABLED]).toBe(true);
    expect(result[CTX.UNDO_REDO_ENABLED]).toBe(true);
    expect(result[CTX.INCREMENTAL_SEARCH_ENABLED]).toBe(true);
    expect(result[CTX.SAVE_ENABLED]).toBe(true);
    expect(result[CTX.CTRL_X_PREFIX_AVAILABLE]).toBe(true);
  });

  it('forces every derived key to false when the master switch is off', () => {
    const result = computeContextKeys({ ...allEnabled, enable: false });

    for (const value of Object.values(result)) {
      expect(value).toBe(false);
    }
  });

  it('ctrlXPrefixAvailable is true when only goToFile is enabled', () => {
    const result = computeContextKeys({
      ...allEnabled,
      rectangleSelectionEnabled: false,
      goToFileEnabled: true,
      saveEnabled: false,
    });

    expect(result[CTX.CTRL_X_PREFIX_AVAILABLE]).toBe(true);
  });

  it('ctrlXPrefixAvailable is true when only rectangleSelection is enabled', () => {
    const result = computeContextKeys({
      ...allEnabled,
      rectangleSelectionEnabled: true,
      goToFileEnabled: false,
      saveEnabled: false,
    });

    expect(result[CTX.CTRL_X_PREFIX_AVAILABLE]).toBe(true);
  });

  it('ctrlXPrefixAvailable is true when only save is enabled', () => {
    const result = computeContextKeys({
      ...allEnabled,
      rectangleSelectionEnabled: false,
      goToFileEnabled: false,
      saveEnabled: true,
    });

    expect(result[CTX.CTRL_X_PREFIX_AVAILABLE]).toBe(true);
  });

  it('ctrlXPrefixAvailable is false when all three sub-features are disabled', () => {
    const result = computeContextKeys({
      ...allEnabled,
      rectangleSelectionEnabled: false,
      goToFileEnabled: false,
      saveEnabled: false,
    });

    expect(result[CTX.CTRL_X_PREFIX_AVAILABLE]).toBe(false);
  });

  it('ctrlXPrefixAvailable is false when master is off even if all three sub-features are true', () => {
    const result = computeContextKeys({
      ...allEnabled,
      enable: false,
      rectangleSelectionEnabled: true,
      goToFileEnabled: true,
      saveEnabled: true,
    });

    expect(result[CTX.CTRL_X_PREFIX_AVAILABLE]).toBe(false);
  });

  it("returned object's keys exactly match the CTX constants used for settings-derived groups", () => {
    const result = computeContextKeys(allEnabled);
    const expectedKeys = [
      CTX.ACTIVE,
      CTX.MOVEMENT_ENABLED,
      CTX.MARK_ENABLED,
      CTX.RECTANGLE_SELECTION_ENABLED,
      CTX.GO_TO_FILE_ENABLED,
      CTX.COMMAND_PALETTE_ENABLED,
      CTX.KILL_LINE_ENABLED,
      CTX.COMMENT_ENABLED,
      CTX.UNDO_REDO_ENABLED,
      CTX.INCREMENTAL_SEARCH_ENABLED,
      CTX.SAVE_ENABLED,
      CTX.CTRL_X_PREFIX_AVAILABLE,
    ].sort();

    expect(Object.keys(result).sort()).toEqual(expectedKeys);
  });
});
