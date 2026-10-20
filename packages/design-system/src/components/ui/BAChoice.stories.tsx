import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { BAChoice, type BAChoiceOption } from './BAChoice';

const lines: BAChoiceOption[] = [
  { id: '0', marker: 'A', text: 'Gardens have plants.' },
  { id: '1', marker: 'B', text: 'Our school should have a garden for two big reasons.' },
  { id: '2', marker: 'C', text: 'I like flowers.' },
];

const meta = {
  title: 'UI/BAChoice',
  component: BAChoice,
  args: {
    mode: 'single',
    label: 'Which one is a good topic sentence?',
    options: lines,
    selectedIds: [],
    disabled: false,
    onChange: () => undefined,
  },
} satisfies Meta<typeof BAChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string[]>([]);
    return <BAChoice {...args} selectedIds={selected} onChange={setSelected} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole('radio', { name: /Our school should have a garden/ });
    await userEvent.click(option);
    await expect(option).toBeChecked();
  },
};

export const Multiple: Story = {
  args: { mode: 'multiple', label: 'Tap every opinion.' },
  render: (args) => {
    const [selected, setSelected] = useState<string[]>(['0']);
    return <BAChoice {...args} selectedIds={selected} onChange={setSelected} />;
  },
};

export const WrongRetry: Story = {
  args: {
    selectedIds: [],
    options: [
      { id: '0', marker: 'A', text: 'Gardens have plants.', visual: 'incorrect', mark: 'Your answer' },
      { id: '1', marker: 'B', text: 'Our school should have a garden for two big reasons.' },
      { id: '2', marker: 'C', text: 'I like flowers.' },
    ],
  },
};

export const CorrectDim: Story = {
  args: {
    disabled: true,
    selectedIds: ['1'],
    options: [
      { id: '0', marker: 'A', text: 'Gardens have plants.', visual: 'dim' },
      { id: '1', marker: 'B', text: 'Our school should have a garden for two big reasons.', visual: 'correct', mark: 'Your answer · right' },
      { id: '2', marker: 'C', text: 'I like flowers.', visual: 'dim' },
    ],
  },
};

export const FocusVisible: Story = {
  render: (args) => <BAChoice {...args} onChange={() => undefined} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const option = canvas.getAllByRole('radio')[0];
    await expect(option).toHaveFocus();
    await expect(option.closest('.ba-choice__option')).toHaveAttribute('data-focus-visible', 'true');
  },
};

export const Multiline: Story = {
  args: {
    options: [
      {
        id: '0',
        marker: 'A',
        text: 'This answer wraps onto a second line so the letter stays with the first line of text and the row grows past fifty pixels.',
      },
      { id: '1', marker: 'B', text: 'Short answer.' },
    ],
  },
};
