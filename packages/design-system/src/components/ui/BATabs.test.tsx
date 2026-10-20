import {describe,expect,it,vi} from 'vitest';
import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BATabs,BATabList,BATabPanel} from './BATabs';

const items=[{id:'start',label:'Start'},{id:'continue',label:'Continue'},{id:'review',label:'Review'}];

describe('BA-UI-002 BATabs with Figma shared anatomy',()=>{
  it('switches the active content panel through arrow keys',async()=>{
    const user=userEvent.setup();
    function Demo(){
      const [selected,setSelected]=requireState();
      return <BATabs selectedKey={selected} onSelectionChange={setSelected}>
        <BATabList selectedKey={selected} aria-label="Chapter sections" items={items}/>
        <BATabPanel id="start">Start panel</BATabPanel>
        <BATabPanel id="continue">Continue panel</BATabPanel>
        <BATabPanel id="review">Review panel</BATabPanel>
      </BATabs>;
    }
    render(<Demo/>);
    expect(screen.getByRole('tablist',{name:'Chapter sections'})).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Start panel');
    screen.getByRole('tab',{name:'Start'}).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab',{name:'Continue'})).toHaveAttribute('aria-selected','true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Continue panel');
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });
  it('preserves disabled tabs and accessible names',async()=>{
    const user=userEvent.setup();
    const onChange=vi.fn();
    render(<BATabs defaultSelectedKey="start" onSelectionChange={onChange}>
      <BATabList selectedKey="start" aria-label="Stages" items={[items[0],{id:'locked',label:'Locked',disabled:true}]}/>
      <BATabPanel id="start">Start panel</BATabPanel>
      <BATabPanel id="locked">Locked panel</BATabPanel>
    </BATabs>);
    expect(screen.getByRole('tab',{name:'Locked'})).toHaveAttribute('aria-disabled','true');
    await user.click(screen.getByRole('tab',{name:'Locked'}));
    expect(onChange).not.toHaveBeenCalled();
  });
});
// Hook deliberately kept inside test, not component semantics.
import {useState} from 'react';
function requireState(): [string,(id:string)=>void] { return useState('start'); }
