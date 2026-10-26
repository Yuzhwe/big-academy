import type { Meta, StoryObj } from '@storybook/react-vite';
import { LevelRewardFlag, FLAG_DEFAULTS } from './LevelRewardFlag';
import './StaircaseScene.css';

/** BA-WR-011 Canvas vertical column wave, adapted after yarden.
 * Stack Overflow 78383275, CC BY-SA 4.0; retrieved 2026-10-26.
 * R2.12 flag SVG is temporary until designer uploads final flag image.
 */
const meta={
 title:'Writing/Path/LevelRewardFlag',
 component:LevelRewardFlag,
 args:{amplitude:FLAG_DEFAULTS.amplitude,waves:FLAG_DEFAULTS.waves,period:FLAG_DEFAULTS.period,playing:true},
 parameters:{ba:{contractId:'BA-WR-011',status:'functionally-integrated-temporary-art',
  owner:'Writing',purpose:'Canvas column slices: phase=2πt/1.6 and 6π across 200px; no perspective/shadow.'}},
 decorators:[(Story)=><div data-ba-product="writing" style={{padding:48,background:'linear-gradient(135deg,#9fdcf0,#f6e6a8)',borderRadius:22,width:320}}><Story/></div>],
} satisfies Meta<typeof LevelRewardFlag>;
export default meta;
type Story=StoryObj<typeof meta>;
export const Default:Story={};
export const Paused:Story={args:{playing:false}};
export const LargeAmplitude:Story={args:{amplitude:8}};
export const ReducedMotion:Story={
 parameters:{ba:{note:'OS reduced-motion renders static cloth even when playing.'}},
};
