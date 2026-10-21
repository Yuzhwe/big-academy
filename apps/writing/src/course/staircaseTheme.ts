/** Visual theme for E-01. Geometry and course rules stay on variant A. */
export type StaircaseTheme = 'r1' | 'landscape';

/**
 * `?staircase=landscape` selects the comparison backdrop.
 * Any other value, including omission, keeps the R1 warm gradient.
 */
export function staircaseThemeFromSearch(search: string): StaircaseTheme {
  const theme = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('staircase');
  return theme === 'landscape' ? 'landscape' : 'r1';
}
