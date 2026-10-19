import { describe, expect, it } from 'vitest';
import { cameraForStep, stepRise } from './StaircaseScene';

describe('E-01 diagonal scene shared A/B geometry', () => {
  it('derives viewport-sensitive rise without hard-coding a 15 degree slope', () => {
    const desktop = stepRise(1366, 700);
    const narrow = stepRise(834, 700);
    expect(desktop).toBeGreaterThanOrEqual(48);
    expect(desktop).toBeLessThanOrEqual(120);
    expect(narrow).toBeGreaterThanOrEqual(desktop);
    expect(stepRise(1366, 420)).toBeGreaterThanOrEqual(48);
  });
  it('positions first and last steps within pan limits', () => {
    expect(cameraForStep(0, 1024, 20)).toBe(0);
    expect(cameraForStep(19, 1024, 20)).toBeGreaterThan(0);
    expect(cameraForStep(19, 1024, 20)).toBeLessThanOrEqual(19 * 290 + 260 - 1024);
  });
});
