import { CTX } from './contextKeys';

export interface LightEmacsConfig {
  enable: boolean;
  movementEnabled: boolean;
  markEnabled: boolean;
  rectangleSelectionEnabled: boolean;
  goToFileEnabled: boolean;
  commandPaletteEnabled: boolean;
  killLineEnabled: boolean;
  deleteCharEnabled: boolean;
  commentEnabled: boolean;
  undoRedoEnabled: boolean;
  incrementalSearchEnabled: boolean;
  saveEnabled: boolean;
}

export type ContextKeyValues = Record<string, boolean>;

/** Pure: settings -> the exact set of context-key values the `when` clauses need. */
export function computeContextKeys(config: LightEmacsConfig): ContextKeyValues {
  const active = config.enable;
  const movement = active && config.movementEnabled;
  const mark = active && config.markEnabled;
  const rectangleSelection = active && config.rectangleSelectionEnabled;
  const goToFile = active && config.goToFileEnabled;
  const commandPalette = active && config.commandPaletteEnabled;
  const killLine = active && config.killLineEnabled;
  const deleteChar = active && config.deleteCharEnabled;
  const comment = active && config.commentEnabled;
  const undoRedo = active && config.undoRedoEnabled;
  const incrementalSearch = active && config.incrementalSearchEnabled;
  const save = active && config.saveEnabled;

  return {
    [CTX.ACTIVE]: active,
    [CTX.MOVEMENT_ENABLED]: movement,
    [CTX.MARK_ENABLED]: mark,
    [CTX.RECTANGLE_SELECTION_ENABLED]: rectangleSelection,
    [CTX.GO_TO_FILE_ENABLED]: goToFile,
    [CTX.COMMAND_PALETTE_ENABLED]: commandPalette,
    [CTX.KILL_LINE_ENABLED]: killLine,
    [CTX.DELETE_CHAR_ENABLED]: deleteChar,
    [CTX.COMMENT_ENABLED]: comment,
    [CTX.UNDO_REDO_ENABLED]: undoRedo,
    [CTX.INCREMENTAL_SEARCH_ENABLED]: incrementalSearch,
    [CTX.SAVE_ENABLED]: save,
    [CTX.CTRL_X_PREFIX_AVAILABLE]: active && (rectangleSelection || goToFile || save),
  };
}
