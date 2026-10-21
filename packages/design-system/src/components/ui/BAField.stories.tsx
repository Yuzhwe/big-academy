import type {Meta,StoryObj} from '@storybook/react-vite';
import {BAField} from './BAField';
const meta={title:'UI/BAField',component:BAField,args:{label:'Your sentence',value:'',onChange:()=>{},description:'Write your answer here.'}} satisfies Meta<typeof BAField>;
export default meta;type Story=StoryObj<typeof meta>;
export const Focus:Story={};
export const Multiline:Story={args:{multiline:true,value:'Our school should have a garden.'}};
export const ChineseInput:Story={args:{label:'你的句子',multiline:true,description:'请在这里写作。'}};
export const ReadOnly:Story={args:{readOnly:true,value:'Submitted writing'}};
