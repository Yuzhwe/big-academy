/** BA-UI-008 · small official Iconoir regular SVG subset (MIT).
 * Source: github.com/iconoir-icons/iconoir, Copyright (c) 2021 Luca Burgio.
 * See packages/design-system/THIRD_PARTY_NOTICES.md.
 * Existing official SVG path geometry is preserved. Default sizing [E].
 */
import type { CSSProperties } from 'react';
import './BAIcon.css';

export const baIconPaths = {
  "check": [
    "M5 13L9 17L19 7"
  ],
  "lock": [
    "M16 12H17.4C17.7314 12 18 12.2686 18 12.6V19.4C18 19.7314 17.7314 20 17.4 20H6.6C6.26863 20 6 19.7314 6 19.4V12.6C6 12.2686 6.26863 12 6.6 12H8M16 12V8C16 6.66667 15.2 4 12 4C8.8 4 8 6.66667 8 8V12M16 12H8"
  ],
  "arrow-left": [
    "M21 12L3 12M3 12L11.5 3.5M3 12L11.5 20.5"
  ],
  "menu": [
    "M3 5H21",
    "M3 12H21",
    "M3 19H21"
  ],
  "globe": [
    "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z",
    "M2.5 12.5L8 14.5L7 18L8 21",
    "M17 20.5L16.5 18L14 17V13.5L17 12.5L21.5 13",
    "M19 5.5L18.5 7L15 7.5V10.5L17.5 9.5H19.5L21.5 10.5",
    "M2.5 10.5L5 8.5L7.5 8L9.5 5L8.5 3"
  ],
  "book": [
    "M4 19V5C4 3.89543 4.89543 3 6 3H19.4C19.7314 3 20 3.26863 20 3.6V16.7143",
    "M6 17L20 17",
    "M6 21L20 21",
    "M6 21C4.89543 21 4 20.1046 4 19C4 17.8954 4.89543 17 6 17",
    "M9 7L15 7"
  ],
  "speaker": [
    "M4 10H7L12 6V18L7 14H4V10Z",
    "M16 8C17.3 9 18 10.4 18 12C18 13.6 17.3 15 16 16",
    "M18.5 5.5C20.6 7.2 22 9.5 22 12C22 14.5 20.6 16.8 18.5 18.5"
  ],
  "warning-circle": [
    "M12 7L12 13",
    "M12 17.01L12.01 16.9989",
    "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
  ],
  "info-circle": [
    "M12 11.5V16.5",
    "M12 7.51L12.01 7.49889",
    "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
  ]
} as const;

export type BAIconName = keyof typeof baIconPaths;
type Base = { name: BAIconName; size?: number; strokeWidth?: number; className?: string; style?: CSSProperties };
type IconA11y = { decorative?: true; label?: never } | { decorative: false; label: string };
export type BAIconProps = Base & IconA11y;

export function BAIcon({ name, size = 20, strokeWidth = 1.5, className, style, decorative = true, ...rest }: BAIconProps) {
  const label = 'label' in rest ? rest.label : undefined;
  return <svg
    className={['ba-icon', className].filter(Boolean).join(' ')}
    data-component="BA-UI-008"
    data-icon-name={name}
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    role={decorative ? undefined : 'img'}
    aria-hidden={decorative ? true : undefined}
    aria-label={decorative ? undefined : label}
    focusable="false"
  >
    {baIconPaths[name].map((d, index) => <path key={index} d={d} />)}
  </svg>;
}
