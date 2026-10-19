import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BAButton } from './BAButton';

const meta = {
  title: 'UI/BAButton',
  component: BAButton,
  args: {
    children: 'Check',
    variant: 'primary',
    disabled: false,
    busy: false,
  },
} satisfies Meta<typeof BAButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FocusVisible: Story = {
  args: { children: 'Next', variant: 'secondary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Next' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('data-focus-visible', 'true');
  },
};

export const Disabled: Story = {
  args: { children: 'Hand in', disabled: true, variant: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Hand in' });
    await expect(button).toBeDisabled();
  },
};

export const Busy: Story = {
  args: { children: 'Saving', busy: true, variant: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Saving/ });
    await expect(button).toHaveAttribute('data-pending', 'true');
    await expect(button).not.toHaveAttribute('aria-busy');
    await expect(canvas.getByRole('progressbar', { name: 'Busy' })).toBeInTheDocument();
  },
};

/** One headless React Aria button, same CSS, two app-level semantic mappings.
 * Neutral is the system fallback and is NOT a fabricated Reading theme.
 */
export const SemanticThemeMapping: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
      <div data-ba-product="neutral" style={{ padding: 20, background: '#fff', border: '1px solid #ddd' }}>
        <p>Neutral foundation (no product)</p>
        <BAButton variant="primary">Primary</BAButton>
        <BAButton variant="secondary">Secondary</BAButton>
      </div>
      <div data-ba-product="writing" style={{ padding: 20, background: 'var(--ba-color-surface-shell)' }}>
        <p>Writing theme</p>
        <BAButton variant="primary">Primary</BAButton>
        <BAButton variant="secondary">Secondary</BAButton>
      </div>
    </div>
  ),
};
