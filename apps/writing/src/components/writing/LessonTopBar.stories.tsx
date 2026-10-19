import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { LessonTopBar } from './LessonTopBar';
import { LONG_TITLE_ZH, getFixture } from '../../fixtures/topbarFixtures';

const desktop = getFixture('mixed', 'en');
const tablet = getFixture('long', 'zh');
const many = getFixture('many', 'en');

const meta = {
  title: 'Writing/LessonTopBar',
  component: LessonTopBar,
  parameters: { layout: 'fullscreen' },
  args: {
    lessonTitle: desktop.lessonTitle,
    lessonNumber: desktop.lessonNumber,
    tasks: desktop.tasks,
    current: desktop.current,
    canOpen: desktop.canOpen,
    tags: desktop.tags,
    locale: 'en',
  },
} satisfies Meta<typeof LessonTopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 1440 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /menu|index|hamburger|菜单/i })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Back to my path' })).toBeInTheDocument();
  },
};

export const TabletLongTitle: Story = {
  args: {
    lessonTitle: LONG_TITLE_ZH,
    lessonNumber: tablet.lessonNumber,
    tasks: tablet.tasks,
    current: tablet.current,
    canOpen: tablet.canOpen,
    tags: tablet.tags,
    locale: 'zh',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 834 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(LONG_TITLE_ZH)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '回到我的学习路径' })).toBeInTheDocument();
  },
};

export const ManyTasks: Story = {
  args: {
    lessonTitle: many.lessonTitle,
    lessonNumber: many.lessonNumber,
    tasks: many.tasks,
    current: many.current,
    canOpen: many.canOpen,
    tags: many.tags,
    locale: 'en',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 1024 }}>
        <Story />
      </div>
    ),
  ],
};
