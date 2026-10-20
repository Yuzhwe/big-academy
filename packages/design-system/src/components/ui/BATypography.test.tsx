import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BAText, BANumber } from './BATypography';

describe('BA-UI-TYPE typography semantics', () => {
  it('preserves HTML heading semantics and maps semantic role', () => {
    render(<BAText as="h2" textRole="heading">A reason to write</BAText>);
    const heading = screen.getByRole('heading', { level:2, name:'A reason to write' });
    expect(heading.getAttribute('data-text-role')).toBe('heading');
  });
  it('renders UI numerals as text rather than converting authored content', () => {
    render(<BANumber>2026</BANumber>);
    expect(screen.getByText('2026').getAttribute('data-component')).toBe('BA-UI-010');
  });
});
