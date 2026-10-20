import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActivityScreenIndicator, BATaskProgress } from './BATaskProgress';
const meta={title:'UI/ActivityScreenIndicator',component:ActivityScreenIndicator,args:{screenNumber:1,progressStatus:'incomplete',isSelected:false,canOpen:true,label:'Screen 1'}} satisfies Meta<typeof ActivityScreenIndicator>;
export default meta;type Story=StoryObj<typeof meta>;
export const IndicatorStates:Story={render:()=> <div style={{display:'flex',gap:16}}>{(['incomplete','done','locked','skipped'] as const).map((status,i)=><ActivityScreenIndicator key={status} screenNumber={i+1} progressStatus={status} isSelected={false} canOpen={status!=='locked'} label={status}/>)}</div>};
export const DoneSelected:Story={args:{progressStatus:'done',isSelected:true}};
export const Regular:Story={args:{size:'regular'}};
export const Shown:Story={args:{progressStatus:'done',answerRevealed:true}};
export const Overflow16Screens:Story={render:()=> <div style={{width:280}}><BATaskProgress tasks={Array.from({length:16},(_,i)=>({id:String(i),label:`Activity ${i+1}`,status:i<5?'done':i===5?'current':'locked'}))} activeIndex={5} canOpen={i=>i<=5}/></div>};
