import { describe, expect, it } from 'vitest';
import { cameraForStep, cameraMaxTravel, hillFrame, pedestalAnchorY, scenicSpeeds, stepRise, trackLength } from './StaircaseScene';

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
  it('sizes the shared hill frame to the stage and keeps the 1568×656 aspect', () => {
    const frame = hillFrame(760);
    expect(frame.height).toBe(760);
    expect(Math.abs(frame.width / frame.height - 1568 / 656)).toBeLessThan(0.01);
  });
  it('computes scenic speeds from the track, slower than the cards, farther layers slower', () => {
    const count = 48;
    const viewport = 1440;
    const frame = hillFrame(760);
    const speeds = scenicSpeeds(count, viewport, frame.width);
    const maxTravel = cameraMaxTravel(count, viewport);
    expect(trackLength(count)).toBe((count - 1) * 290 + 260);
    expect(maxTravel).toBe(trackLength(count) - viewport);
    expect(speeds.cards).toBe(1);
    expect(speeds.sky).toBe(0);
    expect(speeds.hill1).toBeGreaterThan(speeds.hill2);
    expect(speeds.hill2).toBeGreaterThan(speeds.cloud);
    expect(speeds.cloud).toBeGreaterThan(speeds.sky);
    expect(speeds.hill1).toBeLessThan(speeds.cards);
    expect(speeds.hill1 * maxTravel).toBeLessThanOrEqual(frame.width - viewport + 0.001);
    expect(speeds.hill1).not.toBe(0.72);
    expect(speeds.hill2).not.toBe(0.4);
    expect(speeds.cloud).not.toBe(0.12);
  });
  it('stops scenic travel when the camera has no room to move', () => {
    const speeds = scenicSpeeds(2, 2000, 2400);
    expect(cameraMaxTravel(2, 2000)).toBe(0);
    expect(speeds.hill1).toBe(0);
    expect(speeds.hill2).toBe(0);
    expect(speeds.cloud).toBe(0);
  });
  it('positions first and last steps within pan limits', () => {
    expect(cameraForStep(0, 1024, 20)).toBe(0);
    expect(cameraForStep(19, 1024, 20)).toBeGreaterThan(0);
    expect(cameraForStep(19, 1024, 20)).toBeLessThanOrEqual(19 * 290 + 260 - 1024);
  });
});
