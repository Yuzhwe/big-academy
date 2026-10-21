import type {Meta,StoryObj} from '@storybook/react-vite';
import {StairUnitCard} from './StairUnitCard';
const unit={id:'G2-O',index:1,typeLabel:'Writing',title:'The Hamburger Paragraph',meta:'Practice paragraph writing',goals:['Write clear topic sentences','Add reasons and details']};
const meta={title:'Writing/StairUnitCard',component:StairUnitCard,args:{unit}} satisfies Meta<typeof StairUnitCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const UnitFoldCornerAt200Zoom:Story={};
export const UnitLongChineseCopy:Story={args:{locale:'zh',unit:{...unit,title:'汉堡段落：为我们的校园写出清晰的观点与理由'}}};
export const UnitAllStatuses:Story={args:{status:'locked'}};
