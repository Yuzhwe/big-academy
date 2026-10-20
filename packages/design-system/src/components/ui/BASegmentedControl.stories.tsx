import type { Meta, StoryObj } from '@storybook/react-vite';
import { BAIcon } from './BAIcon';
import { BASegmentedControl } from './BASegmentedControl';

const opts = [{id:'day',label:'Day'},{id:'week',label:'Week'},{id:'month',label:'Month'},{id:'year',label:'Year'}];

const meta = {
  title:'UI/BASegmentedControl · Figma V1',
  component:BASegmentedControl,
  args:{'aria-label':'Period', options:opts, defaultSelectedKey:'week', size:50, emphasis:'strong',radius:'full',distribution:'hug'}
} satisfies Meta<typeof BASegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const FigmaVariantMatrix: Story = {
  render: () => (
    <div style={{display:'grid',gap:24}}>
      {([36,50,70,90] as const).map(size => <div key={size}>
        <p>{size}px · Strong / Full / Hug</p>
        <BASegmentedControl aria-label={'Period '+size} options={opts} size={size} emphasis="strong"/>
      </div>)}
      <p>Subtle / Standard / Equal</p>
      <BASegmentedControl aria-label="Alignment" options={[{id:'start',label:'Start'},{id:'middle',label:'Middle'},{id:'end',label:'End'}]}
        emphasis="subtle" radius="standard" distribution="equal"/>
      <p>Leading Icon + Text</p>
      <BASegmentedControl aria-label="Format" options={[
        {id:'read',label:'Read',icon:<BAIcon name="book"/>},
        {id:'info',label:'Info',icon:<BAIcon name="info-circle"/>}
      ]}/>
      <p>Icon Only</p>
      <BASegmentedControl aria-label="Tool" options={[
        {id:'read',accessibleLabel:'Read',icon:<BAIcon name="book"/>},
        {id:'settings',accessibleLabel:'Options',icon:<BAIcon name="menu"/>},
      ]}/>
    </div>
  )
};
