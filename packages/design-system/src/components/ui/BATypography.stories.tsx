import type { Meta, StoryObj } from '@storybook/react-vite';
import { BANumber, BAText } from './BATypography';

const meta = {
  title:'Foundations/BATypography',
  component:BAText,
  args:{ as:'span', textRole:'body', children:'Learning by writing' },
} satisfies Meta<typeof BAText>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RoleGallery: Story = {
  render: () => (
    <div style={{ display:'grid', gap:20, maxWidth:680 }}>
      <BAText as="h1" textRole="display">Write your next story</BAText>
      <BAText as="h2" textRole="heading">A reason to write</BAText>
      <BAText as="p" textRole="body">Make your ideas clear by adding reasons and examples.</BAText>
      <BAText textRole="control">Next · Check answer</BAText>
      <BAText textRole="supporting">Follow the steps to complete your paragraph.</BAText>
      <BAText textRole="caption">Draft · Candidate numerical metrics</BAText>
      <BANumber>0123456789</BANumber>
    </div>
  )
};
export const ChineseFallback: Story = {
  render: () => (
    <div lang="zh-CN" style={{ display:'grid', gap:16 }}>
      <BAText as="h2" textRole="heading">学习如何表达观点</BAText>
      <BAText as="p" textRole="body">阅读提示，然后按步骤写出一个段落。</BAText>
      <BANumber>0123456789</BANumber>
      <small>Douyin family depends on availability/license; fallback is expected.</small>
    </div>
  )
};
