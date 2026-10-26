import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type KeyboardEvent, type ReactNode, type CSSProperties } from 'react';
import type { BALocale } from '@big-academy/design-system';
import './StaircaseScene.css';
import hillMid from '../assets/r2.12/hill-mid.svg';
import hillFront from '../assets/r2.12/hill-front.svg';
import { BAButton, BAIcon } from '@big-academy/design-system';
import { CloudShaderSky } from './CloudShaderSky';

const STEP_GAP = 290;
const CARD_WIDTH = 260;
const INSET = 40;
export const ANCHOR_BASE_Y = 356; // Absolute bottom/pedestal datum, never measured from card size.
const MAX_RISE = 120;
const MIN_RISE = 48;
/** Terrace box in StaircaseScene.css, plus the 6px drop-shadow under that box. */
const PLATFORM_HEIGHT = 45;
const PLATFORM_SHADOW = 8;
export const PLATFORM_EXTENT = PLATFORM_HEIGHT + PLATFORM_SHADOW;

function clamp(value: number, lower: number, upper: number) {
  return Math.min(upper, Math.max(lower, value));
}

/**
 * Staircase geometry for the v2-terraces path.
 * Rise comes from the viewport. 15 degrees is not hardcoded.
 */
export function stepRise(viewWidth: number, viewHeight: number): number {
  const clearance = clamp(viewHeight * 0.4, 220, 280);
  const spanX = Math.max(viewWidth - 2 * INSET, STEP_GAP);
  return Math.round(clamp((Math.max(0, viewHeight - clearance) * STEP_GAP) / spanX, MIN_RISE, MAX_RISE));
}

/** Identical platform/anchor baseline for A and B, independent of card dimensions. */
export function pedestalAnchorY(index: number, count: number, rise: number): number {
  return ANCHOR_BASE_Y + (count - 1 - index) * rise;
}

export function cameraForStep(index: number, viewportWidth: number, count: number): number {
  const maxX = Math.max(0, (count - 1) * STEP_GAP + CARD_WIDTH + 2 * INSET - viewportWidth);
  return clamp(INSET + index * STEP_GAP + CARD_WIDTH / 2 - viewportWidth / 2, 0, maxX);
}

const HILL_WIDTH = 1568;
const HILL_HEIGHT = 656;
const CLOUD_SIZE = 1024;
/** Opaque puff of cloud.png. */
const CLOUD_PUFF = { top: 310, bottom: 692, left: 120, right: 912 };
/** First mostly-opaque row of hill-1-foreground.png. The puff sits above this ridge. */
const HILL1_RIDGE_Y = 379;
const SKY = 'linear-gradient(135deg, #85DBF9 0%, #F8F4ED 100%)';

export function trackLength(count: number): number {
  return Math.max(0, (count - 1) * STEP_GAP + CARD_WIDTH + 2 * INSET);
}

export function cameraMaxTravel(count: number, viewportWidth: number): number {
  return Math.max(0, trackLength(count) - Math.max(0, viewportWidth));
}

/**
 * One shared 1568×656 frame for both hills. Aspect preserved, ground on the stage
 * bottom, height limited to the stage so the file is not sliced vertically.
 * The frame is wider than a normal viewport, which is what the slower parallax travels across.
 */
export function sharedHillFrame(stageHeight: number): { width: number; height: number } {
  const height = Math.max(1, Math.round(stageHeight));
  const width = Math.max(1, Math.round(height * (HILL_WIDTH / HILL_HEIGHT)));
  return { width, height };
}

export type ParallaxInputs = {
  nodeCount: number;
  trackLength: number;
  cameraMaxTravel: number;
};

/** The quantities DESIGN.md names for scenic speed. Coefficients are not in that text. */
export function parallaxInputs(count: number, viewportWidth: number): ParallaxInputs {
  return {
    nodeCount: count,
    trackLength: trackLength(count),
    cameraMaxTravel: cameraMaxTravel(count, viewportWidth),
  };
}

export type ScenicSpeeds = {
  sky: number;
  cloud: number;
  hill2: number;
  hill1: number;
  cards: number;
};

/**
 * Speeds from the node count, track length, and camera max travel.
 * Hill 1 moves at the speed that carries one shared frame across the camera travel,
 * and never as fast as the cards. Each farther layer keeps the on-screen share of
 * the track (viewport / track length) of the layer in front. Sky stays put.
 */
export function scenicSpeeds(inputs: ParallaxInputs, frameWidth: number): ScenicSpeeds {
  const { trackLength: track, cameraMaxTravel: maxTravel } = inputs;
  const cards = 1;
  const sky = 0;
  if (track <= 0 || maxTravel <= 0) return { sky, cloud: 0, hill2: 0, hill1: 0, cards };
  const viewport = track - maxTravel;
  const onScreen = viewport / track;
  const cover = Math.max(0, frameWidth - viewport) / maxTravel;
  const hill1 = Math.min(cover, onScreen);
  const hill2 = hill1 * onScreen;
  const cloud = hill2 * onScreen;
  return { sky, cloud, hill2, hill1, cards };
}

