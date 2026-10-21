import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type KeyboardEvent, type ReactNode, type CSSProperties } from 'react';
import type { BALocale } from '@big-academy/design-system';
import './StaircaseScene.css';

const STEP_GAP = 290;
const CARD_WIDTH = 260;
const INSET = 40;
export const ANCHOR_BASE_Y = 356; // Absolute bottom/pedestal datum, never measured from card size.
const MAX_RISE = 120;
const MIN_RISE = 48;
/** Terrace box in StaircaseScene.css, plus the 6px drop-shadow under that box. */
const PLATFORM_HEIGHT = 64;
const PLATFORM_SHADOW = 6;
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
  const maxX = Math.max(0, (count - 1) * STEP_GAP + CARD_WIDTH - viewportWidth);
  return clamp(index * STEP_GAP + CARD_WIDTH / 2 - viewportWidth / 2, 0, maxX);
}

const HILL_WIDTH = 1568;
const HILL_HEIGHT = 656;
const CLOUD_SIZE = 1024;
/** Opaque puff of cloud.png, and the first solid ridge of hill-1-foreground.png. */
const CLOUD_PUFF = { top: 310, bottom: 692, left: 120, right: 912 };
const SKY = '#58A8E8';

export function trackLength(count: number): number {
  return Math.max(0, (count - 1) * STEP_GAP + CARD_WIDTH);
}

export function cameraMaxTravel(count: number, viewportWidth: number): number {
  return Math.max(0, trackLength(count) - Math.max(0, viewportWidth));
}

/**
 * One 1568×656 tile, aspect preserved, never taller than the stage.
 * When the stage is tall enough the tile is exactly as wide as the viewport,
 * so the opening view shows the whole file, ground included.
 */
export function hillTile(viewportWidth: number, stageHeight: number): { width: number; height: number } {
  const widthLimit = Math.max(1, viewportWidth);
  const heightLimit = Math.max(1, stageHeight);
  const heightForWidth = widthLimit * (HILL_HEIGHT / HILL_WIDTH);
  const height = Math.max(1, Math.round(Math.min(heightLimit, heightForWidth)));
  const width = Math.max(1, Math.round(height * (HILL_WIDTH / HILL_HEIGHT)));
  return { width, height };
}

/** Strip width that stays covered while a layer moves `speed` across the camera's max travel. */
export function hillCoverWidth(viewportWidth: number, speed: number, maxTravel: number): number {
  return Math.max(0, viewportWidth) + Math.max(0, speed) * Math.max(0, maxTravel);
}

export type ScenicSpeeds = {
  sky: number;
  cloud: number;
  hill2: number;
  hill1: number;
  cards: number;
};

/**
 * Horizontal speeds from the node count, the track length, and camera max travel.
 * Cards stay on the camera (1). Sky is the stage color, so it stays put.
 * The viewport is the part of the track already on screen (track − camera max).
 * That on-screen share, viewport / trackLength, is below 1 and shrinks as more nodes
 * lengthen the path. Hill 1 uses it, so the layer shifts by less than one viewport
 * across the whole camera travel. Each farther layer keeps that same share of the
 * layer in front. A repeated tile covers only that shorter travel.
 */
