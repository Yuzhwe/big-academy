import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BAChoice, type BAChoiceProps } from './BAChoice';
const options = ['Gardens have plants.', 'Our school should have a garden for two big reasons.', 'I like flowers.'].map((text, i) => ({ id:String(i),text }));
const meta = {title:'UI/BAChoice',component:BAChoice,args:{label:'Choose a topic sentence',choiceMode:'single',options,selectedKeys:[],onChange:()=>{}}} satisfies Meta<typeof BAChoice>;
export default meta; type Story=StoryObj<typeof meta>;
function Interactive(props:BAChoiceProps){const [keys,setKeys]=useState<string[]>([]);return <BAChoice {...props} selectedKeys={keys} onChange={setKeys}/>}
export const Single:Story={render:args=><Interactive {...args}/>};
export const Multiple:Story={args:{choiceMode:'multiple'},render:args=><Interactive {...args}/>};
export const WrongRetry:Story={args:{options:options.map((o,i)=>({...o,state:i===0?'wrong':'idle',stateLabel:i===0?'Try again':undefined}))}};
export const CorrectDim:Story={args:{disabled:true,selectedKeys:['1'],options:options.map((o,i)=>({...o,state:i===1?'correct':'dim',stateLabel:i===1?'Your answer · right':undefined}))}};
export const Revealed:Story={args:{disabled:true,selectedKeys:['0'],options:options.map((o,i)=>({...o,state:i===1?'revealed':i===0?'wrong':'dim',stateLabel:i===1?'Right answer':i===0?'Your answer · look again':undefined}))}};
export const LongChinese:Story={args:{options:[{id:'0',text:'这是一个需要换行显示的长选项，用于确认触控目标、首行对齐和中文阅读体验。'}]}};
