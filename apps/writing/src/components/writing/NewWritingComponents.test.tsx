import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe,it,expect,vi} from 'vitest';
import {WordGrid} from './WordGrid';
import {HamburgerLayer} from './HamburgerLayer';
import {StairUnitCard} from './StairUnitCard';
import {StairLevelIntroCard} from './StairLevelIntroCard';
describe('Writing composite foundations',()=>{
 it('single word group has no tab and emits insertion only',async()=>{
  const onInsert=vi.fn();
  render(<WordGrid groups={[{id:'one',label:'Words',words:[{id:'first',text:'should'}]}]} activeGroup="one" onGroupChange={()=>{}} onInsert={onInsert}/>);
  expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole('button',{name:'should'}));
  expect(onInsert).toHaveBeenCalledWith('first');
 });
 it('three hamburger layers have consistent title/support hierarchy without inventing missing support text',()=>{
  const {container}=render(<HamburgerLayer layers={[{id:'t',title:'Topic',supporting:'One line'},{id:'r',title:'Reasons'},{id:'c',title:'Closing'}]}/>);
  expect(container.querySelectorAll('.hamburger-layer__title')).toHaveLength(3);
  expect(container.querySelectorAll('.hamburger-layer__support')).toHaveLength(1);
 });
 it('unit shows the same decorative folded layer and no lesson CTA',()=>{
  const unit={id:'G2-O',index:1,typeLabel:'Writing',title:'The Hamburger Paragraph',meta:'Introduction',goals:['One goal']};
  const {container}=render(<StairUnitCard unit={unit} status="locked"/>);
  expect(container.querySelector('.stair-unit-card__fold')).toHaveAttribute('aria-hidden','true');
  expect(screen.getByText('One goal')).toBeVisible();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
 });
 it('level information has a separate stable component identity',()=>{
  const {container}=render(<StairLevelIntroCard text="A level introduction"/>);
  expect(container.querySelector('[data-component="BA-WR-008"]')).toBeInTheDocument();
 });
});
