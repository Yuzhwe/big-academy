import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StairLessonCard, type StairLessonState } from './StairLessonCard';
import { LandscapeTerrace } from './LandscapeTerrace';

const meta = {
  title: 'Writing/Path/StairLessonCard',
  component: StairLessonCard,
  parameters: { ba: { contractId: 'BA-WR-005', status: 'ready-for-visual-review', owner: 'Writing', purpose: 'Lesson entry, continue, review and locked states' }, layout: 'centered' },
  args: {
    lessonId: 'G2-O:1', number: 1, title: 'Topic sentences',
    state: 'start', minutes: 10, locale: 'en',
  },
  argTypes: {
    state: { control: 'select', options: ['start', 'continue', 'review', 'locked', 'skipped'] },
    locale: { control: 'radio', options: ['en', 'zh'] },
  },
} satisfies Meta<typeof StairLessonCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Start: Story = {};
export const Continue: Story = { args: { state: 'continue' } };
export const Review: Story = { args: { state: 'review' } };
export const Locked: Story = { args: { state: 'locked', number: 2 } };
export const Skipped: Story = { args: { state: 'skipped' } };
export const LongTitle: Story = { args: { title: 'Writing a convincing topic sentence for a detailed opinion paragraph with evidence', minutes: 15 } };
export const Chinese: Story = { args: { locale: 'zh', title: '学习如何用完整的主题句介绍自己的观点和原因', minutes: 12 } };

export const InteractiveAllStates: Story = {
  render: (args) => {
    function Live() {
      const [state, setState] = useState<StairLessonState>('start');
      const [presses, setPresses] = useState(0);
      return <div style={{ display: 'grid', gap: 16 }}>
        <label>Card state <select value={state} onChange={e => setState(e.target.value as StairLessonState)}>
          {(['start','continue','review','locked','skipped'] as const).map(s => <option key={s}>{s}</option>)}
        </select></label>
        <StairLessonCard {...args} state={state} onEnter={() => setPresses(p => p + 1)} />
        <output aria-live="polite">CTA pressed: {presses}</output>
      </div>;
    }
    return <Live />;
  },
};
export const FullComposition: Story = {
  render: (args) => <div data-ba-product="writing" style={{ padding: '48px 56px 88px', background: 'linear-gradient(135deg,#85DBF9,#F8F4ED)' }}>
    <div style={{ position: 'relative', width: 260 }}>
      <StairLessonCard {...args} />
      <LandscapeTerrace />
    </div>
  </div>,
};
export const CardOnly: Story = { render: args => <StairLessonCard {...args}/> };
export const KeyboardFocus: Story = {
  render: args => <div style={{ display: 'grid', gap: 16 }}><p>Tab to the real CTA. Locked cards are not focusable.</p><StairLessonCard {...args}/></div>,
};


export const R2ThreeLines: Story = {args:{titleLines:3,title:'Writing a convincing topic sentence for a detailed opinion paragraph with evidence'}};
export const R2CurrentStart: Story = {args:{titleLines:3,current:true,state:'start'}};
export const R2CurrentContinue: Story = {args:{titleLines:3,current:true,state:'continue'}};
