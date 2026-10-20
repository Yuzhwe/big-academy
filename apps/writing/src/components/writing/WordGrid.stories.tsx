import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WordGrid } from './WordGrid';
const meta={title:'Writing/WordGrid',component:WordGrid,args:{groups:[{id:'opinion',label:'Opinion',words:['I','think','believe','should']},{id:'nouns',label:'Nouns',words:['garden','science','plants']}],activeGroup:'opinion',onGroupChange:()=>{},onInsert:()=>{}}} satisfies Meta<typeof WordGrid>;
export default meta;type Story=StoryObj<typeof meta>;
export const MultiGroup:Story={render:args=>{const [tab,set]=useState('opinion');return <WordGrid {...args} activeGroup={tab} onGroupChange={set}/>}};