function speedAttr(speed: number): string {
  return String(Math.round(speed * 1e6) / 1e6);
}

export type CameraYBounds = { min: number; max: number };

/** Vertical camera window that keeps visible card tops and terrace bottoms inside the stage. */
export function cameraYBounds(
  count: number,
  rise: number,
  cameraX: number,
  viewportWidth: number,
  viewportHeight: number,
  cardHeights: readonly number[],
  platformExtent = PLATFORM_EXTENT,
): CameraYBounds {
  let min = 0;
  let max = Number.POSITIVE_INFINITY;
  for (let index = 0; index < count; index += 1) {
    const left = INSET + index * STEP_GAP;
    const right = left + CARD_WIDTH;
    if (right <= cameraX || left >= cameraX + viewportWidth) continue;
    const pedestal = pedestalAnchorY(index, count, rise);
    const height = cardHeights[index] ?? 0;
    min = Math.max(min, pedestal + platformExtent - viewportHeight);
    max = Math.min(max, pedestal - height);
  }
  return { min, max };
}

/** True when some camera Y keeps every horizontally visible card and terrace inside the stage. */
export function terracesFit(
  count: number,
  rise: number,
  viewportWidth: number,
  viewportHeight: number,
  cardHeights: readonly number[],
  platformExtent = PLATFORM_EXTENT,
): boolean {
  const maxX = cameraMaxTravel(count, viewportWidth);
  const events = new Set<number>([0, maxX]);
  for (let index = 0; index < count; index += 1) {
    const left = INSET + index * STEP_GAP;
    const enter = left - viewportWidth;
    const exit = left + CARD_WIDTH;
    if (enter > 0 && enter < maxX) events.add(enter);
    if (exit > 0 && exit < maxX) events.add(exit);
  }
  const points = [...events].sort((a, b) => a - b);
  for (let index = 0; index < points.length; index += 1) {
    const cameraX = index + 1 < points.length ? (points[index] + points[index + 1]) / 2 : points[index];
    const bounds = cameraYBounds(count, rise, cameraX, viewportWidth, viewportHeight, cardHeights, platformExtent);
    if (bounds.min > bounds.max) return false;
  }
  return true;
}

/**
 * Prefer the viewport rise. When visible cards and terraces cannot fit,
 * step down inside the existing 48–120 clamp until they can.
 */
