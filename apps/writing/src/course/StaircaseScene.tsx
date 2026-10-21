import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type KeyboardEvent, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { BALocale } from '@big-academy/design-system';
import { LandscapeBackdrop } from './LandscapeBackdrop';
import type { StaircaseTheme } from './staircaseTheme';
import './StaircaseScene.css';

export type StaircaseVariant = 'A' | 'B';

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
 * Staircase geometry is shared by both A/B visual treatments.
 * Adapted from the designer's E-01 staircase reference; 15 degrees is not hardcoded.
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

/** Review-only diagonal scene: the product supplies ordered nodes and all navigation eligibility. */
export function StaircaseScene({
  children,
  count,
  focusIndex,
  variant,
  locale,
  theme = 'r1',
}: {
  children: ReactNode;
  count: number;
  focusIndex: number;
  variant: StaircaseVariant;
  locale: BALocale;
  theme?: StaircaseTheme;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pathHost, setPathHost] = useState<HTMLElement | null>(null);
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
    setPathHost(viewportRef.current?.closest<HTMLElement>('.course-path') ?? null);
  }, []);

  useLayoutEffect(() => {
    if (!pathHost || theme !== 'landscape') return;
    pathHost.style.setProperty('--landscape-shift', Math.round(boundedX) + 'px');
  }, [pathHost, theme, boundedX]);

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

  const railWidth = Math.max(CARD_WIDTH, (count - 1) * STEP_GAP + CARD_WIDTH);
  const pathD = Array.from({ length: count }, (_, i) =>
    (i === 0 ? 'M ' : 'L ') + (i * STEP_GAP + CARD_WIDTH / 2) + ' ' + pedestalAnchorY(i, count, rise)
  ).join(' ');
  const style = {
    '--step-count': count,
    '--step-rise': String(rise) + 'px',
    '--anchor-base-y': String(ANCHOR_BASE_Y) + 'px',
    '--rail-height': String(railHeight) + 'px',
    transform: 'translate3d(' + (-boundedX) + 'px, ' + (-cameraY) + 'px, 0)',
  } as CSSProperties;

  return (
    <div
      ref={viewportRef}
      className="staircase-viewport"
      data-variant={variant}
      data-theme={theme}
      data-camera-x={Math.round(boundedX)}
      data-rise-px={rise}
      data-anchor-basis="pedestal-y"
      data-dragging={dragging ? 'true' : 'false'}
      role="region"
      tabIndex={0}
      aria-label={locale === 'zh' ? '斜向课程阶梯：方向键浏览，Home 和 End 前往两端' : 'Diagonal lesson staircase: arrow keys navigate; Home and End reach the ends'}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      onKeyDown={keyDown}
    >
      {theme === 'landscape' && pathHost ? createPortal(<LandscapeBackdrop />, pathHost) : null}
      <div className="staircase-rail" style={style}>
        {variant === 'B' ? (
          <svg className="staircase-continuous-path" width={railWidth} height={railHeight} aria-hidden="true">
            <path d={pathD} />
          </svg>
        ) : null}
        {children}
      </div>
    </div>
  );
}
