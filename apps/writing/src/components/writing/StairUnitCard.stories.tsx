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
  parameters: { ba: { contractId: 'BA-WR-007', status: 'ready-for-visual-review', owner: 'Writing', purpose: 'One folded Unit card used in both the library and Staircase; simplified caption + pill' }, layout: 'centered' },
  args: { unit, locale: 'en' },
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
