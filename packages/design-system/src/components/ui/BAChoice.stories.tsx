import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BAChoice, type ChoiceOption } from './BAChoice';

const lines: ChoiceOption[] = [
  { id: '0', letter: 'A', label: 'Gardens have plants.' },
  { id: '1', letter: 'B', label: 'Our school should have a garden for two big reasons.' },
  { id: '2', letter: 'C', label: 'I like flowers.' },
];

const longLine: ChoiceOption[] = [
  {
    id: '0',
    letter: 'A',
    label:
      'Our school should have a garden for two big reasons, and the sentence keeps going so the option has to wrap onto a second line without clipping the letter.',
  },
  { id: '1', letter: 'B', label: 'Gardens have plants.' },
];

const meta = {
  title: 'UI/BAChoice',
  component: BAChoice,
  args: {
    choiceMode: 'single',
    options: lines,
    selectedKeys: [],
    'aria-label': 'Which one is a good topic sentence?',
  },
} satisfies Meta<typeof BAChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

function SingleDemo() {
  const [keys, setKeys] = useState<string[]>([]);
  return (
    <BAChoice
      choiceMode="single"
      options={lines}
      selectedKeys={keys}
      onChange={setKeys}
      aria-label="Which one is a good topic sentence?"
    />
  );
}

export const Single: Story = {
  args: { choiceMode: 'single', options: lines, selectedKeys: [], 'aria-label': 'Topic sentence' },
  render: () => <SingleDemo />,
};

function MultipleDemo() {
  const [keys, setKeys] = useState<string[]>(['0']);
  return (
    <BAChoice
      choiceMode="multiple"
      options={lines}
      selectedKeys={keys}
      onChange={setKeys}
      aria-label="Tap every opinion"
    />
  );
}

export const Multiple: Story = {
  args: { choiceMode: 'multiple', options: lines, selectedKeys: ['0'], 'aria-label': 'Opinions' },
  render: () => <MultipleDemo />,
};

export const ChoiceSelectedBeforeCheck: Story = {
  args: {
    choiceMode: 'single',
    options: lines.map((option) => ({ ...option, state: option.id === '1' ? 'selected' : 'idle' })),
    selectedKeys: ['1'],
    'aria-label': 'Selected before check',
  },
};

export const WrongRetry: Story = {
  args: {
    choiceMode: 'single',
    options: lines.map((option) => ({ ...option, state: option.id === '0' ? 'wrong' : 'idle' })),
    selectedKeys: [],
    'aria-label': 'Wrong retry',
  },
};

export const ChoiceWrongFilled: Story = {
  args: {
    choiceMode: 'single',
    options: lines.map((option) => ({ ...option, state: option.id === '2' ? 'wrong' : 'idle' })),
    selectedKeys: [],
    'aria-label': 'Wrong filled',
  },
};

export const ChoiceCorrectFilled: Story = {
  args: {
    choiceMode: 'single',
    options: lines.map((option) => ({ ...option, state: option.id === '1' ? 'correct' : 'dim' })),
    selectedKeys: ['1'],
    feedback: { correctAppearance: 'filled' },
    disabled: true,
    'aria-label': 'Correct filled',
  },
};

export const ChoiceCorrectOutlined: Story = {
  args: {
    choiceMode: 'single',
    options: lines.map((option) => ({ ...option, state: option.id === '1' ? 'correct' : 'dim' })),
    selectedKeys: ['1'],
    feedback: { correctAppearance: 'outlined' },
    disabled: true,
    'aria-label': 'Correct outlined',
  },
};

export const CorrectDim: Story = {
  args: {
    choiceMode: 'single',
    options: lines.map((option) => ({ ...option, state: option.id === '1' ? 'correct' : 'dim' })),
    selectedKeys: ['1'],
    disabled: true,
    'aria-label': 'Correct with dim neighbours',
  },
};

export const ChoiceDimmed: Story = {
  args: {
    choiceMode: 'single',
    options: lines.map((option) => ({ ...option, state: 'dim' as const })),
    selectedKeys: [],
    disabled: true,
    'aria-label': 'Dimmed options',
  },
};

export const ShownReveal: Story = {
  args: {
    choiceMode: 'single',
    options: lines.map((option) => ({
      ...option,
      state: option.id === '1' ? 'shown' : option.id === '0' ? 'wrong' : 'dim',
    })),
    selectedKeys: [],
    disabled: true,
    'aria-label': 'Revealed answer',
  },
};

export const TapwordTokens: Story = {
  args: {
    choiceMode: 'single',
    options: lines,
    selectedKeys: [],
    'aria-label': 'Tapword is not a choice list',
  },
  render: () => (
    <p>
      Passage tapword stays a template control. It is not a BAChoice list. The activity reuses the same state words
      (selected, wrong, shown) without sending sentence tokens through this API.
    </p>
  ),
};

export const ChoiceLongWrapped: Story = {
  args: {
    choiceMode: 'single',
    options: longLine.map((option) => ({ ...option, state: option.id === '0' ? 'selected' : 'idle' })),
    selectedKeys: ['0'],
    'aria-label': 'Wrapped choice',
  },
};
