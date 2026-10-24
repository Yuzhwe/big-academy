import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BAChoice, type BAChoiceProps, type ChoiceOption, type ChoiceVisualState } from './BAChoice';
const en: ChoiceOption[] = [
  { id: 'a', letter: 'A', text: 'Gardens have plants.' },
  { id: 'b', letter: 'B', text: 'Our school should have a garden for two big reasons.' },
  { id: 'c', letter: 'C', text: 'I think a garden gives students a quiet place to learn, grow, and spend time together after school.' },
];
const zh: ChoiceOption[] = [
  { id: 'a', letter: 'A', text: '学校里有一些植物。' },
  { id: 'b', letter: 'B', text: '我认为我们学校应该建一个花园，因为它能让每个人有机会在安静的环境中学习和探索。' },
  { id: 'c', letter: 'C', text: '我喜欢花。' },
];
const meta = {
  title: 'Workbench / 03 · Choice (BA-UI-003)',
  component: BAChoice,
  args: { choiceMode: 'single', options: en, selectedKeys: [], 'aria-label': 'Choose an answer' },
  argTypes: { choiceMode: { control: 'radio', options: ['single', 'multiple'] } },
} satisfies Meta<typeof BAChoice>;
export default meta;
type Story = StoryObj<typeof meta>;
const inert = (state: ChoiceVisualState): ChoiceOption[] => en.map((option,i) => ({ ...option, state: i === 0 ? state : 'default' }));
export const Default: Story = {};
export const Selected: Story = { args: { selectedKeys: ['a'] } };
export const Correct: Story = { args: { selectedKeys: ['a'], options: inert('correct'), disabled: true } };
export const CorrectUnselected: Story = { args: { options: inert('correctUnselected'), disabled: true } };
export const Wrong: Story = { args: { selectedKeys: ['a'], options: inert('wrong'), disabled: true } };
export const Dim: Story = { args: { options: inert('dim'), disabled: true } };
export const Disabled: Story = { args: { disabled: true } };
export const LongText: Story = { args: { options: en } };
export const Chinese: Story = { render: args => <div lang="zh-CN" data-ba-product="writing" style={{ width: 'min(100%,560px)' }}><BAChoice {...args} options={zh} aria-label="请选择答案"/></div> };
export const FocusVisible: Story = { render: args => <div><p>Tab / arrow keys for single choice; Space toggles multiple.</p><BAChoice {...args}/></div> };

function InteractiveChoice({choiceMode = 'single',options = en, disabled = false, ...props}: BAChoiceProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [graded, setGraded] = useState(false);
  const gradedOptions = graded ? options.map(o => ({
    ...o, state: o.id === 'b' ? (selectedKeys.includes('b') ? 'correct' : 'correctUnselected') as const :
      (selectedKeys.includes(o.id) ? 'wrong' : 'dim') as const,
  })) : options;
  return <div data-ba-product="writing" style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
    <BAChoice {...props} aria-label="Choose an answer" choiceMode={choiceMode} options={gradedOptions}
      disabled={disabled || graded} selectedKeys={selectedKeys} onChange={setSelectedKeys}/>
    <div style={{display:'flex',gap:12}}>
      <button type="button" onClick={() => setGraded(true)} disabled={graded || selectedKeys.length === 0}>Check</button>
      <button type="button" onClick={() => {setGraded(false);setSelectedKeys([]);}}>Reset</button>
    </div>
    <output aria-live="polite">{graded ? selectedKeys.includes('b') ? 'Correct option selected' : 'Try the correct option shown in green' : selectedKeys.length + ' selected'}</output>
  </div>;
}
export const SingleInteractive: Story = { render: args => <InteractiveChoice {...args} choiceMode="single"/> };
export const MultipleInteractive: Story = { render: args => <InteractiveChoice {...args} choiceMode="multiple"/> };
export const Single = SingleInteractive;
export const Multiple = MultipleInteractive;

