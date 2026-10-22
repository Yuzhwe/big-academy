import type { Meta, StoryObj } from '@storybook/react-vite';
import { WordGrid } from './WordGrid';

const groups = [
  { id: 'opinion', label: 'Opinion', words: [{ id: 'think', text: 'think' }, { id: 'should', text: 'should' }] },
  { id: 'nouns', label: 'Nouns', words: [{ id: 'garden', text: 'garden' }] },
  { id: 'adjectives', label: 'Adjectives', words: [{ id: 'fresh', text: 'fresh' }] },
  { id: 'marks', label: 'Marks', words: [{ id: 'period', text: '.' }] },
];

const meta = {
  title: 'Writing/WordGrid',
  component: WordGrid,
  args: { groups, activeGroup: 'opinion' },
} satisfies Meta<typeof WordGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiGroup: Story = {};
export const MultipleStickyTabs: Story = {};
export const OneGroupNoTab: Story = {
  args: { groups: [{ id: 'set', label: 'Sentence set', words: [{ id: 'our', text: 'our' }, { id: 'school', text: 'school' }] }], activeGroup: 'set' },
};
export const OverlayTablet: Story = { args: { presentation: 'overlay' } };
export const Locked: Story = { args: { groups: [] } };
export const Chinese: Story = {
  args: {
    locale: 'zh',
    groups: groups.map((group) => ({ ...group, label: { opinion: '观点', nouns: '名词', adjectives: '形容词', marks: '标点' }[group.id] ?? group.label })),
  },
};
export const WordWrapTablet: Story = {
  args: {
    groups: [{ id: 'task', label: 'Task', words: [{ id: 'long', text: 'to rest their brains' }, { id: 'be', text: 'be longer' }] }],
    activeGroup: 'task',
  },
};
