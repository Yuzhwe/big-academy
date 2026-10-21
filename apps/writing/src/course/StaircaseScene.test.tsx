import { describe, expect, it } from 'vitest';
import { cameraForStep, cameraMaxTravel, cameraYBounds, framedCameraY, hillCoverWidth, hillTile, pedestalAnchorY, riseThatFits, scenicSpeeds, stepRise, terracesFit, trackLength } from './StaircaseScene';

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
  it('fits one hill tile inside the stage and keeps the 1568×656 aspect', () => {
    const tile = hillTile(1440, 800);
    expect(tile.height).toBeLessThanOrEqual(800);
    expect(tile.height).toBeLessThan(800);
    expect(tile.width).toBeLessThanOrEqual(1440 + 1);
    expect(Math.abs(tile.width / tile.height - 1568 / 656)).toBeLessThan(0.02);
    const short = hillTile(1440, 400);
    expect(short.height).toBeLessThanOrEqual(400);
    expect(short.width).toBeLessThan(1440);
  });
  it('computes scenic speeds from the track, slower than the cards, farther layers slower', () => {
    const count = 48;
    const viewport = 1440;
    const speeds = scenicSpeeds(count, viewport);
    const maxTravel = cameraMaxTravel(count, viewport);
    const track = trackLength(count);
    expect(track).toBe((count - 1) * 290 + 260);
    expect(maxTravel).toBe(track - viewport);
    const share = (track - maxTravel) / track;
    expect(speeds.cards).toBe(1);
    expect(speeds.sky).toBe(0);
    expect(speeds.hill1).toBeCloseTo(share);
    expect(speeds.hill2).toBeCloseTo(speeds.hill1 * share);
    expect(speeds.cloud).toBeCloseTo(speeds.hill2 * share);
    expect(speeds.hill1).toBeGreaterThan(speeds.hill2);
    expect(speeds.hill2).toBeGreaterThan(speeds.cloud);
    expect(speeds.cloud).toBeGreaterThan(speeds.sky);
    expect(speeds.hill1).toBeLessThan(speeds.cards);
    expect(speeds.hill1 * maxTravel).toBeLessThan(viewport);
    const cover = hillCoverWidth(viewport, speeds.hill1, maxTravel);
    expect(cover - speeds.hill1 * maxTravel).toBeCloseTo(viewport);
  });
  it('stops scenic travel when the camera has no room to move', () => {
    const speeds = scenicSpeeds(2, 2000);
    expect(cameraMaxTravel(2, 2000)).toBe(0);
    expect(speeds.hill1).toBe(0);
    expect(speeds.hill2).toBe(0);
    expect(speeds.cloud).toBe(0);
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
  it('keeps the viewport rise when terraces fit, and steps down when a short stage cannot', () => {
    const count = 48;
    const heights = Array(count).fill(100);
    const desktop = stepRise(1440, 818);
    expect(terracesFit(count, desktop, 1440, 818, heights)).toBe(true);
    expect(riseThatFits(count, 1440, 818, heights, desktop)).toBe(desktop);
    const short = stepRise(1024, 686);
    const tall = Array(count).fill(304);
    expect(terracesFit(count, short, 1024, 686, tall)).toBe(false);
    const fitted = riseThatFits(count, 1024, 686, tall, short);
    expect(fitted).toBeLessThan(short);
    expect(fitted).toBeGreaterThanOrEqual(48);
    expect(terracesFit(count, fitted, 1024, 686, tall)).toBe(true);
  });
  it('positions first and last steps within pan limits', () => {
    expect(cameraForStep(0, 1024, 20)).toBe(0);
    expect(cameraForStep(19, 1024, 20)).toBeGreaterThan(0);
    expect(cameraForStep(19, 1024, 20)).toBeLessThanOrEqual(19 * 290 + 260 - 1024);
  });
});
