import type {Meta,StoryObj} from '@storybook/react-vite';
import {StairLevelIntroCard} from './StairLevelIntroCard';
const meta={title:'Writing/StairLevelIntroCard',component:StairLevelIntroCard,args:{text:'Level 2 · Paragraph Starter'}} satisfies Meta<typeof StairLevelIntroCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const LevelIntroDecorativeBorder:Story={};
export const LongLevelIntroAndGradient:Story={args:{text:'Read, choose, practise and write a clear paragraph with a topic sentence, reasons and details.'}};
