import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WordGrid, type WordGridGroup } from './WordGrid';

const groups: WordGridGroup[] = [
  {
    id: 'opinion',
    label: 'Opinion',
    cells: [
      { id: 'should', text: 'should', gloss: '应该' },
      { id: 'think', text: 'I think', gloss: '我认为' },
    ],
  },
  {
    id: 'reasons',
    label: 'Reasons',
    cells: [
      { id: 'because', text: 'because', gloss: '因为' },
      { id: 'example', text: 'for example', gloss: '例如' },
    ],
  },
];

const meta = {
  title: 'Writing/WordGrid',
  component: WordGrid,
  args: {
    groups,
    activeGroup: 'opinion',
    presentation: 'docked',
    mode: 'expanded',
    locale: 'en',
    onGroupChange: () => undefined,
    onInsert: () => undefined,
  },
} satisfies Meta<typeof WordGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MultiGroup: Story = {
  render: (args) => {
    const [group, setGroup] = useState(args.activeGroup);
    const [inserted, setInserted] = useState('');
    return (
      <div>
        <WordGrid {...args} activeGroup={group} onGroupChange={setGroup} onInsert={setInserted} />
        <p>Inserted: {inserted}</p>
      </div>
    );
  },
};

export const OverlayTablet: Story = {
  args: { presentation: 'overlay', open: false },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [group, setGroup] = useState(args.activeGroup);
    return (
      <div style={{ minHeight: 420, paddingBottom: 160 }}>
        <p>The last writing line stays above the overlay.</p>
        <WordGrid {...args} open={open} activeGroup={group} onOpenChange={setOpen} onGroupChange={setGroup} />
      </div>
    );
  },
};

export const Locked: Story = {
  args: { mode: 'locked', groups: [] },
};

export const Chinese: Story = {
  args: {
    locale: 'zh',
    groups: [
      { ...groups[0], label: '观点' },
      { ...groups[1], label: '理由' },
    ],
  },
};

export const Collapsed: Story = {
  args: { mode: 'collapsed', groups: [] },
};
