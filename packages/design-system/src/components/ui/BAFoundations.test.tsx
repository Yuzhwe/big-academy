import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe,it,expect,vi} from 'vitest';
import {BAChoice} from './BAChoice';
import {BAField} from './BAField';
import {BAStatus} from './BAStatus';
describe('BA foundation interactions',()=>{
 it('selection emits changed values, not scores',async()=>{
  const change=vi.fn();
  render(<BAChoice mode="single" label="Choose an answer" selectedKeys={[]} onChange={change} options={[{key:'a',label:'First',prefix:'A'},{key:'b',label:'Second',prefix:'B'}]}/>);
  await userEvent.setup().click(screen.getByRole('radio',{name:'B. Second'}));
  expect(change).toHaveBeenCalledWith(['b']);
  expect(screen.getByRole('radiogroup',{name:'Choose an answer'})).toHaveAttribute('data-component','BA-UI-003');
 });
 it('multichoice permits independent toggles',async()=>{
  const change=vi.fn();
  render(<BAChoice mode="multiple" label="All opinions" selectedKeys={['a']} onChange={change} options={[{key:'a',label:'A sentence'},{key:'b',label:'B sentence'}]}/>);
  await userEvent.setup().click(screen.getByRole('checkbox',{name:'B sentence'}));
  expect(change).toHaveBeenCalledWith(['a','b']);
 });
 it('writing field keeps author-controlled changes and accessible label',async()=>{
  const change=vi.fn();
  render(<BAField label="Your sentence" multiline value="" onChange={change}/>);
  await userEvent.setup().type(screen.getByRole('textbox',{name:'Your sentence'}),'A');
  expect(change).toHaveBeenCalledWith('A');
 });
 it('status messages preserve semantic roles',()=>{
  render(<BAStatus tone="incorrect">Look at the question again.</BAStatus>);
  expect(screen.getByRole('alert')).toHaveTextContent('Look at the question again.');
 });
});
