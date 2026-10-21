import { describe, expect, it } from 'vitest';
import { staircaseThemeFromSearch } from './staircaseTheme';

describe('staircase theme query', () => {
  it('keeps the R1 staircase unless the landscape query is set', () => {
    expect(staircaseThemeFromSearch('')).toBe('r1');
    expect(staircaseThemeFromSearch('?locale=zh')).toBe('r1');
    expect(staircaseThemeFromSearch('?staircase=r1')).toBe('r1');
    expect(staircaseThemeFromSearch('?staircase=other')).toBe('r1');
    expect(staircaseThemeFromSearch('?staircase=landscape')).toBe('landscape');
    expect(staircaseThemeFromSearch('locale=en&staircase=landscape')).toBe('landscape');
  });
});
