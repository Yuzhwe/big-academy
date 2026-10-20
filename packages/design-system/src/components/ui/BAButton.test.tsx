import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BAButton } from './BAButton';

describe('BAButton', () => {
  it('runs onPress from click, Enter, and Space', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <BAButton variant="primary" onPress={onPress}>
        Check
      </BAButton>,
    );
    const button = screen.getByRole('button', { name: 'Check' });
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(3);
    expect(button).toHaveAttribute('data-component', 'BA-UI-001');
    expect(button).toHaveAttribute('data-variant', 'primary');
  });

  it('shows a keyboard focus ring attribute', async () => {
    const user = userEvent.setup();
    render(<BAButton variant="secondary">Next</BAButton>);
    await user.tab();
    const button = screen.getByRole('button', { name: 'Next' });
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('data-focus-visible', 'true');
  });

  it('does not press when disabled', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <BAButton disabled onPress={onPress}>
        Hand in
      </BAButton>,
    );
    const button = screen.getByRole('button', { name: 'Hand in' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('keeps a single pending indicator and does not declare aria-busy on the button', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <BAButton busy busyLabel="Saving" onPress={onPress}>
        Save
      </BAButton>,
    );
    const button = screen.getByRole('button', { name: /Save/ });
    expect(button).toHaveAttribute('data-pending', 'true');
    expect(button).not.toHaveAttribute('aria-busy');
    expect(button.getAttribute('aria-busy')).toBeNull();
    expect(screen.getByRole('progressbar', { name: 'Saving' })).toBeInTheDocument();
    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
