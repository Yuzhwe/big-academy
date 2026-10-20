import type {Meta,StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {BATabs,BATabList,BATabPanel} from './BATabs';
import {BASegmentedControl} from './BASegmentedControl';

const names=[{id:'one',label:'Overview'},{id:'two',label:'Exercises'},{id:'three',label:'Notes'}];
function Sample({size=50,emphasis='strong' as const,radius='full' as const}){
  const [selected,setSelected]=useState('one');
  return <BATabs selectedKey={selected} onSelectionChange={setSelected}>
    <BATabList aria-label="Lesson sections" selectedKey={selected} items={names}
      size={size as 36|50|70|90} emphasis={emphasis} radius={radius}/>
    <BATabPanel id="one"><p>Overview content panel</p></BATabPanel>
    <BATabPanel id="two"><p>Exercises content panel</p></BATabPanel>
    <BATabPanel id="three"><p>Notes content panel</p></BATabPanel>
  </BATabs>;
}
const meta={title:'UI/BATabs · Shared Segmented Visuals',component:BATabs,args:{children:null}} satisfies Meta<typeof BATabs>;
export default meta;
type Story=StoryObj<typeof meta>;
export const ManyGroups:Story={render:()=><div style={{display:'grid',gap:24}}>{([36,50,70,90] as const).map(size=><div key={size}><strong>{size}px</strong><Sample size={size}/></div>)}</div>};
export const KeyboardFocus:Story={render:()=><Sample/>};
export const LongLabels:Story={render:()=><BATabs defaultSelectedKey="long">
  <BATabList aria-label="Lesson goals" selectedKey="long" items={[{id:'long',label:'My complete first paragraph'},{id:'short',label:'Review'}]} radius="standard"/>
  <BATabPanel id="long">My paragraph lesson</BATabPanel><BATabPanel id="short">Review material</BATabPanel>
</BATabs>};
export const SharedVisualComparison:Story={render:()=><div data-ba-product="writing" style={{display:'flex',gap:32,flexWrap:'wrap'}}>
  <div><h3>Real Tabs</h3><Sample/></div>
  <div><h3>Local Segmented</h3><BASegmentedControl aria-label="Local timespan" options={names}/></div>
</div>};
