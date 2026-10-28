import { describe, expect, it } from 'vitest';
import { HILL_FRONT_TREES, hillTreeColor, hillTreeStyle } from './staircaseTrees';

describe('Review 06 original-coordinate PNG tree substitution', () => {
  it('preserves exactly the five distinct tree anchors from hill-front.svg', () => {
    expect(HILL_FRONT_TREES).toHaveLength(5);
    expect(HILL_FRONT_TREES.map(tree => [tree.x, tree.baseline])).toEqual([
      [215, 358], [268, 380], [1160, 336], [2010, 380], [2750, 355],
    ]);
    expect(new Set(HILL_FRONT_TREES.map(tree => tree.id)).size).toBe(5);
  });

  it('is a deterministic mixed-color mapping for every Level after remount', () => {
    for (const level of ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6']) {
      const original = HILL_FRONT_TREES.map(tree => hillTreeColor(level, tree.id));
      expect(new Set(original)).toEqual(new Set(['green', 'orange']));
      for (let i = 0; i < 10; i++) {
        expect(HILL_FRONT_TREES.map(tree => hillTreeColor(level, tree.id))).toEqual(original);
      }
    }
  });

  it('uses former visual height and the same ground anchor at any hill size', () => {
    for (const height of [450, 600, 900]) {
      for (const tree of HILL_FRONT_TREES) {
        const style = hillTreeStyle(tree, height);
        expect(style.width).toBe(style.height);
        expect(style.left).toBe(`${tree.x / 2900 * 100}%`);
        // Transparent bottom of the original picture is not the visible trunk.
        const visibleBottom = style.bottom + style.height * (1024 - 975) / 1024;
        expect(visibleBottom).toBeCloseTo((650 - tree.baseline) / 650 * height, 6);
        const visibleHeight = style.height * (975 - 28) / 1024;
        expect(visibleHeight).toBeCloseTo(tree.formerHeight / 650 * height, 6);
      }
    }
  });
});
