export const CTRL_X_PREFIX_TIMEOUT_MS = 1000;

export interface CtrlXPrefixHandlers {
  /** Mirror ctrlXPrefixActive=true into the when-clause engine. */
  onActivate: () => void;
  /** Mirror ctrlXPrefixActive=false into the when-clause engine. */
  onDeactivate: () => void;
  /** Replicate what bare Ctrl+X would natively have done (Cut). */
  onFallbackCut: () => void;
}

export interface CtrlXPrefixController {
  /** Bound to the bare `ctrl+x` keybinding. (Re)starts the timeout window. */
  activate: () => void;
  /**
   * Bound to every follow-up chord key (ctrl+f, space) AND to keyboard-quit.
   * Clears the pending timer and turns the prefix off WITHOUT falling back to
   * cut. Safe/idempotent to call when not currently active.
   */
  dismiss: () => void;
  /** Called on extension deactivate to guarantee no timer outlives the host. */
  dispose: () => void;
}

export function createCtrlXPrefixController(
  handlers: CtrlXPrefixHandlers,
  timeoutMs: number = CTRL_X_PREFIX_TIMEOUT_MS,
): CtrlXPrefixController {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function clearTimer(): void {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  function activate(): void {
    clearTimer(); // pressing ctrl+x again just restarts the window
    handlers.onActivate();
    timer = setTimeout(() => {
      timer = undefined;
      handlers.onDeactivate();
      handlers.onFallbackCut();
    }, timeoutMs);
  }

  function dismiss(): void {
    clearTimer();
    handlers.onDeactivate();
  }

  function dispose(): void {
    clearTimer();
  }

  return { activate, dismiss, dispose };
}
