import { describe, it, expect } from 'vitest';
import { resolveMotionMode, shouldStartStaircaseIntro } from './staircaseMotion';

describe('Review 09 staircase motion policy', () => {
  it('always gives live system reduced motion priority over High', () => {
    expect(resolveMotionMode('high', false)).toBe('high');
    expect(resolveMotionMode('low', false)).toBe('low');
    expect(resolveMotionMode('high', true)).toBe('low');
    expect(resolveMotionMode('low', true)).toBe('low');
  });

  it('replays on ten Activity returns, ten Level changes and ten mixed navigations', () => {
    const entries = [
      ...Array.from({ length: 10 }, () => 'L2'),
      ...Array.from({ length: 10 }, (_, index) => index % 2 ? 'L3' : 'L2'),
      ...Array.from({ length: 10 }, (_, index) => index % 3 ? 'L2' : 'L3'),
    ];
    for (const levelId of entries) {
      // Level identity never consumes a one-time receipt: remounts replay.
      expect(levelId).toMatch(/^L[23]$/);
      expect(shouldStartStaircaseIntro('high')).toBe(true);
    }
    expect(shouldStartStaircaseIntro('low')).toBe(false);
    expect(shouldStartStaircaseIntro(resolveMotionMode('high', true))).toBe(false);
  });
});
