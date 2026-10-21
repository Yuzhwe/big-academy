import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type KeyboardEvent, type ReactNode, type CSSProperties } from 'react';
import type { BALocale } from '@big-academy/design-system';
import './StaircaseScene.css';

const STEP_GAP = 290;
const CARD_WIDTH = 260;
const INSET = 40;
export const ANCHOR_BASE_Y = 356; // Absolute bottom/pedestal datum, never measured from card size.
const MAX_RISE = 120;
const MIN_RISE = 48;

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
const HILL_RIDGE_TOP = 280;
const SKY = '#58A8E8';

export function trackLength(count: number): number {
  return Math.max(0, (count - 1) * STEP_GAP + CARD_WIDTH);
}

export function cameraMaxTravel(count: number, viewportWidth: number): number {
  return Math.max(0, trackLength(count) - Math.max(0, viewportWidth));
}

/**
 * Shared 1568×656 frame. Height is the stage, so the art is fully visible with
 * its ground on the stage bottom. Width follows that aspect. No scale multiplier.
 */
export function hillFrame(stageHeight: number): { width: number; height: number } {
  const height = Math.max(1, Math.round(stageHeight));
  const width = Math.max(1, Math.round(height * (HILL_WIDTH / HILL_HEIGHT)));
  return { width, height };
}

export type ScenicSpeeds = {
  sky: number;
  cloud: number;
  hill2: number;
  hill1: number;
  cards: number;
};

/**
 * Horizontal speeds from the node count, track length, and camera max travel.
 * Cards stay on the camera. Sky is the full-bleed stage color, so it does not travel.
 * A hill can move at most (frame width − viewport) / camera max and still cover the stage.
 * That cover speed is also capped by camera max / track length, which is below card speed.
 * Each step farther from the cards keeps that same track share: hill 1, then hill 2, then cloud.
 */
export function scenicSpeeds(count: number, viewportWidth: number, frameWidth: number): ScenicSpeeds {
  const track = trackLength(count);
  const maxTravel = cameraMaxTravel(count, viewportWidth);
  const cards = 1;
  const sky = 0;
  if (track <= 0 || maxTravel <= 0) return { sky, cloud: 0, hill2: 0, hill1: 0, cards };
  const slack = Math.max(0, frameWidth - viewportWidth);
  const cover = slack / maxTravel;
  const share = maxTravel / track;
  const hill1 = Math.min(cover, share);
  const hill2 = hill1 * share;
  const cloud = hill2 * share;
  return { sky, cloud, hill2, hill1, cards };
}

/** Place the cloud square so its opaque puff sits in the sky above the hill-1 ridge. */
export function cloudPlacement(stageHeight: number, viewportWidth: number): { size: number; top: number; left: number } {
  const ridgeY = Math.max(0, stageHeight) * (HILL_RIDGE_TOP / HILL_HEIGHT);
  const puffSpan = (CLOUD_PUFF.bottom - CLOUD_PUFF.top) / CLOUD_SIZE;
  const size = puffSpan > 0 ? ridgeY / puffSpan : 0;
  const top = ridgeY - size * (CLOUD_PUFF.bottom / CLOUD_SIZE);
  const puffCenter = (CLOUD_PUFF.left + CLOUD_PUFF.right) / 2 / CLOUD_SIZE;
  const left = viewportWidth / 2 - size * puffCenter;
  return { size, top, left };
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
  const rise = stepRise(view.width, view.height);
  const slope = rise / STEP_GAP;
  const maxX = Math.max(0, (count - 1) * STEP_GAP + CARD_WIDTH - view.width);
  const boundedX = clamp(cameraX, 0, maxX);
  // A single camera relation preserves the left-bottom to right-top diagonal as the user drags.
  const visibleIndex = (boundedX + view.width / 2 - CARD_WIDTH / 2) / STEP_GAP;
  const cameraYRaw = ANCHOR_BASE_Y + (count - 1 - visibleIndex) * rise - view.height * 0.7; // Follow anchor line, not card center.
  const railHeight = Math.max(460, pedestalAnchorY(0, count, rise) + 120);
  const cameraY = clamp(cameraYRaw, 0, Math.max(0, railHeight - view.height));
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
  const frame = hillFrame(view.height);
  const speeds = scenicSpeeds(count, view.width, frame.width);
  const cloudBox = cloudPlacement(view.height, view.width);
  const hillBox = (speed: number): CSSProperties => ({
    width: frame.width,
    height: frame.height,
    left: -speed * boundedX,
    bottom: 0,
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
      <div className="path-layer path-hill path-hill-2" data-testid="path-hill-2" data-parallax={speedAttr(speeds.hill2)} style={hillBox(speeds.hill2)} aria-hidden="true">
        <img src="/path/v2-terraces/hill-2-mid.png" alt="" width={1568} height={656} />
      </div>
      <div className="path-layer path-hill path-hill-1" data-testid="path-hill-1" data-parallax={speedAttr(speeds.hill1)} style={hillBox(speeds.hill1)} aria-hidden="true">
        <img src="/path/v2-terraces/hill-1-foreground.png" alt="" width={1568} height={656} />
      </div>
      <div className="staircase-rail" data-parallax="1" style={style}>
        {children}
      </div>
    </div>
  );
}
