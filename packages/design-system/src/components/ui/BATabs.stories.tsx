import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BATabs, BATabList, BATabPanel } from './BATabs';

const options=[{id:'level-1',label:'L1',accessibleLabel:'Level 1'},
  {id:'level-2',label:'L2',accessibleLabel:'Level 2'},
  {id:'level-3',label:'L3',accessibleLabel:'Level 3'}];

function Example({size=50,emphasis='strong',radius='full'}:
  {size?:36|50|70|90;emphasis?:'strong'|'subtle';radius?:'full'|'standard'}) {
  const [selected,setSelected]=useState('level-2');
  return <BATabs selectedKey={selected} onSelectionChange={setSelected}>
    <BATabList size={size} emphasis={emphasis} radius={radius}
      selectedKey={selected} options={options} aria-label="Level navigation"/>
    <BATabPanel id={selected}><p>Active tab panel: {selected}</p></BATabPanel>
  </BATabs>;
}
const meta={
  title:'UI/BATabs · Segmented visual parity',
  component:BATabs,
  args:{defaultSelectedKey:'level-2',children:<div>Use the interactive stories</div>},
} satisfies Meta<typeof BATabs>;
export default meta;
type Story=StoryObj<typeof meta>;

export const LevelTabs:Story={
  render:()=> <Example/>
};
export const StrongSubtle:Story={
  render:()=> <div style={{display:'grid',gap:32}}>
    <Example size={36}/>
    <Example size={50} emphasis="subtle" radius="standard"/>
    <Example size={70} radius="standard"/>
    <Example size={90}/>
  </div>
};
export const KeyboardFocus:Story={
  render:()=> <div style={{display:'grid',gap:16}}>
    <p>Use Left/Right arrows to change the selected panel.</p>
    <Example size={36} emphasis="subtle"/>
  </div>
};
