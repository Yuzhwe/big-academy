import { describe, expect, it } from 'vitest';
import { cameraForStep, hillFrame, pedestalAnchorY, scenicTravelY, stepRise } from './StaircaseScene';

describe('E-01 diagonal scene shared A/B geometry', () => {
  it('derives viewport-sensitive rise without hard-coding a 15 degree slope', () => {
    const desktop = stepRise(1366, 700);
    const narrow = stepRise(834, 700);
    expect(desktop).toBeGreaterThanOrEqual(48);
    expect(desktop).toBeLessThanOrEqual(120);
    expect(narrow).toBeGreaterThanOrEqual(desktop);
    expect(stepRise(1366, 420)).toBeGreaterThanOrEqual(48);
  });
  it('uses the same content-independent absolute anchor for both visual variants', () => {
    const rise = stepRise(834, 720);
    expect(pedestalAnchorY(0, 10, rise) - pedestalAnchorY(1, 10, rise)).toBe(rise);
    expect(pedestalAnchorY(9, 10, rise)).toBe(356);
    expect(pedestalAnchorY(0, 10, rise)).toBeGreaterThan(pedestalAnchorY(9, 10, rise));
  });
  it('clips scenic vertical travel so a large rail camera cannot throw the hills out', () => {
    expect(scenicTravelY(0.72, 3713, 3713, 665)).toBe(0);
    const hill = scenicTravelY(0.72, 0, 3713, 665);
    const cloud = scenicTravelY(0.12, 0, 3713, 665);
    expect(hill).toBeLessThan(cloud);
    expect(hill).toBeGreaterThanOrEqual(-665 * 0.22 * 0.72 - 1);
    expect(cloud).toBeGreaterThanOrEqual(-665 * 0.22 * 0.12 - 1);
  });
  it('fits the whole hill panorama across the opening stage', () => {
    for (const width of [1440, 834, 390]) {
      const frame = hillFrame(width, 700);
      expect(frame.width).toBeGreaterThanOrEqual(width);
      expect(frame.width).toBeLessThan(width * 1.2);
      expect(Math.abs(frame.height / frame.width - 656 / 1568)).toBeLessThan(0.02);
    }
  });
  it('positions first and last steps within pan limits', () => {
    expect(cameraForStep(0, 1024, 20)).toBe(0);
    expect(cameraForStep(19, 1024, 20)).toBeGreaterThan(0);
    expect(cameraForStep(19, 1024, 20)).toBeLessThanOrEqual(19 * 290 + 260 - 1024);
  });
});
