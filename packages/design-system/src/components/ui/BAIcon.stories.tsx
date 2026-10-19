import type { Meta, StoryObj } from '@storybook/react-vite';
import { BAIcon, type BAIconName } from './BAIcon';

const names: BAIconName[] = ['check','lock','arrow-left','menu','globe','book','warning-circle','info-circle'];

const meta = {
  title: 'Foundations/BAIcon · Iconoir',
  component: BAIcon,
  args: { name:'check', size:24 },
} satisfies Meta<typeof BAIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const IconoirGallery: Story = {
  render: () => (
    <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
      {names.map(name => <div key={name} style={{ minWidth:100, padding:16, textAlign:'center' }}>
        <BAIcon name={name} size={24} decorative={false} label={name} />
        <p>{name}</p>
      </div>)}
    </div>
  )
};

export const Decorative: Story = {
  args: { name:'check', size:20 },
};
export const NamedIcon: Story = {
  args: { name:'warning-circle', size:24, decorative:false, label:'Important warning' }
};
