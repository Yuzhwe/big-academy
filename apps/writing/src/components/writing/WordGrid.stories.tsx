import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { WordGrid, type WordGroup } from './WordGrid';

const applyGroups: WordGroup[] = [
  {
    id: 'opinion',
    tone: 'opinion',
    label: 'Opinion',
    words: [
      { id: 'o-think', text: 'think' },
      { id: 'o-should', text: 'should' },
      { id: 'o-best', text: 'best' },
    ],
  },
  {
    id: 'nouns',
    tone: 'nouns',
    label: 'Nouns',
    words: [
      { id: 'n-garden', text: 'garden' },
      { id: 'n-seeds', text: 'seeds' },
    ],
  },
  {
    id: 'adjectives',
    tone: 'adjectives',
    label: 'Adjectives',
    words: [{ id: 'a-fresh', text: 'fresh' }],
  },
  {
    id: 'marks',
    tone: 'marks',
    label: 'Marks',
    words: [
      { id: 'm-period', text: '.' },
      { id: 'm-comma', text: ',' },
    ],
  },
];

const sentence: WordGroup = {
  id: 'set',
  tone: 'set',
  label: 'Sentence set',
  words: ['Our', 'school', 'should', 'have', 'a', 'garden', '.'].map((text) => ({
    id: text,
    text,
    state: text === 'Our' ? 'used' : text === '.' ? 'disabled' : 'available',
  })),
};

const meta = {
  title: 'Writing/WordGrid',
  component: WordGrid,
  args: {
    groups: applyGroups,
    activeGroup: 'opinion',
  },
} satisfies Meta<typeof WordGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

function MultiDemo({ locale = 'en' as 'en' | 'zh' }) {
  const [active, setActive] = useState('opinion');
  const [inserted, setInserted] = useState('Write here. ');
  const groups = applyGroups.map((group) => ({
    ...group,
    label:
      locale === 'zh'
        ? { opinion: '观点', nouns: '名词', adjectives: '形容词', marks: '标点' }[group.id] ?? group.label
        : group.label,
  }));
  return (
    <div>
      <p lang="en">{inserted}</p>
      <WordGrid
        groups={groups}
        activeGroup={active}
        locale={locale}
        onGroupChange={setActive}
        onInsert={(word) => setInserted((current) => `${current}${word.text} `)}
      />
    </div>
  );
}

export const MultiGroup: Story = {
  args: { groups: applyGroups, activeGroup: 'opinion' },
  render: () => <MultiDemo />,
};

export const MultipleStickyTabs: Story = {
  args: { groups: applyGroups, activeGroup: 'nouns' },
  render: () => <MultiDemo />,
};

export const OneGroupNoTab: Story = {
  args: { groups: [sentence], activeGroup: 'set' },
};

export const Chinese: Story = {
  args: { groups: applyGroups, activeGroup: 'opinion', locale: 'zh' },
  render: () => <MultiDemo locale="zh" />,
};

export const OverlayTablet: Story = {
  args: { groups: applyGroups, activeGroup: 'opinion', presentation: 'overlay' },
  render: () => (
    <div className="word-grid-host" style={{ position: 'relative', height: 420, background: '#fff', borderRadius: 16 }}>
      <p style={{ margin: 16 }}>Last writing line stays in the writing host.</p>
      <WordGrid groups={applyGroups} activeGroup="opinion" presentation="overlay" />
    </div>
  ),
};

export const WordWrapTablet: Story = {
  args: {
    groups: [
      {
        id: 'opinion',
        tone: 'opinion',
        label: 'Opinion',
        words: [{ id: 'long', text: 'In my opinion our school should' }],
      },
    ],
    activeGroup: 'opinion',
  },
};

export const EmptyGroup: Story = {
  args: {
    groups: [
      { id: 'opinion', tone: 'opinion', label: 'Opinion', words: [] },
      { id: 'nouns', tone: 'nouns', label: 'Nouns', words: [{ id: 'garden', text: 'garden' }] },
    ],
    activeGroup: 'opinion',
  },
};
