/** Exact five anchored trees previously drawn by hill-front.svg.
 * Coordinate space is the existing 2900 × 650 SVG, not the viewport or render order.
 */
export const HILL_FRONT_TREES = [
  { id: 'front-215-358', x: 215, baseline: 358, formerHeight: 101 },
  { id: 'front-268-380', x: 268, baseline: 380, formerHeight: 131 },
  { id: 'front-1160-336', x: 1160, baseline: 336, formerHeight: 106 },
  { id: 'front-2010-380', x: 2010, baseline: 380, formerHeight: 131 },
  { id: 'front-2750-355', x: 2750, baseline: 355, formerHeight: 121 },
] as const;

export type HillTree = typeof HILL_FRONT_TREES[number];
export type HillTreeColor = 'green' | 'orange';

/** FNV-1a: same Level and same original tree anchor always yield same color. */
export function hillTreeColor(levelId: string, treeId: string): HillTreeColor {
  const key = `${levelId}:hill-front:${treeId}`;
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
  }
  return (hash >>> 0) % 2 === 0 ? 'green' : 'orange';
}

/** Original PNG artwork is 1024², with alpha bounds x=271–804, y=28–975.
 * Web-optimized transparent versions preserve those same relative margins.
 * CSS positions the visible trunk, not the transparent file canvas, on the
 * original SVG baseline. No new/re-randomized position is generated.
 */
export function hillTreeStyle(tree: HillTree, frameHeight: number) {
  const visibleHeightFraction = (975 - 28) / 1024;
  const transparentBottomFraction = (1024 - 975) / 1024;
  const size = (tree.formerHeight * frameHeight / 650) / visibleHeightFraction;
  return {
    left: `${(tree.x / 2900) * 100}%`,
    bottom: (650 - tree.baseline) / 650 * frameHeight - transparentBottomFraction * size,
    width: size,
    height: size,
  };
}
