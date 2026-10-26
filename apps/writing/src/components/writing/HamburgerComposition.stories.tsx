import type { Meta, StoryObj } from '@storybook/react-vite';
import { HamburgerComposition } from './HamburgerComposition';

const layers=[
  { layerId:'top',label:'Top bun · Opinion',value:'Our school should have a garden.' },
  { layerId:'fill',label:'Reason',value:'A garden helps us learn about plants and work together.' },
  { layerId:'bottom',label:'Bottom bun · Closing',value:'That is why our school needs a garden.' },
];
const meta={
  title:'Writing/Activities/HamburgerComposition',
  component:HamburgerComposition,
  parameters:{ ba:{contractId:'BA-WR-004',status:'candidate-pending-designer-review',owner:'Writing',purpose:'Three-layer composition with narrow buns and vertically centered title + example.'} },
  args:{ layers },
  decorators:[(Story)=><div data-ba-product="writing" style={{width:340,padding:16}}><Story/></div>],
} satisfies Meta<typeof HamburgerComposition>;
export default meta;
type Story=StoryObj<typeof meta>;
export const AllThreeLayers:Story={};
export const LongExample:Story={args:{layers:layers.map((layer,i)=>({...layer,value:i===1?layer.value+' It gives students a quiet place to study outdoors and share interesting discoveries.':layer.value}))}};


export const ExactHighFidelityColors:Story={
  parameters:{ba:{contractId:'BA-WR-004',status:'candidate-pending-designer-review',note:'Top green #E7F6DF / Reason #F3EFE4 / Bottom #E7C48A; 88:100:88 widths'}},
};
