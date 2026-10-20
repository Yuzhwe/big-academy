import { useState } from 'react';
import { describe,expect,it } from 'vitest';
import { render,screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BATabs,BATabList,BATabPanel } from './BATabs';

function Fixture() {
  const [selected,setSelected]=useState('a');
  return <BATabs selectedKey={selected} onSelectionChange={setSelected}>
    <BATabList selectedKey={selected} aria-label="Learning levels" size={50} options={[
      {id:'a',label:'A',accessibleLabel:'Level A'},
      {id:'b',label:'B',accessibleLabel:'Level B'},
      {id:'c',label:'C',accessibleLabel:'Level C',disabled:true},
    ]}/>
    <BATabPanel id={selected}>Active: {selected}</BATabPanel>
  </BATabs>;
}
describe('BA-UI-002 accessible tab navigation',()=>{
  it('provides TabList and panels instead of RadioGroup',async ()=>{
    const u=userEvent.setup();
    render(<Fixture/>);
    expect(screen.getByRole('tablist',{name:'Learning levels'})).toBeInTheDocument();
    expect(screen.getByRole('tab',{name:'Level A'})).toHaveAttribute('aria-selected','true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Active: a');
    expect(screen.queryByRole('radiogroup')).toBeNull();
    await u.click(screen.getByRole('tab',{name:'Level B'}));
    expect(screen.getByRole('tab',{name:'Level B'})).toHaveAttribute('aria-selected','true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Active: b');
    expect(screen.getByRole('tab',{name:'Level C'})).toHaveAttribute('aria-disabled','true');
  });
  it('responds to arrow navigation',async()=>{
    const u=userEvent.setup();
    render(<Fixture/>);
    screen.getByRole('tab',{name:'Level A'}).focus();
    await u.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab',{name:'Level B'})).toHaveAttribute('aria-selected','true');
  });
});
