import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HamburgerLayer } from './HamburgerLayer';

describe('HamburgerLayer', () => {
  it('keeps the entry on the layer surface and underlines it when focused', async () => {
    const user = userEvent.setup();
    render(
      <HamburgerLayer
        layerId="opinion"
        label="Top bun: My opinion"
        value=""
        editable
        part="top"
        placeholder="Yes or no?"
      />,
    );
    const entry = screen.getByRole('textbox', { name: 'Top bun: My opinion' });
    expect(entry.className).toContain('hamburger-layer__entry');
    const layer = entry.closest('.hamburger-layer');
    expect(layer).toHaveAttribute('data-focused', 'false');
    await user.click(entry);
    expect(layer).toHaveAttribute('data-focused', 'true');
    expect(getComputedStyle(entry).backgroundColor).not.toBe('rgb(255, 255, 255)');
  });

  it('does not commit text while a composition is open', () => {
    const onChange = vi.fn();
    render(
      <HamburgerLayer layerId="opinion" label="观点" value="" editable onChange={onChange} />,
    );
    const entry = screen.getByRole('textbox', { name: '观点' });
    fireEvent.compositionStart(entry);
    fireEvent.change(entry, { target: { value: 'ni', selectionStart: 2 } });
    expect(onChange).not.toHaveBeenCalled();
    expect(entry).toHaveValue('ni');
    fireEvent.compositionEnd(entry);
    expect(onChange).toHaveBeenCalledWith('ni', 2);
  });

  it('renders a read-only layer without a text entry', () => {
    render(
      <HamburgerLayer layerId="reason1" label="Reason 1" value="Fresh food" editable={false} part="fill" />,
    );
    expect(screen.getByText('Fresh food')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
