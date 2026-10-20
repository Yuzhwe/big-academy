import type { Meta, StoryObj } from '@storybook/react-vite';
import { CourseApp } from '../../course/CourseApp';
const meta={title:'Writing/LessonActivity',component:CourseApp,parameters:{layout:'fullscreen'}} satisfies Meta<typeof CourseApp>;
export default meta;type Story=StoryObj<typeof meta>;
/** Real course and storage. Use Start, then finish each interaction to review all eight screens. */
export const EightScreenJourney:Story={};
