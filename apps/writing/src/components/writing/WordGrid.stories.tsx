import type {Meta,StoryObj} from '@storybook/react-vite';
import {WordGrid} from './WordGrid';
const meta={title:'Writing/WordGrid',component:WordGrid,args:{activeGroup:'a',groups:[{id:'a',label:'Opinion',words:[{id:'think',text:'I think'},{id:'should',text:'should'}]},{id:'b',label:'Nouns',words:[{id:'garden',text:'garden'}]}],onGroupChange:()=>{},onInsert:()=>{}}} satisfies Meta<typeof WordGrid>;
export default meta;type Story=StoryObj<typeof meta>;
export const MultiGroup:Story={};
export const OneGroupNoTab:Story={args:{groups:[{id:'a',label:'Words',words:[{id:'a',text:'Our school'},{id:'b',text:'should'}]}]}};
export const Locked:Story={args:{disabled:true}};
export const Chinese:Story={args:{locale:'zh'}};
