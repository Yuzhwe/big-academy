import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { WordGrid, type WordGridWord } from './WordGrid';

it('allows Used without disabling it and never grades on activation', async()=>{
  const onInsert=vi.fn();
  render(<WordGrid groups={[{id:'g',label:'Words',words:[{id:'w',text:'garden',selection:'used',evaluation:'neutral'}]}]} activeGroup="g" onInsert={onInsert}/>);
  const word=screen.getByRole('button',{name:'garden · Used'});
  expect(word).toBeEnabled(); await userEvent.click(word);
  expect(onInsert).toHaveBeenCalledWith('garden'); expect(word).toHaveAttribute('data-evaluation','neutral');
});
it('explicit disabled blocks pointer and keyboard activation independently of usage', async()=>{
  const onInsert=vi.fn(); const user=userEvent.setup();
  render(<WordGrid groups={[{id:'g',label:'Words',words:[{id:'a',text:'available',disabled:true},{id:'b',text:'used',used:true,disabled:true}]}]} activeGroup="g" onInsert={onInsert}/>);
  await user.click(screen.getByRole('button',{name:'available'})); await user.keyboard('{Enter} ');
  expect(onInsert).not.toHaveBeenCalled(); expect(screen.getByRole('button',{name:'used'})).toBeDisabled();
});
it('single group can show or hide the real tablist',()=>{
  const props={groups:[{id:'g',label:'Words',words:[{id:'a',text:'garden'}]}],activeGroup:'g'};
  const {rerender}=render(<WordGrid {...props} tabs="show"/>); expect(screen.getByRole('tab',{name:'Words'})).toBeVisible();
  rerender(<WordGrid {...props} tabs="hide"/>); expect(screen.queryByRole('tablist')).toBeNull(); expect(screen.getByRole('button',{name:'garden'})).toBeVisible();
});
it.each([
  ['selected','correct'],['selected','incorrect'],['used','correct'],['used','incorrect'],['default','hint'],['default','shown'],
] as const)('keeps %s and %s as independent supplied meanings',(selection,evaluation)=>{
  const word:WordGridWord={id:'s',text:'A sentence.',kind:'sentence',selection,evaluation};
  render(<WordGrid groups={[{id:'g',label:'Sentences',words:[word]}]} activeGroup="g"/>);
  const button=screen.getByRole('button'); expect(button).toHaveAttribute('data-selection',selection); expect(button).toHaveAttribute('data-evaluation',evaluation);
  expect(button).toBeEnabled(); expect(button).toHaveAttribute('aria-pressed',selection==='selected'?'true':'false');
  if(evaluation==='shown') expect(button).toHaveAccessibleName(/Shown answer/);
});
