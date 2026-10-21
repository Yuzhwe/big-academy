import type { Meta, StoryObj } from '@storybook/react-vite';
import {BAChoice} from './BAChoice';
const meta={title:'UI/BAChoice',component:BAChoice,args:{mode:'single',label:'Choose',selectedKeys:[],onChange:()=>{},options:[{key:'a',prefix:'A',label:'An example option'},{key:'b',prefix:'B',label:'A long option with enough words to wrap at smaller responsive widths'}]}} satisfies Meta<typeof BAChoice>;
export default meta;type Story=StoryObj<typeof meta>;
export const Single:Story={};
export const Multiple:Story={args:{mode:'multiple'}};
export const CorrectDim:Story={args:{selectedKeys:['a'],options:[{key:'a',label:'Correct answer',state:'correct'},{key:'b',label:'Distractor',state:'dimmed'}]}};
export const WrongRetry:Story={args:{selectedKeys:['a'],options:[{key:'a',label:'Wrong answer',state:'incorrect'},{key:'b',label:'Right answer',state:'revealed'}]}};
