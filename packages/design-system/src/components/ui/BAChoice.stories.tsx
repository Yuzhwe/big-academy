import type { Meta, StoryObj } from '@storybook/react-vite';
import { BAChoice, type ChoiceOption } from './BAChoice';

const short: ChoiceOption[] = [
  { id: '0', letter: 'A', text: 'Gardens have plants.' },
  { id: '1', letter: 'B', text: 'Our school should have a garden for two big reasons.' },
  { id: '2', letter: 'C', text: 'I like flowers.' },
];

const long: ChoiceOption[] = [
  {
    id: '0',
    letter: 'A',
    text: 'I think living in a village is better than living in a city because the streets are quiet and I can see the fields from my window.',
  },
  { id: '1', letter: 'B', text: 'Cities have tall buildings.' },
];

const meta = {
  title: 'UI/BAChoice',
  component: BAChoice,
  args: {
    choiceMode: 'single',
    options: short,
    selectedKeys: [],
    'aria-label': 'Choice',
  },
} satisfies Meta<typeof BAChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};
export const Multiple: Story = { args: { choiceMode: 'multiple', selectedKeys: ['0', '2'] } };
export const ChoiceSelectedBeforeCheck: Story = { args: { selectedKeys: ['1'] } };
export const ChoiceWrongFilled: Story = {
  args: {
    disabled: true,
    selectedKeys: [],
    options: short.map((option) => ({ ...option, state: option.id === '0' ? 'wrong' : 'default' })),
  },
};
export const WrongRetry: Story = {
  args: {
    choiceMode: 'multiple',
    selectedKeys: ['0', '1'],
    options: short.map((option) => ({ ...option, state: option.id === '1' ? 'wrong' : undefined })),
  },
};
export const ChoiceCorrectFilled: Story = {
  args: {
    disabled: true,
    selectedKeys: ['1'],
    options: short.map((option) => ({ ...option, state: option.id === '1' ? 'correct' : 'dim' })),
  },
};
export const CorrectDim: Story = {
  args: {
    disabled: true,
    selectedKeys: ['1'],
    options: short.map((option) => ({ ...option, state: option.id === '1' ? 'correct' : 'dim' })),
  },
};
export const ChoiceCorrectOutlined: Story = {
  args: {
    disabled: true,
    selectedKeys: ['0'],
    options: [
      { ...short[0], state: 'wrong' },
      { ...short[1], state: 'shown' },
      { ...short[2], state: 'dim' },
    ],
  },
};
export const ChoiceDimmed: Story = {
  args: {
    disabled: true,
    options: short.map((option) => ({ ...option, state: 'dim' as const })),
  },
};
export const ChoiceLongWrapped: Story = { args: { options: long, selectedKeys: ['0'] } };
export const TapwordTokens: Story = {
  args: {
    options: [{ id: 'note', letter: '—', text: 'Tapword is a sentence token, not this option row.' }],
  },
};
