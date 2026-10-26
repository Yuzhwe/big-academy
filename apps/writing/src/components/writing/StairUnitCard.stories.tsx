import type { Meta, StoryObj } from '@storybook/react-vite';
import { StairUnitCard } from './StairUnitCard';

const unit = {
  id: 'G2-O',
  index: 1,
  typeLabel: 'Writing unit',
  title: 'Opinion Paragraph',
  meta: '9 lessons · 170 mins',
  goals: [
    'write a topic sentence that tells what you think',
    'give two reasons, each with an example, and a closing',
    'help your reader follow you with linking words',
    'fix run-on sentences',
    'plan, write and revise your own paragraph',
  ],
};

const meta = {
  title: 'Writing/Path/StairUnitCard',
  component: StairUnitCard,
  parameters: { ba: { contractId: 'BA-WR-007', status: 'ready-for-visual-review', owner: 'Writing', purpose: 'R04-R2 four-corner rounded Unit target in library; legacy Staircase fold remains until Stage B' }, layout: 'centered' },
  args: { unit, locale: 'en', corner: 'rounded' },
  decorators: [(Story) => <div data-ba-product="writing" style={{ width: 300, background: '#a9e3f3', padding: 32 }}><Story /></div>],
} satisfies Meta<typeof StairUnitCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Chinese: Story = { args: {
  locale: 'zh', unit: { ...unit, title: '观点段落', meta: '9 课 · 170 分钟' },
}};
export const LongTitle: Story = { args: {
  unit: { ...unit, title: 'Writing Convincing Opinion Paragraphs and Evidence' },
}};
export const MinimalInformation: Story = { args: {
  unit: { ...unit, id: 'G0-W', index: 2, title: 'First Sentences', meta: '5 lessons', goals: [] },
}};


export const FourRoundedCornersR2:Story={
  args:{corner:'rounded'},
  parameters:{ba:{contractId:'BA-WR-007',status:'candidate-pending-designer-review',note:'16px all corners, 20px UNIT plus 16px full pill inline, 24px headline. Staircase still folded until Stage B.'}},
};

export const LegacyFoldedBeforeStageB:Story={
 args:{corner:'folded'},
 parameters:{ba:{contractId:'BA-WR-007',status:'legacy-staircase-only',note:'Real Staircase stays on old fold until approved Stage B.'}},
};
