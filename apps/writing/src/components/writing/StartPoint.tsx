import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import './StartPoint.css';

export type StartPointLocale = 'en' | 'zh';

export interface StartPointProps {
  text?: string;
  locale?: StartPointLocale;
  fill?: string;
  stroke?: string;
  ink?: string;
  className?: string;
  onTextChange?: (text: string) => void;
}

/** Scale factor: Unit-title 24px vs original 30px silhouette. Paths stay native. */
export const START_POINT_GEOM_SCALE = 0.8;

/**
 * Library combo (Start Point × StairLevelIntroCard / Level card): whole SP tip toward upper-right.
 * Negative = CCW so the right tip lifts. Unit combo was mistargeted and removed.
 */
export const START_POINT_LEVEL_COMBO_TILT_DEG = -6;

export const START_POINT_DEFAULTS = {
  fill: '#ffc24e',
  stroke: '#715146',
  ink: '#2f0f04',
  textEn: 'Start Point',
  textZh: '开始学习啦！',
  /** Native (pre-scale) left widths — seeds only; live measure wins after fonts. */
  widthEn: 199,
  widthZh: 242,
  height: 82,
  rightExtra: 91,
  padLeft: 40,
  padRight: 20,
} as const;

/** Canvas measure matches Unit-title size token (24px), weight 800. */
const FONT = '800 24px Dosis, "Noto Sans SC", sans-serif';

let measureCanvas: HTMLCanvasElement | null = null;

function measureTextWidth(text: string): number {
  if (typeof document === 'undefined') return 0;
  if (!measureCanvas) measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = FONT;
  return ctx.measureText(text).width;
}

/**
 * Left panel native width for SVG split X.
 * Text is painted at 24px (unscaled); geometry CSS-scales by START_POINT_GEOM_SCALE,
 * so native W = visual(text + pads) / scale.
 */
export function measureStartPointTextWidth(text: string, locale: StartPointLocale = 'en'): number {
  const trimmed = text.trim();
  const scale = START_POINT_GEOM_SCALE;
  const fallback = locale === 'zh' ? START_POINT_DEFAULTS.widthZh : START_POINT_DEFAULTS.widthEn;
  if (!trimmed) return fallback;
  const content = measureTextWidth(trimmed);
  if (!content) return fallback;
  const visualPads =
    START_POINT_DEFAULTS.padLeft * scale + START_POINT_DEFAULTS.padRight * scale;
  const native = Math.ceil((content + visualPads) / scale);
  // Keep a usable minimum so short strings do not collapse the open-right silhouette.
  return Math.max(native, locale === 'zh' ? 160 : 140);
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(3).replace(/\.?0+$/, '');
}

/** Authority SVG path families parameterized by split X = W. Not redrawn for 24px. */
export function startPointPaths(W: number) {
  const w = fmt(W);
  const w27 = fmt(W + 27);
  const w38 = fmt(W + 38.598);
  const w48 = fmt(W + 48);
  return {
    leftFill: `M20 1H${w}V79H20C9.507 79 1 70.493 1 60V20C1 9.507 9.507 1 20 1Z`,
    rightFill: `M${w} 1H${w27}C${w38} 1 ${w48} 10.402 ${w48} 22V79H${w}Z`,
    leftStroke: `M20 1H${w}M${w} 79H20C9.507 79 1 70.493 1 60V20C1 9.507 9.507 1 20 1`,
    rightStroke: `M${w} 1H${w27}C${w38} 1 ${w48} 10.402 ${w48} 22V79H${w}`,
  };
}

export function defaultStartPointText(locale: StartPointLocale): string {
  return locale === 'zh' ? START_POINT_DEFAULTS.textZh : START_POINT_DEFAULTS.textEn;
}

/** BA-WR-015 Start Point — left label + right cut/decoration; leftStroke open (no Z close = no diagonal slash). */
export function StartPoint({
  text,
  locale = 'en',
  fill = START_POINT_DEFAULTS.fill,
  stroke = START_POINT_DEFAULTS.stroke,
  ink = START_POINT_DEFAULTS.ink,
  className,
  onTextChange,
}: StartPointProps) {
  const label = text ?? defaultStartPointText(locale);
  const [textWidth, setTextWidth] = useState<number>(() =>
    locale === 'zh' ? START_POINT_DEFAULTS.widthZh : START_POINT_DEFAULTS.widthEn,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const measureToken = useRef(0);

  useLayoutEffect(() => {
    let cancelled = false;
    const token = ++measureToken.current;
    const run = () => {
      if (cancelled || token !== measureToken.current) return;
      setTextWidth(measureStartPointTextWidth(label, locale));
    };
    run();
    const fonts = document.fonts;
    if (fonts?.ready) {
      void fonts.ready.then(() => {
        if (!cancelled) run();
      });
    }
    // Re-measure after layout/paint in case webfonts swap late.
    const raf = requestAnimationFrame(run);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [label, locale]);

  const paths = useMemo(() => startPointPaths(textWidth), [textWidth]);
  const totalWidth = textWidth + START_POINT_DEFAULTS.rightExtra;
  const style = {
    '--text-width': `${textWidth}px`,
    '--start-point-fill': fill,
    '--start-point-stroke': stroke,
    '--start-point-ink': ink,
    '--start-point-geom-scale': String(START_POINT_GEOM_SCALE),
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={['start-point', className].filter(Boolean).join(' ')}
      data-component="BA-WR-015"
      data-locale={locale}
      data-text-width={textWidth}
      data-geom-scale={START_POINT_GEOM_SCALE}
      style={style}
      role={onTextChange ? undefined : 'img'}
      aria-label={onTextChange ? undefined : label}
    >
      <svg
        className="start-point__geometry"
        viewBox={`0 0 ${totalWidth} ${START_POINT_DEFAULTS.height}`}
        width={totalWidth}
        height={START_POINT_DEFAULTS.height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path className="start-point__fill" d={paths.leftFill} />
        <path className="start-point__fill" d={paths.rightFill} />
        <g className="start-point__stroke" fill="none" strokeWidth="2" strokeLinejoin="round">
          <path d={paths.leftStroke} />
          <path d={paths.rightStroke} />
        </g>
        {/* Decorations stay in local coords; group translates by measured W. leftStroke has no Z (no diagonal slash). */}
        <g
          transform={`translate(${textWidth} 0)`}
          className="start-point__stroke"
          fill="var(--start-point-fill)"
          strokeWidth="2"
        >
          <rect x="35" y="62.9058" width="27" height="18" rx="9" />
          <rect x="36.6951" y="46.4348" width="30" height="18" rx="9" transform="rotate(-2 36.6951 46.4348)" />
          <rect x="27" y="5.90576" width="63" height="24" rx="12" />
          <path d="M20.6149 14.3809C20.0853 7.49767 25.236 1.48841 32.1192 0.958816C39.0024 0.429225 45.0117 5.57986 45.5412 12.4631L46.3851 23.4307C46.9147 30.3139 41.764 36.3231 34.8808 36.8527C27.9976 37.3823 21.9883 32.2317 21.4588 25.3485L20.6149 14.3809Z" />
          <rect x="40" y="28.9058" width="30" height="18" rx="9" />
        </g>
      </svg>
      <div className="start-point__label">
        {onTextChange ? (
          <input
            className="start-point__text"
            value={label}
            maxLength={28}
            aria-label={locale === 'zh' ? '开始点文本' : 'Start Point text'}
            onChange={(event) => onTextChange(event.target.value)}
          />
        ) : (
          <span className="start-point__text">{label}</span>
        )}
      </div>
    </div>
  );
}
