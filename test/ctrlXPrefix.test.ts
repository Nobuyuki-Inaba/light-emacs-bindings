import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CTRL_X_PREFIX_TIMEOUT_MS, createCtrlXPrefixController } from '../src/ctrlXPrefix';

function makeHandlers() {
  return {
    onActivate: vi.fn(),
    onDeactivate: vi.fn(),
    onFallbackCut: vi.fn(),
  };
}

describe('createCtrlXPrefixController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onActivate synchronously', () => {
    const handlers = makeHandlers();
    const controller = createCtrlXPrefixController(handlers);

    controller.activate();

    expect(handlers.onActivate).toHaveBeenCalledTimes(1);
  });

  it('falls back to cut after the timeout when never dismissed', () => {
    const handlers = makeHandlers();
    const controller = createCtrlXPrefixController(handlers);

    controller.activate();
    vi.advanceTimersByTime(CTRL_X_PREFIX_TIMEOUT_MS);

    expect(handlers.onDeactivate).toHaveBeenCalledTimes(1);
    expect(handlers.onFallbackCut).toHaveBeenCalledTimes(1);
    const deactivateOrder = handlers.onDeactivate.mock.invocationCallOrder[0];
    const fallbackOrder = handlers.onFallbackCut.mock.invocationCallOrder[0];
    expect(deactivateOrder).toBeLessThan(fallbackOrder);
  });

  it('does not fall back to cut when dismissed before the timeout', () => {
    const handlers = makeHandlers();
    const controller = createCtrlXPrefixController(handlers);

    controller.activate();
    controller.dismiss();
    vi.advanceTimersByTime(CTRL_X_PREFIX_TIMEOUT_MS * 2);

    expect(handlers.onDeactivate).toHaveBeenCalledTimes(1);
    expect(handlers.onFallbackCut).not.toHaveBeenCalled();
  });

  it('restarts rather than stacks the timer on a second activate()', () => {
    const handlers = makeHandlers();
    const controller = createCtrlXPrefixController(handlers);

    controller.activate();
    vi.advanceTimersByTime(500);
    controller.activate();
    vi.advanceTimersByTime(CTRL_X_PREFIX_TIMEOUT_MS - 1);
    expect(handlers.onFallbackCut).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(handlers.onFallbackCut).toHaveBeenCalledTimes(1);
  });

  it('dismiss() with no prior activate() is a safe no-op', () => {
    const handlers = makeHandlers();
    const controller = createCtrlXPrefixController(handlers);

    expect(() => controller.dismiss()).not.toThrow();
    expect(handlers.onFallbackCut).not.toHaveBeenCalled();
  });

  it('dispose() clears a pending timer', () => {
    const handlers = makeHandlers();
    const controller = createCtrlXPrefixController(handlers);

    controller.activate();
    handlers.onDeactivate.mockClear();
    controller.dispose();
    vi.advanceTimersByTime(CTRL_X_PREFIX_TIMEOUT_MS * 2);

    expect(handlers.onDeactivate).not.toHaveBeenCalled();
    expect(handlers.onFallbackCut).not.toHaveBeenCalled();
  });

  it('honors a custom timeoutMs argument', () => {
    const handlers = makeHandlers();
    const controller = createCtrlXPrefixController(handlers, 200);

    controller.activate();
    vi.advanceTimersByTime(199);
    expect(handlers.onFallbackCut).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(handlers.onFallbackCut).toHaveBeenCalledTimes(1);
  });

  it('defaults to a 1000ms timeout', () => {
    expect(CTRL_X_PREFIX_TIMEOUT_MS).toBe(1000);
  });
});
