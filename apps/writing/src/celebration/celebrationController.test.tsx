import { afterEach, describe, expect, it, vi } from 'vitest';
import { CelebrationController } from './celebrationController';
import { PREVIEW_DURATION_MS } from './presets';

afterEach(() => { vi.useRealTimers(); });
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

describe('presentation lifecycle', () => {
  it('destroys a late result after Stop without reporting playing', async () => {
    const pending = deferred<{ destroy: () => void }>();
    const publish = vi.fn();
    const destroy = vi.fn();
    const controller = new CelebrationController(publish, () => pending.promise, () => false);
    const play = controller.play('ribbons');
    controller.stop();
    pending.resolve({ destroy });
    await play;
    expect(destroy).toHaveBeenCalledOnce();
    expect(publish).not.toHaveBeenCalledWith('playing');
    expect(publish).toHaveBeenLastCalledWith('stopped');
  });

  it('keeps only the latest async selection alive', async () => {
    const old = deferred<{ destroy: () => void }>();
    const oldDestroy = vi.fn();
    const newDestroy = vi.fn();
    const load = vi.fn().mockImplementationOnce(() => old.promise).mockResolvedValueOnce({ destroy: newDestroy });
    const controller = new CelebrationController(vi.fn(), load, () => false);
    const first = controller.play('fireworks');
    await controller.play('ribbons');
    old.resolve({ destroy: oldDestroy });
    await first;
    expect(oldDestroy).toHaveBeenCalledOnce();
    expect(newDestroy).not.toHaveBeenCalled();
    expect(load.mock.calls[0][1]).not.toBe(load.mock.calls[1][1]);
    controller.dispose();
    expect(newDestroy).toHaveBeenCalledOnce();
  });

  it('does not publish after unmount and destroys the pending canvas', async () => {
    const pending = deferred<{ destroy: () => void }>();
    const publish = vi.fn();
    const destroy = vi.fn();
    const controller = new CelebrationController(publish, () => pending.promise, () => false);
    const play = controller.play('confetti');
    controller.dispose();
    publish.mockClear();
    pending.resolve({ destroy });
    await play;
    await controller.play('party');
    expect(destroy).toHaveBeenCalledOnce();
    expect(publish).not.toHaveBeenCalled();
  });

  it('skips loading under reduced motion and rechecks it after async loading', async () => {
    const publish = vi.fn();
    const destroy = vi.fn();
    const pending = deferred<{ destroy: () => void }>();
    let reduced = true;
    const load = vi.fn(() => pending.promise);
    const controller = new CelebrationController(publish, load, () => reduced);
    await controller.play('fire');
    expect(load).not.toHaveBeenCalled();
    expect(publish).toHaveBeenLastCalledWith('reduced');
    reduced = false;
    const play = controller.play('fire');
    reduced = true;
    pending.resolve({ destroy });
    await play;
    expect(destroy).toHaveBeenCalledOnce();
    expect(publish).toHaveBeenLastCalledWith('reduced');
  });

  it('stops continuous effects at the preview limit', async () => {
    vi.useFakeTimers();
    const destroy = vi.fn();
    const publish = vi.fn();
    const controller = new CelebrationController(publish, async () => ({ destroy }), () => false);
    await controller.play('firefly');
    vi.advanceTimersByTime(PREVIEW_DURATION_MS);
    expect(destroy).toHaveBeenCalledOnce();
    expect(publish).toHaveBeenLastCalledWith('stopped');
    controller.dispose();
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('supports retry after a failed load and ignores obsolete errors', async () => {
    const old = deferred<{ destroy: () => void }>();
    const destroy = vi.fn();
    const publish = vi.fn();
    const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockImplementationOnce(() => old.promise).mockResolvedValueOnce({ destroy });
    const controller = new CelebrationController(publish, load, () => false);
    await controller.play('fireworks');
    expect(publish).toHaveBeenLastCalledWith('error');
    const retry = controller.play('fireworks');
    await controller.play('ribbons');
    old.reject(new Error('obsolete failure'));
    await retry;
    expect(publish).toHaveBeenLastCalledWith('playing');
    controller.dispose();
  });
});
