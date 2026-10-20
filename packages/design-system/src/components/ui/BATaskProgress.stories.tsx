import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
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
  title: 'UI/BATaskProgress',
  component: BATaskProgress,
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

const five: TaskProgressItem[] = [
  { id: '1', label: 'Learn', status: 'available', number: 1 },
  { id: '2', label: 'Practice', status: 'done', number: 2 },
  { id: '3', label: 'Build', status: 'current', number: 3 },
  { id: '4', label: 'Apply', status: 'locked', number: 4 },
  { id: '5', label: 'Check', status: 'done', number: 5, revealed: true },
];

export const IndicatorFiveStates: Story = {
  args: { tasks: five, activeIndex: 2, canOpen: allow(five) },
};

export const DoneSelected: Story = {
  args: {
    tasks: [{ id: '1', label: 'Learn', status: 'done', number: 1 }],
    activeIndex: 0,
    canOpen: () => true,
  },
};

export const Locked: Story = {
  args: {
    tasks: [{ id: '1', label: 'Check', status: 'locked', number: 1 }],
    activeIndex: -1,
    canOpen: () => false,
  },
};

export const ShownAccessible: Story = {
  args: {
    tasks: [{ id: '1', label: 'Build', status: 'done', number: 1, revealed: true }],
    activeIndex: 0,
    canOpen: () => true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /answer shown/ })).toBeInTheDocument();
  },
};

export const AllScreensPopover: Story = {
  args: { tasks: many, activeIndex: 4, canOpen: allow(many) },
};

export const PopoverKeyboardFocus: Story = AllScreensPopover;

export const Overflow16Screens: Story = {
  args: {
    tasks: many.slice(0, 16),
    activeIndex: 4,
    canOpen: allow(many),
  },
};
