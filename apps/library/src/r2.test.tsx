import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { defaultScene, readScene, sceneSearch } from './catalog';
import { colorTokens } from './colorTokens';
import { StairLessonCard } from '../../writing/src/components/writing/StairLessonCard';
import { BAButton } from '@big-academy/design-system';
beforeEach(()=>{window.history.replaceState({},'','/?component=words');window.scrollTo=vi.fn();});
it('selects, unselects and retains WordGrid selection across tabs and reload parameters',async()=>{
  const user=userEvent.setup();render(<App/>);
  await user.click(screen.getByRole('button',{name:'F · 多 Tab'}));
  await user.click(screen.getByRole('button',{name:'We'}));
  await user.click(screen.getByRole('tab',{name:'Opinion'})); await user.click(screen.getByRole('button',{name:'We'}));
  await user.click(screen.getByRole('tab',{name:'Words'})); expect(screen.getByRole('button',{name:'We · Selected'})).toHaveAttribute('aria-pressed','true');
  expect(readScene(window.location.search).wordSelected).toEqual(['g0-w0','g1-w0']);
  await user.click(screen.getByRole('button',{name:'We · Selected'}));expect(readScene(window.location.search).wordSelected).toEqual(['g1-w0']);
});
it('builds and undoes words with sentence-level correct/incorrect feedback',async()=>{
  const user=userEvent.setup();render(<App/>);await user.click(screen.getByRole('button',{name:'B · 造句词块'}));
  for(const name of ['We','love','gardens','.']) await user.click(screen.getByRole('button',{name}));
  await user.click(screen.getByRole('button',{name:'Check demo'}));expect(screen.getByText('✓ Demo: correct')).toBeVisible();
  expect(screen.getByRole('button',{name:'We · Used'})).toBeEnabled();expect(screen.getByRole('button',{name:'We · Used'})).toHaveAttribute('data-evaluation','neutral');
  await user.click(screen.getByRole('button',{name:'Remove love'}));await user.click(screen.getByRole('button',{name:'Check demo'}));expect(screen.getByText('× Demo: incorrect; edit and retry')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Reset demo'}));expect(readScene(window.location.search).wordAnswer).toEqual([]);
});
it('shows system answers without crediting the learner and restores the full scene URL',async()=>{
  const user=userEvent.setup();render(<App/>);await user.click(screen.getByRole('button',{name:'G · 提示与展示答案'}));
  await user.click(screen.getByRole('button',{name:'Hint'}));expect(screen.getByRole('button',{name:'We · Hint'})).toHaveAttribute('aria-pressed','false');
  await user.click(screen.getByRole('button',{name:'Show answer'}));expect(screen.getByRole('button',{name:'We · Shown answer'})).toHaveAttribute('data-evaluation','shown');
  const parsed=readScene(window.location.search);expect(parsed.wordSelected).toEqual([]);expect(parsed.wordResult).toBe('shown');expect(readScene(sceneSearch(parsed))).toEqual(parsed);
});
it('keeps every primitive scale and resolves scope-specific aliases without redefining them',()=>{
  expect(colorTokens.filter(t=>t.layer==='Primitive')).toHaveLength(80);
  expect(colorTokens.some(t=>t.value.includes('unresolved'))).toBe(false);
  const action=colorTokens.filter(t=>t.name==='--ba-color-action-primary'); expect(action.map(t=>t.value)).toEqual(['#2c657b','#b25415']);
  expect(colorTokens.some(t=>t.value.includes('rgba('))).toBe(true);
});
it('keeps R2 configuration and combination state in validated links',()=>{
  const s={...defaultScene,component:'words' as const,wordScenario:'H' as const,wordCount:'10' as const,wordTabs:'show' as const,wordContent:'sentence' as const,wordSelection:'used' as const,wordEvaluation:'incorrect' as const,wordAnswer:['g0-w0'],width:'320' as const};
  expect(readScene(sceneSearch(s))).toEqual(s);
});
it('never calls lesson entry for a locked card and supplies a full-width three-line card',async()=>{
  const onEnter=vi.fn();render(<StairLessonCard lessonId="test" number={2} title="Very long title for three lines" state="locked" titleLines={3} onEnter={onEnter}/>);
  const button=screen.getByRole('button',{name:'Locked'});await userEvent.click(button);expect(onEnter).not.toHaveBeenCalled();expect(button).toBeDisabled();expect(button).toHaveAttribute('data-layout','full');
});
it('blocks repeated loading presses and labels icon-only buttons',async()=>{
  const onPress=vi.fn();const {rerender}=render(<BAButton busy onPress={onPress}>Continue</BAButton>);await userEvent.click(screen.getByRole('button',{name:'Continue'}));expect(onPress).not.toHaveBeenCalled();
  rerender(<BAButton iconOnly aria-label="Back" variant="outline" layout="fixed"/>);expect(screen.getByRole('button',{name:'Back'})).toHaveAttribute('data-visual-review','candidate');
});
it('provides an explicit clearing action for single choice and deterministic checking',async()=>{
  window.history.replaceState({},'','/?component=choice');const user=userEvent.setup();render(<App/>);
  const preview=within(screen.getByRole('region',{name:'组件预览'}));await user.click(preview.getByRole('radio',{name:/Our school/}));await user.click(preview.getByRole('button',{name:'Check demo'}));
  expect(readScene(window.location.search).answerPhase).toBe('checked');await user.click(preview.getByRole('button',{name:'Clear selection'}));expect(readScene(window.location.search).selected).toEqual([]);
});
it('uses real pointer and keyboard states rather than painted hover/press fixtures',async()=>{
  const user=userEvent.setup();const onPress=vi.fn();render(<BAButton onPress={onPress}>Try me</BAButton>);const button=screen.getByRole('button',{name:'Try me'});
  await user.hover(button);expect(button).toHaveAttribute('data-hovered');
  await user.pointer({keys:'[MouseLeft>]',target:button});expect(button).toHaveAttribute('data-pressed');expect(onPress).not.toHaveBeenCalled();
  await user.pointer({keys:'[/MouseLeft]',target:button});expect(onPress).toHaveBeenCalledTimes(1);
  await user.tab();await user.tab();await user.keyboard('{Enter}');expect(onPress).toHaveBeenCalledTimes(2);
  await user.pointer([{keys:'[TouchA>]',target:button},{keys:'[/TouchA]',target:button}]);expect(onPress).toHaveBeenCalledTimes(3);
});

it('unifies fresh and resumed lesson visuals and CTA without changing the underlying action',async()=>{
  const onEnter=vi.fn(); const user=userEvent.setup();
  const props={lessonId:'G2-O:1',number:1,title:'Topic sentences',onEnter};
  const {rerender,container}=render(<StairLessonCard {...props} state="start" locale="en"/>);
  expect(container.querySelector('.stair-lesson-card')).toHaveAttribute('data-visual-state','enterable');
  await user.click(screen.getByRole('button',{name:'Enter'}));
  rerender(<StairLessonCard {...props} state="continue" locale="en" current/>);
  expect(container.querySelector('.stair-lesson-card')).toHaveAttribute('data-visual-state','enterable');
  expect(container.querySelector('.stair-lesson-card__current-dot')).toBeNull();
  await user.click(screen.getByRole('button',{name:'Enter'}));
  expect(onEnter).toHaveBeenCalledTimes(2);
  rerender(<StairLessonCard {...props} state="start" locale="zh"/>);
  expect(screen.getByRole('button',{name:'进入'})).toBeVisible();
});
it('gives completed and skipped the same visual role, with no visible Skipped label',()=>{
  const props={lessonId:'G2-O:1',number:1,title:'Topic sentences',locale:'en' as const};
  const {rerender,container}=render(<StairLessonCard {...props} state="review"/>);
  expect(container.querySelector('.stair-lesson-card')).toHaveAttribute('data-visual-state','completed');
  rerender(<StairLessonCard {...props} state="skipped"/>);
  expect(container.querySelector('.stair-lesson-card')).toHaveAttribute('data-visual-state','completed');
  expect(screen.queryByText('Mastered · skipped')).toBeNull();
  expect(screen.getByRole('button',{name:'Review'})).toBeEnabled();
});
