import { describe, expect, it } from 'vitest';
import { cameraForStep, cameraYBounds, diagonalCameraY, diagonalFraming, framedCameraY, parallaxInputs, pedestalAnchorY, riseThatFits, scenicSpeeds, sharedHillFrame, stepRise, terracesFit } from './StaircaseScene';

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
  it('fits one shared hill frame to the stage and keeps the 1568×656 aspect', () => {
    const frame = sharedHillFrame(800);
    expect(frame.height).toBe(800);
    expect(frame.width).toBeGreaterThan(800);
    expect(Math.abs(frame.width / frame.height - 1568 / 656)).toBeLessThan(0.02);
  });
  it('computes scenic speeds from the track, slower than the cards, farther layers slower', () => {
    const count = 48;
    const viewport = 1440;
    const inputs = parallaxInputs(count, viewport);
    const frame = sharedHillFrame(818);
    const speeds = scenicSpeeds(inputs, frame.width);
    const onScreen = viewport / inputs.trackLength;
    const cover = (frame.width - viewport) / inputs.cameraMaxTravel;
    expect(inputs.trackLength).toBe((count - 1) * 290 + 340);
    expect(inputs.cameraMaxTravel).toBe(inputs.trackLength - viewport);
    expect(speeds.cards).toBe(1);
    expect(speeds.sky).toBe(0);
    expect(speeds.hill1).toBeCloseTo(Math.min(cover, onScreen));
    expect(speeds.hill2).toBeCloseTo(speeds.hill1 * onScreen);
    expect(speeds.cloud).toBeCloseTo(speeds.hill2 * onScreen);
    expect(speeds.hill1).toBeGreaterThan(speeds.hill2);
    expect(speeds.hill2).toBeGreaterThan(speeds.cloud);
    expect(speeds.cloud).toBeGreaterThan(speeds.sky);
    expect(speeds.hill1).toBeLessThan(1);
    expect(speeds.hill1).not.toBeCloseTo(0.12);
    expect(speeds.hill2).not.toBeCloseTo(0.4);
    expect(speeds.cloud).not.toBeCloseTo(0.72);
    const revealed = speeds.hill1 * inputs.cameraMaxTravel;
    expect(frame.width - revealed).toBeGreaterThanOrEqual(viewport - 1);
  });
  it('keeps visible card tops and terrace bottoms inside the stage', () => {
    const count = 8;
    const rise = 60;
    const width = 700;
    const height = 480;
    const heights = Array(count).fill(140);
    const bounds = cameraYBounds(count, rise, 0, width, height, heights, 70);
    expect(bounds.min).toBeLessThanOrEqual(bounds.max);
    expect(bounds.min).toBeGreaterThan(0);
    const y = framedCameraY(0, bounds, 9000);
    expect(y).toBe(bounds.min);
    for (let index = 0; index < count; index += 1) {
      const left = index * 290;
      if (left + 260 <= 0 || left >= width) continue;
      const pedestal = pedestalAnchorY(index, count, rise);
      expect(pedestal + 70 - y).toBeLessThanOrEqual(height + 0.5);
      expect(pedestal - heights[index] - y).toBeGreaterThanOrEqual(-0.5);
    }
  });
  it('slides the camera along one diagonal and steps rise down until that line fits', () => {
    const count = 48;
    const heights = Array(count).fill(100);
    const desktop = stepRise(1440, 818);
    const fitted = riseThatFits(count, 1440, 818, heights, desktop);
    expect(fitted).toBeLessThanOrEqual(desktop);
    expect(fitted).toBeGreaterThanOrEqual(48);
    const y0 = diagonalFraming(count, fitted, 1440, 818, heights);
    expect(y0).not.toBeNull();
    const step = 290;
    const at = (x: number) => diagonalCameraY(x, y0 ?? 0, fitted);
    expect(at(step) - at(0)).toBeCloseTo(-fitted);
    expect(at(step / 2)).toBeCloseTo((at(0) + at(step)) / 2);
    const short = stepRise(1024, 686);
    const tall = Array(count).fill(304);
    expect(terracesFit(count, short, 1024, 686, tall)).toBe(false);
    const stepped = riseThatFits(count, 1024, 686, tall, short);
    expect(stepped).toBeLessThan(short);
    expect(stepped).toBeGreaterThanOrEqual(48);
    expect(diagonalFraming(count, stepped, 1024, 686, tall)).not.toBeNull();
    expect(terracesFit(count, stepped, 1024, 686, tall)).toBe(true);
  });
  it('positions first and last steps within pan limits', () => {
    expect(cameraForStep(0, 1024, 20)).toBe(0);
    expect(cameraForStep(19, 1024, 20)).toBeGreaterThan(0);
    expect(cameraForStep(19, 1024, 20)).toBeLessThanOrEqual(19 * 290 + 340 - 1024);
  });
});
