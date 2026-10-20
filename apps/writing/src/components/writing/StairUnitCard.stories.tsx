import type { Meta,StoryObj } from '@storybook/react-vite';
import { StairUnitCard } from './StairUnitCard';
import '../../course/course.css';
const meta={title:'Writing/StairUnitCard',component:StairUnitCard,args:{id:'G2-O',number:1,title:'Opinion Paragraph',typeLabel:'Writing unit',meta:'0 of 9 lessons · about 170 min',state:'current'},decorators:[Story=><div className="course-app" data-ba-product="writing" style={{width:260}}><Story/></div>]} satisfies Meta<typeof StairUnitCard>;
export default meta;type Story=StoryObj<typeof meta>;
export const Current:Story={};export const Done:Story={args:{state:'done',meta:'9 of 9 lessons · about 170 min'}};export const Locked:Story={args:{state:'locked'}};
export const LongEnglish:Story={args:{title:'A longer unit title that wraps across multiple lines'}};export const LongChinese:Story={args:{title:'这是一个需要多行显示的中文写作单元标题',locale:'zh',meta:'已完成 0 / 9 课 · 约 170 分钟'}};
