import type { Meta, StoryObj } from '@storybook/react-vite';
import { HamburgerLayer } from './HamburgerLayer';

const meta = {
  title: 'Writing/Activities/HamburgerLayer',
  component: HamburgerLayer,
  parameters: { ba: { contractId: 'BA-WR-004', status: 'candidate-pending-designer-review', owner: 'Writing', purpose: 'Paragraph layer content and emphasis' } },
  args: {
    layerId: 'top',
    label: 'Top bun: My opinion',
    value: 'A topic sentence tells the topic and what you think.',
    emphasis: true,
  },
} satisfies Meta<typeof HamburgerLayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TopBun: Story = {};
export const Reason: Story = {
  args: { layerId: 'fill', label: 'Reason 1', value: 'Why? (a few words)', emphasis: false },
};
