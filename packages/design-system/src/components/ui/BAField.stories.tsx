import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { BAField } from './BAField';

const meta = {
  title: 'UI/BAField',
  component: BAField,
  args: {
    value: '',
    label: 'Your sentence',
    multiline: true,
    readOnly: false,
    onChange: () => undefined,
  },
} satisfies Meta<typeof BAField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Multiline: Story = {
  render: (args) => {
    const [value, setValue] = useState('In my opinion, recess should ___ because ___.');
    return <BAField {...args} value={value} onChange={setValue} />;
  },
};

export const ChineseInput: Story = {
  render: (args) => {
    const [value, setValue] = useState('我认为课间应该更长，因为孩子们需要跑步。');
    return <BAField {...args} label="你的句子" value={value} onChange={setValue} />;
  },
};

export const Focus: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <BAField {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: 'Your sentence' })).toHaveFocus();
  },
};

export const ReadOnly: Story = {
  args: {
    value: 'Our school should have a garden for two big reasons.',
    readOnly: true,
    multiline: false,
  },
};
