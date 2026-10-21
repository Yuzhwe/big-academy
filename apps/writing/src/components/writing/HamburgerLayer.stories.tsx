import type {Meta,StoryObj} from '@storybook/react-vite';
import {HamburgerLayer} from './HamburgerLayer';
const layers=[{id:'topic',title:'Top bun',supporting:'A topic sentence tells the topic and what you think.'},{id:'reasons',title:'Reasons',supporting:'Support your opinion.'},{id:'closing',title:'Closing',supporting:'Bring your ideas together.'}];
const meta={title:'Writing/HamburgerLayer',component:HamburgerLayer,args:{layers,focusId:'topic'}} satisfies Meta<typeof HamburgerLayer>;
export default meta;type Story=StoryObj<typeof meta>;
export const ThreeLayers:Story={};
export const Chinese:Story={args:{locale:'zh'}};
