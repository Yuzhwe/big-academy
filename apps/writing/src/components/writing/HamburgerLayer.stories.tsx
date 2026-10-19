import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HamburgerLayer } from './HamburgerLayer';

const meta = {
  title: 'Writing/HamburgerLayer',
  component: HamburgerLayer,
  args: {
    layerId: 'opinion',
    label: 'Top bun: My opinion',
    value: '',
    editable: true,
    part: 'top',
    placeholder: 'Yes or no? What do you think?',
    locale: 'en',
  },
} satisfies Meta<typeof HamburgerLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Focused: Story = {
  args: { value: 'I think our school should have a garden' },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <HamburgerLayer {...args} value={value} onChange={setValue} />;
  },
};

export const ReadOnly: Story = {
  args: {
    layerId: 'reason1',
    label: 'Reason 1',
    value: 'It gives us real work.',
    editable: false,
    part: 'fill',
  },
};

export const LongContent: Story = {
  args: {
    layerId: 'detail1',
    part: 'fill',
    label: 'Detail / example for reason 1',
    value:
      'Students could plant vegetables, measure how they grow, and use that work when they explain their opinion in a paragraph.',
  },
};
