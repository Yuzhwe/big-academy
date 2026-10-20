import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BAField } from './BAField';
const meta={title:'UI/BAField',component:BAField,args:{label:'Your writing',value:'',onChange:()=>{}}} satisfies Meta<typeof BAField>;
export default meta;type Story=StoryObj<typeof meta>;
export const Multiline:Story={render:args=>{const [v,set]=useState('I think our school should have a garden.');return <BAField {...args} value={v} onChange={set}/>}};
export const ChineseInput:Story={args:{value:'我们用英文写句子，也保留中文输入法的正常行为。'}};
export const ReadOnly:Story={args:{value:'I believe kids should have a pet at home.',readOnly:true}};
