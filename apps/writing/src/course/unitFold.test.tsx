import { describe, expect, it } from 'vitest';
import { unitFoldPaths } from './unitFold';

describe('unit folded sheet', () => {
  it('keeps the seam on the F×F diagonal and rounds the flap instead of chamfering it', () => {
    const { under, edge, flap } = unitFoldPaths(32, 16, 4, 4);
    expect(under.startsWith('M 0 0')).toBe(true);
    expect(under).toContain('L 32 32');
    expect(under.endsWith('Z')).toBe(true);
    expect(edge.startsWith('M 0 0')).toBe(true);
    expect(edge.endsWith('L 32 32')).toBe(true);
    expect(flap.startsWith('M ')).toBe(true);
    expect(flap).toContain('A ');
    expect(flap.includes('L 0 32')).toBe(false);
  });
});