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
