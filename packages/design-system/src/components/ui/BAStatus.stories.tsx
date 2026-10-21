import type {Meta,StoryObj} from '@storybook/react-vite';
import {BAStatus} from './BAStatus';
const meta={title:'UI/BAStatus',component:BAStatus,args:{tone:'information',children:'Read the instruction before answering.'}} satisfies Meta<typeof BAStatus>;
export default meta;type Story=StoryObj<typeof meta>;
export const Information:Story={};
export const Hint:Story={args:{tone:'hint',children:'Look for the opinion word.'}};
export const Correct:Story={args:{tone:'correct',children:'You found the right answer.'}};
export const Incorrect:Story={args:{tone:'incorrect',children:'Read the question again.'}};
export const Revealed:Story={args:{tone:'revealed',children:'Right answer shown.'}};