export function scenicSpeeds(count: number, viewportWidth: number): ScenicSpeeds {
  const track = trackLength(count);
  const maxTravel = cameraMaxTravel(count, viewportWidth);
  const cards = 1;
  const sky = 0;
  if (track <= 0 || maxTravel <= 0) return { sky, cloud: 0, hill2: 0, hill1: 0, cards };
  const share = (track - maxTravel) / track;
  const hill1 = share;
  const hill2 = hill1 * share;
  const cloud = hill2 * share;
  return { sky, cloud, hill2, hill1, cards };
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
    const left = index * STEP_GAP;
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
    const left = index * STEP_GAP;
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
  const fits = (rise: number) => terracesFit(count, rise, viewportWidth, viewportHeight, cardHeights, platformExtent);
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

/**
 * The cloud square stays inside the stage. Its opaque puff ends at the hill tile's top,
 * in the sky above the ridge, and the image itself is not shifted above the stage.
 */
export function cloudPlacement(stageHeight: number, viewportWidth: number, hillTop: number): { size: number; top: number; left: number } {
  const sky = Math.max(0, Math.min(stageHeight, hillTop));
  const puffBottom = CLOUD_PUFF.bottom / CLOUD_SIZE;
  const size = puffBottom > 0 ? Math.min(stageHeight, sky / puffBottom) : 0;
  const puffCenter = (CLOUD_PUFF.left + CLOUD_PUFF.right) / 2 / CLOUD_SIZE;
  const left = viewportWidth / 2 - size * puffCenter;
  return { size, top: 0, left };
}

function speedAttr(speed: number): string {
  return String(Math.round(speed * 1e6) / 1e6);
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
  const maxX = Math.max(0, (count - 1) * STEP_GAP + CARD_WIDTH - view.width);
  const boundedX = clamp(cameraX, 0, maxX);
  // A single camera relation preserves the left-bottom to right-top diagonal as the user drags.
  const visibleIndex = (boundedX + view.width / 2 - CARD_WIDTH / 2) / STEP_GAP;
  const cameraYRaw = ANCHOR_BASE_Y + (count - 1 - visibleIndex) * rise - view.height * 0.7; // Follow anchor line, not card center.
  const railHeight = Math.max(460, pedestalAnchorY(0, count, rise) + 120);
  const cameraY = framedCameraY(
    cameraYRaw,
    cameraYBounds(count, rise, boundedX, view.width, view.height, cardHeights),
    Math.max(0, railHeight - view.height),
  );
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
    const centered = (cameraXRef.current + width / 2 - CARD_WIDTH / 2) / STEP_GAP;
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
    const centered = Math.round((cameraXRef.current + view.width / 2 - CARD_WIDTH / 2) / STEP_GAP);
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
    transform: 'translate3d(' + (-boundedX) + 'px, ' + (-cameraY) + 'px, 0)',
  } as CSSProperties;
  const tile = hillTile(view.width, view.height);
  const speeds = scenicSpeeds(count, view.width);
  const cloudBox = cloudPlacement(view.height, view.width, Math.max(0, view.height - tile.height));
  const hillBox = (speed: number, src: string): CSSProperties => ({
    width: hillCoverWidth(view.width, speed, maxX),
    height: tile.height,
    left: -speed * boundedX,
    bottom: 0,
    backgroundImage: `url("${src}")`,
    backgroundRepeat: 'repeat-x',
    backgroundSize: `${tile.width}px ${tile.height}px`,
    backgroundPosition: 'left bottom',
  });
  const cloudStyle: CSSProperties = {
    width: cloudBox.size,
    height: cloudBox.size,
    top: cloudBox.top,
    left: cloudBox.left - speeds.cloud * boundedX,
  };

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
      role="region"
      tabIndex={0}
      aria-label={locale === 'zh' ? '斜向课程阶梯：方向键浏览，Home 和 End 前往两端' : 'Diagonal lesson staircase: arrow keys navigate; Home and End reach the ends'}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      onKeyDown={keyDown}
    >
      <div className="path-sky" data-testid="path-sky" data-parallax={speedAttr(speeds.sky)} aria-hidden="true" />
      <div className="path-layer path-cloud" data-testid="path-cloud" data-parallax={speedAttr(speeds.cloud)} style={cloudStyle} aria-hidden="true">
        <img src="/path/v2-terraces/cloud.png" alt="" width={1024} height={1024} />
      </div>
      <div className="path-layer path-hill path-hill-2" data-testid="path-hill-2" data-parallax={speedAttr(speeds.hill2)} style={hillBox(speeds.hill2, '/path/v2-terraces/hill-2-mid.png')} aria-hidden="true" />
      <div className="path-layer path-hill path-hill-1" data-testid="path-hill-1" data-parallax={speedAttr(speeds.hill1)} style={hillBox(speeds.hill1, '/path/v2-terraces/hill-1-foreground.png')} aria-hidden="true" />
      <div className="staircase-rail" data-parallax="1" style={style}>
        {children}
      </div>
    </div>
  );
}
