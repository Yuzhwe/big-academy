import type { ReactNode } from 'react';

export type NotebookOrientation = 'portrait' | 'landscape';

/** Spacing-first: count from usable length / pitch — identical to notebook-editor-demo.html */
export function bindCount(spanPx: number, sidePx: number, slotPx: number, pitchPx: number): number {
  const usable = Math.max(0, spanPx - sidePx * 2);
  // n slots with (n-1) gaps ≈ pitch between centers
  let n = Math.floor((usable - slotPx) / pitchPx) + 1;
  return Math.max(3, Math.min(24, n));
}

export function cssPx(el: Element | null, name: string): number {
  if (!el) return 0;
  return parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;
}

/** Shared U-ring coil mark (matches NotebookEditor / demo SVG). */
export const COIL_SVG: ReactNode = (
  <svg viewBox="0 0 16 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="8" cy="38.4" rx="5" ry="1.4" fill="rgba(28,24,16,.14)" />
    <path
      d="M 3.2 2.5
             L 3.2 36.8
             C 3.2 40.0, 12.8 40.0, 12.8 36.8
             L 12.8 2.5"
      fill="none"
      stroke="#17150f"
      strokeWidth="2.1"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M 4.15 5 L 4.15 35"
      stroke="rgba(255,255,255,.18)"
      strokeWidth="0.85"
      strokeLinecap="round"
    />
  </svg>
);
