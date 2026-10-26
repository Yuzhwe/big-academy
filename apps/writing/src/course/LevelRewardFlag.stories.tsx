import type { Meta, StoryObj } from '@storybook/react-vite';
import { LevelRewardFlag } from './LevelRewardFlag';
import './StaircaseScene.css';

/** Existing R2.12 SVG, not redesigned. CSS --ba-path-flag-wind is adjustable
 * in the designer library; this Storybook view proves reuse of the source. */
const meta={
  title:'Writing/Path/LevelRewardFlag',
  component:LevelRewardFlag,
  parameters:{ba:{contractId:'BA-WR-011',status:'candidate-pending-designer-review',owner:'Writing',purpose:'R2.12 SVG with existing 4% cloth wind and reduced-motion fallback'}},
  decorators:[(Story)=><div data-ba-product="writing" style={{padding:48,background:'linear-gradient(135deg,#9fdcf0,#f6e6a8)',borderRadius:22,width:320}}>
    <div style={{'--ba-path-flag-wind':0.04} as React.CSSProperties}><Story/></div>
  </div>],
} satisfies Meta<typeof LevelRewardFlag>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const ReducedMotion:Story={
  parameters:{chromatic:{disableSnapshot:false},ba:{note:'Enable OS reduce-motion or Library mode=reduce to inspect static cloth.'}},
};
