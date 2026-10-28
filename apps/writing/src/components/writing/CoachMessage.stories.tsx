import type {Meta,StoryObj} from '@storybook/react-vite';
import {CoachMessage} from './LessonWorkspace';
const meta={title:'Writing/Shell/CoachMessage',component:CoachMessage,args:{children:'Look for a word that shows an opinion.',tone:'hint'},parameters:{ba:{contractId:'BA-WR-014',status:'in-review'}}} satisfies Meta<typeof CoachMessage>;
export default meta;
type Story=StoryObj<typeof meta>;
export const AllStates:Story={render:()=><div style={{width:360,maxWidth:'100%'}}>
  <CoachMessage>Read the question and choose your answer.</CoachMessage>
  <CoachMessage tone="hint">Look for a word that shows an opinion.</CoachMessage>
  <CoachMessage tone="correct">You found the topic sentence.</CoachMessage>
  <CoachMessage tone="wrong">Try again. Which sentence shows an opinion?</CoachMessage>
</div>};
export const Chinese:Story={args:{locale:'zh',children:'找出表达作者观点的词。'}};
