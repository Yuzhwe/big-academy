import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BAPageTransition } from './BAPageTransition';

function Demo({ duration = 500, maxBlur = 12 }: {duration?:number;maxBlur?:number}) {
  const [page, setPage] = useState('staircase');
  const render = (key:string) => <div style={{padding:28,minHeight:210,background:key==='staircase'?'#e5f3d7':'#fff9f2',borderRadius:20}}>
    <h2>{key==='staircase'?'Level 2 · Your lessons':'Lesson 1 · Topic sentences'}</h2>
    <p>{key==='staircase'?'Choose a lesson and enter.':'Read the question and choose your answer.'}</p>
  </div>;
  return <div style={{width:500,maxWidth:'100%',display:'grid',gap:16}}>
    <div style={{display:'flex',gap:8}}>
      <button type="button" onClick={()=>setPage('staircase')}>Staircase</button>
      <button type="button" onClick={()=>setPage('lesson')}>Lesson</button>
    </div>
    <BAPageTransition viewKey={page} renderView={render} duration={duration} maxBlur={maxBlur}/>
  </div>;
}
const meta={
  title:'Writing/Transitions/BAPageTransition',
  component:BAPageTransition,
  args:{viewKey:'staircase',renderView:(key:string)=><div>{key}</div>},
  parameters:{ba:{contractId:'BA-WR-012',status:'candidate-pending-designer-review',purpose:'Self-contained Cross Blur prototype; not connected to Writing routing.'}},
} satisfies Meta<typeof BAPageTransition>;
export default meta;
type Story=StoryObj<typeof meta>;
export const StaircaseToLesson:Story={render:()=> <Demo/>};
export const ActivityToActivity:Story={render:()=> <Demo duration={300} maxBlur={6}/>};
export const NoMotion:Story={render:()=> <Demo duration={0} maxBlur={0}/>};
