import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WordGrid } from './WordGrid';

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


/** Stage A visual proof; live Activity 7 stays on connected tabs. */
function SlantedExample() {
  const [active,setActive]=useState('opinion');
  return <div style={{width:590,maxWidth:'100%'}}>
    <WordGrid groups={groups} activeGroup={active} tabAppearance="slanted"
      onGroupChange={setActive} onInsert={()=>{}}/>
  </div>;
}
export const SlantedTabsCandidate:Story={render:()=> <SlantedExample/>,
  parameters:{ba:{contractId:'BA-WR-003',status:'candidate-pending-designer-review',note:'Steep right slope, 2px selected lift / 200ms; reduced-motion static.'}},
};