export function riseThatFits(
  count: number,
  viewportWidth: number,
  viewportHeight: number,
  cardHeights: readonly number[],
  preferredRise: number,
  platformExtent = PLATFORM_EXTENT,
): number {
  if (cardHeights.length < count || count === 0) return preferredRise;
  const fits = (rise: number) =>
    diagonalFraming(count, rise, viewportWidth, viewportHeight, cardHeights, platformExtent) != null;
  if (fits(preferredRise)) return preferredRise;
  let lo = MIN_RISE;
  let hi = Math.max(MIN_RISE, Math.round(preferredRise));
  if (!fits(lo)) return MIN_RISE;
  while (lo + 1 < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Keep the diagonal follow, then clamp it into the bounds the terraces actually occupy. */
export function framedCameraY(raw: number, bounds: CameraYBounds, railLimit: number): number {
  const cap = Math.max(0, railLimit);
  if (!Number.isFinite(bounds.max)) return clamp(raw, 0, cap);
  if (bounds.min <= bounds.max) return clamp(raw, Math.max(0, bounds.min), Math.min(cap, bounds.max));
  return clamp((bounds.min + bounds.max) / 2, 0, cap);
}

/** Camera Y for a continuous lower-left → upper-right slide. One rise per horizontal step. */
export function diagonalCameraY(cameraX: number, yAtZero: number, rise: number): number {
  return yAtZero - (rise / STEP_GAP) * cameraX;
}

/** The resting diagonal at camera X = 0. Same follow line the drag used before the per-card clamp. */
export function preferredDiagonalY0(count: number, rise: number, viewportWidth: number, viewportHeight: number): number {
  const visibleAtZero = (viewportWidth / 2 - CARD_WIDTH / 2 - INSET) / STEP_GAP;
  return ANCHOR_BASE_Y + (count - 1 - visibleAtZero) * rise - viewportHeight * 0.7;
}

/**
 * One intercept whose slope stays -rise/step for the whole pan.
 * Null when that straight line cannot keep the visible terraces inside the stage.
 */
export function diagonalFraming(
  count: number,
  rise: number,
  viewportWidth: number,
  viewportHeight: number,
  cardHeights: readonly number[],
  platformExtent = PLATFORM_EXTENT,
): number | null {
  if (count === 0 || cardHeights.length < count) return null;
  const slope = rise / STEP_GAP;
  const maxX = cameraMaxTravel(count, viewportWidth);
  const events = new Set<number>([0, maxX]);
  for (let index = 0; index < count; index += 1) {
    const left = INSET + index * STEP_GAP;
    const enter = left - viewportWidth;
    const exit = left + CARD_WIDTH;
    if (enter > 0 && enter < maxX) events.add(enter);
    if (exit > 0 && exit < maxX) events.add(exit);
  }
  const points = [...events].sort((a, b) => a - b);
  const samples: number[] = [];
  for (let index = 0; index < points.length; index += 1) {
    samples.push(points[index]);
    if (index + 1 < points.length) samples.push((points[index] + points[index + 1]) / 2);
  }
  let lo = Number.NEGATIVE_INFINITY;
  let hi = Number.POSITIVE_INFINITY;
  for (const cameraX of samples) {
    const bounds = cameraYBounds(count, rise, cameraX, viewportWidth, viewportHeight, cardHeights, platformExtent);
    if (!(bounds.min <= bounds.max)) return null;
    lo = Math.max(lo, bounds.min + slope * cameraX);
    hi = Math.min(hi, bounds.max + slope * cameraX);
  }
  if (lo > hi + 0.5) return null;
  return clamp(preferredDiagonalY0(count, rise, viewportWidth, viewportHeight), Math.min(lo, hi), Math.max(lo, hi));
}

/**
 * The cloud square stays inside the stage. Its opaque puff ends at the hill-1 ridge,
 * in the sky above the treetops, and the image itself is not shifted above the stage.
 */
export function cloudPlacement(
  stageHeight: number,
  viewportWidth: number,
  frameTop: number,
  frameHeight: number,
): { size: number; top: number; left: number } {
  const ridge = frameTop + frameHeight * (HILL1_RIDGE_Y / HILL_HEIGHT);
  const puffBottom = CLOUD_PUFF.bottom / CLOUD_SIZE;
  const size = puffBottom > 0 ? Math.min(stageHeight, Math.max(0, ridge) / puffBottom) : 0;
  const puffCenter = (CLOUD_PUFF.left + CLOUD_PUFF.right) / 2 / CLOUD_SIZE;
  const left = viewportWidth / 2 - size * puffCenter;
  return { size, top: 0, left };
}

/** v2-terraces stage. The product supplies nodes and every navigation gate. */
export function StaircaseScene({
  children,
  count,
  focusIndex,
  locale,
}: {
  children: ReactNode;
  count: number;
  focusIndex: number;
  locale: BALocale;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; camera: number; active: boolean } | null>(null);
  const [view, setView] = useState({ width: 1024, height: 600 });
  const [cameraX, setCameraX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [cardHeights, setCardHeights] = useState<number[]>([]);
  const preferredRise = stepRise(view.width, view.height);
  const rise = riseThatFits(count, view.width, view.height, cardHeights, preferredRise);
  const slope = rise / STEP_GAP;
  const maxX = Math.max(0, trackLength(count) - view.width);
  const boundedX = clamp(cameraX, 0, maxX);
  // One slope for the whole pan: camera Y tracks camera X. It does not step when a card enters.
  const railHeight = Math.max(460, pedestalAnchorY(0, count, rise) + 120);
  const yAtZero =
    diagonalFraming(count, rise, view.width, view.height, cardHeights) ??
    preferredDiagonalY0(count, rise, view.width, view.height);
  const cameraY = diagonalCameraY(boundedX, yAtZero, rise);
  const cameraXRef = useRef(boundedX);
  cameraXRef.current = boundedX;
  const metricsRef = useRef({ width: view.width, maxX, slope, count });
  metricsRef.current = { width: view.width, maxX, slope, count };

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setView({ width: el.clientWidth || 1024, height: el.clientHeight || 600 });
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useLayoutEffect(() => {
    const nodes = viewportRef.current?.querySelector('.course-nodes');
    if (!nodes) return;
    const heights = [...nodes.children].map((node) => Math.round((node as HTMLElement).offsetHeight));
    setCardHeights((prev) => (prev.length === heights.length && prev.every((height, index) => height === heights[index]) ? prev : heights));
  }, [count, locale, view.width, view.height]);

  useEffect(() => {
    setCameraX(cameraForStep(focusIndex, view.width, count));
  }, [focusIndex, count, view.width]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      // Scrolling on a focused action does not bypass the product's permission logic.
      event.preventDefault();
      setCameraX((prev) => clamp(prev + event.deltaY + event.deltaX, 0, metricsRef.current.maxX));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const snap = () => {
    const { width, count: total } = metricsRef.current;
    const centered = (cameraXRef.current + width / 2 - CARD_WIDTH / 2 - INSET) / STEP_GAP;
    setCameraX(cameraForStep(clamp(Math.round(centered), 0, total - 1), width, total));
  };

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button, a, input, textarea, select, [contenteditable]')) return;
    gesture.current = { x: event.clientX, y: event.clientY, camera: cameraXRef.current, active: true };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g?.active) return;
    const dx = event.clientX - g.x;
    const dy = event.clientY - g.y;
    const incline = metricsRef.current.slope;
    const projected = (dx - dy * incline) / (1 + incline * incline);
    setCameraX(clamp(g.camera - projected, 0, metricsRef.current.maxX));
  };

  const pointerUp = () => {
    if (!gesture.current) return;
    gesture.current = null;
    setDragging(false);
    snap();
  };

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    let target: number | null = null;
    const centered = Math.round((cameraXRef.current + view.width / 2 - CARD_WIDTH / 2 - INSET) / STEP_GAP);
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') target = centered + 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') target = centered - 1;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = count - 1;
    if (target === null) return;
    event.preventDefault();
    setCameraX(cameraForStep(clamp(target, 0, count - 1), view.width, count));
  };

  const style = {
    '--step-count': count,
    '--step-rise': String(rise) + 'px',
    '--anchor-base-y': String(ANCHOR_BASE_Y) + 'px',
    '--rail-height': String(railHeight) + 'px',
    '--path-edge': INSET + 'px',
    transform: 'translate3d(' + (-boundedX) + 'px, ' + (-cameraY) + 'px, 0)',
  } as CSSProperties;
  const frame = sharedHillFrame(view.height);
  const scenic = scenicSpeeds(parallaxInputs(count, view.width), frame.width);
  const hillLayer = (layer: 'hill1' | 'hill2'): CSSProperties => ({
    width: frame.width,
    height: frame.height,
    left: -scenic[layer] * boundedX,
    bottom: 0,
  });

  return (
    <div
      ref={viewportRef}
      className="staircase-viewport"
      data-landscape="v2-terraces"
      data-camera-x={Math.round(boundedX)}
      data-camera-y={Math.round(cameraY)}
      data-rise-px={rise}
      data-anchor-basis="pedestal-y"
      data-dragging={dragging ? 'true' : 'false'}
      data-sky={SKY}
      data-track-length={trackLength(count)}
      data-camera-max={Math.round(maxX)}
      data-parallax-state="applied"
      data-camera-motion="diagonal"
      role="region"
      tabIndex={0}
      aria-label={locale === 'zh' ? '斜向课程阶梯：方向键浏览，Home 和 End 前往两端' : 'Diagonal lesson staircase: arrow keys navigate; Home and End reach the ends'}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      onKeyDown={keyDown}
    >
      <div className="path-sky" data-testid="path-sky" data-parallax={speedAttr(scenic.sky)} aria-hidden="true" />
      <CloudShaderSky mode="auto" preset="staircase" cameraX={boundedX}
        cameraY={cameraY} cameraMaxTravel={maxX} parallaxStrength={scenic.cloud} />
      <div className="path-layer path-hill path-hill-2" data-testid="path-hill-2" data-parallax={speedAttr(scenic.hill2)} style={hillLayer('hill2')} aria-hidden="true">
        <img src={hillMid} alt="" width={HILL_WIDTH} height={HILL_HEIGHT} />
      </div>
      <div className="path-layer path-hill path-hill-1" data-testid="path-hill-1" data-parallax={speedAttr(scenic.hill1)} style={hillLayer('hill1')} aria-hidden="true">
        <img src={hillFront} alt="" width={HILL_WIDTH} height={HILL_HEIGHT} />
      </div>
      <div className="r2-sun" aria-hidden="true" />
      <div className="staircase-rail" data-parallax="1" style={style}>
        {children}
      </div>
      <nav className="path-controls" aria-label={locale === 'zh' ? '浏览学习路径' : 'Browse learning path'}>
        <BAButton iconOnly size={50} variant="secondary" disabled={boundedX <= 0} aria-label={locale === 'zh' ? '上一个台阶' : 'Previous step'} onPress={() => setCameraX(Math.max(0, boundedX - STEP_GAP))}><BAIcon name="arrow-left" /></BAButton>
        <BAButton iconOnly size={50} variant="secondary" disabled={boundedX >= maxX} aria-label={locale === 'zh' ? '下一个台阶' : 'Next step'} onPress={() => setCameraX(Math.min(maxX, boundedX + STEP_GAP))}><BAIcon name="arrow-left" style={{ transform: 'rotate(180deg)' }} /></BAButton>
      </nav>
    </div>
  );
}
