import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { WordGrid, type WordGridProps } from './WordGrid';

const groups = [
  { id: 'opinion', label: 'Opinion', words: [{ id: 'think', text: 'think' }, { id: 'should', text: 'should' }] },
  { id: 'nouns', label: 'Nouns', words: [{ id: 'garden', text: 'garden' }] },
  { id: 'adjectives', label: 'Adjectives', words: [{ id: 'fresh', text: 'fresh' }] },
  { id: 'marks', label: 'Marks', words: [{ id: 'period', text: '.' }] },
];

const meta = {
  title: 'Writing/Activities/WordGrid',
  component: WordGrid,
  parameters: { ba: { contractId: 'BA-WR-003', status: 'approved', owner: 'Writing', purpose: 'Connected sticky tabs and word-card bank' } },
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

export const R2SingleVisible: Story = {args:{tabs:'show',groups:[{id:'words',label:'Words',words:[{id:'a',text:'garden'}]}],activeGroup:'words'}};
export const R2SentenceWrap: Story = {args:{tabs:'hide',groups:[{id:'sentences',label:'Sentences',words:[{id:'s',kind:'sentence',text:'A school garden gives every student a quiet place to learn about plants, grow vegetables, and spend time with friends after a busy day.'}]}],activeGroup:'sentences'},render:args=><div style={{width:280}}><WordGrid {...args}/></div>};
export const R2StateDimensionsCandidate: Story = {args:{groups:[{id:'states',label:'Independent states',words:[{id:'s',text:'garden',selection:'selected',evaluation:'neutral'},{id:'u',text:'school',selection:'used'},{id:'h',text:'believe',evaluation:'hint'},{id:'a',text:'should',evaluation:'shown'},{id:'d',text:'reasons',disabled:true}]}],activeGroup:'states'}};


export const RoundedSeamFix:Story={
  args:{groups,activeGroup:'nouns'},
  parameters:{ba:{contractId:'BA-WR-003',status:'R04-R2-review',note:'Original rounded tabs, first tab unselected, same-tint seam underlay. No slants.'}},
};

/** Selected and correct-but-unselected are independent state dimensions. */
export const CorrectAndAlternative: Story = {
  args: {
    activeGroup: 'targets',
    groups: [{ id: 'targets', label: 'Opinion words', words: [
      { id: 'believe', text: 'believe', selection: 'default', evaluation: 'correctUnselected' },
      { id: 'should', text: 'should', selection: 'selected', evaluation: 'correct' },
    ] }],
  },
};

function ToggleSelectionDemo(args: WordGridProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const words = [{ id: 'our', text: 'our' }, { id: 'school', text: 'school' }];
  return <WordGrid {...args}
    groups={[{ id: 'sample', label: 'Sentence set', words: words.map(word => ({
      ...word, selection: selected.includes(word.id) ? 'selected' as const : 'default' as const,
    })) }]}
    activeGroup="sample"
    onWordAction={word => setSelected(old => old.includes(word.id) ? old.filter(id => id !== word.id) : [...old, word.id])}
  />;
}
export const ReversibleSelection: Story = { render: args => <ToggleSelectionDemo {...args}/> };
