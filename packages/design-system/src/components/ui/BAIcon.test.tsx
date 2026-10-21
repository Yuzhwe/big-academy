import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BAIcon, baIconPaths } from './BAIcon';

describe('BA-UI-ICON · official Iconoir subset', () => {
  it('offers the eight checked regular icon names with non-empty source paths', () => {
    expect(Object.keys(baIconPaths)).toEqual([
      'check', 'lock', 'arrow-left', 'menu', 'globe', 'book', 'warning-circle', 'info-circle', 'sound-high',
    ]);
    for (const list of Object.values(baIconPaths)) expect(list.length).toBeGreaterThan(0);
  });
  it('hides decorative icons from assistive technology', () => {
    const { container } = render(<BAIcon name="check" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });
  it('announces labelled iconography when meaningful', () => {
    render(<BAIcon name="warning-circle" decorative={false} label="Important warning" />);
    const img = screen.getByRole('img', { name:'Important warning' });
    expect(img.getAttribute('data-icon-name')).toBe('warning-circle');
    expect(img.querySelector('path')).not.toBeNull();
  });
});
