import type { Meta, StoryObj } from '@storybook/react-vite';
import { CloudShaderSky } from '../../course/CloudShaderSky';

const meta = {
  title: 'Writing/Path/CloudShaderSky',
  component: CloudShaderSky,
  parameters: { layout: 'fullscreen', ba: { contractId: 'BA-WR-013', owner: 'Writing',
    status: 'candidate-pending-designer-approval', purpose: 'M4 original GLSL vs current-staircase palette and legacy lightweight clouds' } },
  args: { mode: 'auto', preset: 'staircase', parallaxStrength: .06, cameraX: 0,
    cameraMaxTravel: 1200, paused: false },
  argTypes: {
    mode: { control: 'select', options: ['auto', 'shader', 'lightweight'] },
    preset: { control: 'radio', options: ['clear', 'staircase'] },
    cloudCount: {control:{type:'range',min:1,max:6,step:1}},
    driftSpeed: {control:{type:'range',min:0,max:2,step:.1}},
    parallaxStrength: {control:{type:'range',min:0,max:.5,step:.01}},
    cameraX: {control:{type:'range',min:0,max:1200,step:10}},
  },
  render: args => <div data-ba-product="writing" style={{
    position: 'relative', overflow:'hidden',height:'100vh',minHeight:420,
    background:args.preset==='clear' ? 'linear-gradient(#3876BA,#8CBFE8)' : 'linear-gradient(135deg,#85DBF9,#F8F4ED)',
  }}>
    <CloudShaderSky {...args}/>
    <div style={{position:'relative',zIndex:2,padding:24,pointerEvents:'none',font:'16px sans-serif'}}>
      BA-WR-013 · {args.preset} · {args.mode} · cameraX {args.cameraX}
    </div>
  </div>,
} satisfies Meta<typeof CloudShaderSky>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Adaptive: Story = {};
export const OriginalM4Clear: Story = { args: { mode:'shader', preset:'clear' } };
export const CurrentPalette: Story = { args: { mode:'shader', preset:'staircase' } };
export const Lightweight: Story = { args: { mode:'lightweight', preset:'staircase' } };
export const ReducedMotion: Story = { args: { reducedMotion:true, mode:'auto' } };
export const Scrolled: Story = { args: { cameraX:800, mode:'shader' } };
