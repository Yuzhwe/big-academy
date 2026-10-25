import type { Meta, StoryObj } from '@storybook/react-vite';
import { UnitMilestone } from './UnitMilestone';

const meta = {
  title: 'Writing/Path/UnitMilestone',
  component: UnitMilestone,
  parameters: { ba: { contractId: 'BA-WR-006', status: 'candidate-warm-frame', owner: 'Writing', purpose: 'Unit completion and celebration entry' } },
  args: {
    unitId: 'G2-O',
    title: 'Opinion Paragraph',
    completed: false,
    celebrationEligible: false,
  },
} satisfies Meta<typeof UnitMilestone>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Upcoming: Story = {};
export const FirstReturn: Story = { args: { completed: true, celebrationEligible: true } };
export const ManualReplay: Story = { args: { completed: true, celebrationEligible: false } };
