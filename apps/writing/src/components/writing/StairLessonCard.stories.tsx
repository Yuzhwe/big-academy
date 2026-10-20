import type { Meta, StoryObj } from '@storybook/react-vite';
import { StairLessonCard } from './StairLessonCard';

const meta = {
  title: 'Writing/StairLessonCard',
  component: StairLessonCard,
  args: {
    lessonId: 'G2-O:1',
    number: 1,
    title: 'Topic sentences',
    state: 'start',
    detail: 'Ready to start',
    locale: 'en',
  },
} satisfies Meta<typeof StairLessonCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Start: Story = {};
export const Continue: Story = { args: { state: 'continue', detail: 'You are here' } };
export const Review: Story = { args: { state: 'review', detail: 'Done · 8 pages' } };
export const Locked: Story = { args: { number: 2, state: 'locked', detail: 'After Lesson 1' } };
export const Skipped: Story = { args: { state: 'skipped', detail: 'Mastered · skipped' } };
