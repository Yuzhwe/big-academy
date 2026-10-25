import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { BAButton } from './BAButton';
import { BAIcon } from './BAIcon';


const meta = {
  title: 'Primitives/BAButton',
  component: BAButton,
  parameters: { ba: { contractId: 'BA-UI-001', status: 'pending-review', owner: 'Design System', purpose: 'Shared action control for lessons and navigation' } },
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


/** Figma 30:2 production variant matrix; all sizes use identical React Aria press behavior. */
export const FigmaV2ButtonMatrix: Story = {
  render: () => (
    <div style={{ display:'grid', gap:20 }}>
      {([36,50,70,90] as const).map(size =>
        <div key={size} style={{ display:'flex',flexWrap:'wrap',alignItems:'center',gap:16 }}>
          <strong>{size}px</strong>
          <BAButton variant="primary" size={size}>Primary</BAButton>
          <BAButton variant="secondary" size={size}>Secondary</BAButton>
          <BAButton variant="tertiary" size={size}>Tertiary</BAButton>
          <BAButton variant="primary" radius="standard" size={size}>Standard</BAButton>
        </div>
      )}
    </div>
  )
};
export const FigmaV2IconAndStates: Story = {
  render: () => (
    <div style={{ display:'flex', flexWrap:'wrap',gap:16,alignItems:'center' }}>
      <BAButton variant="primary" leadingIcon={<BAIcon name="arrow-left"/>}>Back</BAButton>
      <BAButton variant="secondary" trailingIcon={<BAIcon name="check"/>}>Continue</BAButton>
      <BAButton variant="primary" iconOnly aria-label="Menu"><BAIcon name="menu"/></BAButton>
      <BAButton variant="primary" intent="destructive">Delete</BAButton>
      <BAButton variant="primary" disabled>Disabled</BAButton>
      <BAButton variant="primary" busy>Processing</BAButton>
    </div>
  )
};

export const R2OutlineCandidate: Story = { args: { variant: 'outline', children: 'Outline · Candidate / Pending Approval' } };
export const R2FullWidthLong: Story = { args: { layout:'full', wrap:true, children:'Continue learning and discover new ideas with your friends in our school garden' }, render:args=><div style={{width:280}}><BAButton {...args}/></div> };
