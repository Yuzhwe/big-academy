import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent } from 'storybook/test';
import type { TaskProgressItem } from '../../types/task';
import { BATaskProgress } from './BATaskProgress';

const mixed: TaskProgressItem[] = [
  { id: '1', label: 'Learn', status: 'done' },
  { id: '2', label: 'Pick the topic sentence', status: 'skipped' },
  { id: '3', label: 'Opinion or fact?', status: 'current' },
  { id: '4', label: 'Build a topic sentence', status: 'available' },
  { id: '5', label: 'Check', status: 'locked' },
];

const many: TaskProgressItem[] = Array.from({ length: 18 }, (_, index) => ({
  id: `t-${index + 1}`,
  label: `Activity ${index + 1}`,
  status: index < 3 ? 'done' : index === 3 ? 'skipped' : index === 4 ? 'current' : index < 8 ? 'available' : 'locked',
}));

function allow(tasks: TaskProgressItem[]) {
  return (index: number) => tasks[index]?.status !== 'locked';
}

const meta = {
  title: 'Primitives/BATaskProgress',
  component: BATaskProgress,
  parameters: { ba: { contractId: 'BA-UI-006', status: 'in-review', owner: 'Design System', purpose: 'Activity progress and locked navigation states' } },
  args: {
    tasks: mixed,
    activeIndex: 2,
    canOpen: allow(mixed),
    locale: 'en',
  },
} satisfies Meta<typeof BATaskProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedStatus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /Learn, done/ })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /skipped/ })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /current/ })).toHaveAttribute('aria-current', 'step');
    await expect(canvas.getByRole('button', { name: /locked/ })).toBeDisabled();
  },
};

export const ManyTasks: Story = {
  args: {
    tasks: many,
    activeIndex: 4,
    canOpen: allow(many),
  },
};

export const TabletCenter: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 834, margin: '0 auto', outline: '1px dashed #d9cbb8' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export const Skipped: Story = {
  args: {
    locale: 'zh',
    activeIndex: 1,
    tasks: [
      { id: 'a', label: '学一学', status: 'done' },
      { id: 'b', label: '找出观点词', status: 'skipped' },
      { id: 'c', label: '小测', status: 'locked' },
    ],
    canOpen: (index) => index !== 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skipped = canvas.getByRole('button', { name: '任务 2：找出观点词，已跳过' });
    await expect(skipped).toBeEnabled();
    await expect(skipped).not.toHaveAccessibleName(/已完成/);
    await expect(canvas.getByRole('button', { name: /已完成/ })).toBeInTheDocument();
  },
};

/** Navigation is independent of status: a Done or Skipped screen can be selected. */
export const DoneSelected: Story = {
  args: { tasks: mixed, activeIndex: 0, canOpen: allow(mixed) },
};
export const SkippedSelected: Story = {
  args: { tasks: mixed, activeIndex: 1, canOpen: allow(mixed) },
};
export const IncompleteSelected: Story = {
  args: { tasks: mixed, activeIndex: 2, canOpen: allow(mixed) },
};

/** DR02-07: rail cap + current-first window with complete index in the same 36px marker. */
export const Overflow16Screens: Story = {
  args: { tasks: many.slice(0, 16), activeIndex: 12, canOpen: allow(many) },
  decorators: [
    (Story) => <div style={{ width: 520, maxWidth: '100%', margin: '0 auto' }}><Story /></div>,
  ],
};

export const AllScreensPopover: Story = {
  args: { tasks: many, activeIndex: 9, canOpen: allow(many) },
  decorators: [
    (Story) => <div style={{ width: 520, maxWidth: '100%', margin: '0 auto' }}><Story /></div>,
  ],
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'All activity screens' });
    await userEvent.click(trigger);
    await expect(within(document.body).getByRole('dialog', { name: 'All activity screens' })).toBeInTheDocument();
  },
};
