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

const PARALLAX = { cloud: 0.12, hill2: 0.4, hill1: 0.72 } as const;
const HILL_RATIO = 656 / 1568;
const SKY = '#58A8E8';

/**
 * Shared hill frame for the opening view.
 * The ridges sit on the left and right of the PNG, with a transparent valley between.
 * A frame much wider than the stage, left-aligned, hides those ridges. Keep the
 * panorama just wider than the stage and center it. The card cameraY is a rail
 * offset and must not move these layers. Ground stays on the bottom edge.
 */
export function hillFrame(viewportWidth: number, viewportHeight: number): { width: number; height: number } {
  const width = Math.max(320, Math.round(Math.max(viewportWidth, 1) * 1.08));
  const height = Math.max(120, Math.round(width * HILL_RATIO));
  return { width, height };
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
  const layer = (ratio: number): CSSProperties => ({
    // X follows path scroll. Y stays 0: these layers are already on the stage,
    // and cameraY only exists to bring the tall card rail into the viewport.
    transform: 'translate3d(' + (-ratio * boundedX) + 'px, 0, 0)',
  });
  const hillBox = (ratio: number): CSSProperties => {
    const frame = hillFrame(view.width, view.height);
    const centered = Math.round((view.width - frame.width) / 2 - ratio * boundedX);
    return {
      width: frame.width,
      height: frame.height,
      left: centered,
      transform: 'translate3d(0, 0, 0)',
    };
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
      role="region"
      tabIndex={0}
      aria-label={locale === 'zh' ? '斜向课程阶梯：方向键浏览，Home 和 End 前往两端' : 'Diagonal lesson staircase: arrow keys navigate; Home and End reach the ends'}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      onKeyDown={keyDown}
    >
      <div className="path-sky" data-testid="path-sky" data-parallax="0" aria-hidden="true" />
      <div className="path-layer path-cloud" data-testid="path-cloud" data-parallax={PARALLAX.cloud} style={layer(PARALLAX.cloud)} aria-hidden="true">
        <img src="/path/v2-terraces/cloud.png" alt="" width={1024} height={1024} />
      </div>
      <div className="path-layer path-hill path-hill-2" data-testid="path-hill-2" data-parallax={PARALLAX.hill2} style={hillBox(PARALLAX.hill2)} aria-hidden="true">
        <img src="/path/v2-terraces/hill-2-mid.png" alt="" width={1568} height={656} />
      </div>
      <div className="path-layer path-hill path-hill-1" data-testid="path-hill-1" data-parallax={PARALLAX.hill1} style={hillBox(PARALLAX.hill1)} aria-hidden="true">
        <img src="/path/v2-terraces/hill-1-foreground.png" alt="" width={1568} height={656} />
      </div>
      <div className="staircase-rail" data-parallax="1" style={style}>
        {children}
      </div>
    </div>
  );
}
