import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BAPageTransition } from './BAPageTransition';

afterEach(()=>vi.useRealTimers());
describe('BA-WR-012 Cross Blur — review-only candidate',()=>{
  it('swaps at midpoint then returns to idle without driving navigation',()=>{
    vi.useFakeTimers();
    const renderView=(key:string)=><h2>{key}</h2>;
    const {rerender,container}=render(<BAPageTransition viewKey="Staircase" renderView={renderView} duration={500} maxBlur={12}/>);
    expect(screen.getByRole('heading',{name:'Staircase'})).toBeInTheDocument();
    rerender(<BAPageTransition viewKey="Lesson" renderView={renderView} duration={500} maxBlur={12}/>);
    expect(container.querySelector('.ba-page-transition')).toHaveAttribute('data-phase','out');
    act(()=>vi.advanceTimersByTime(250));
    expect(screen.getByRole('heading',{name:'Lesson'})).toBeInTheDocument();
    expect(container.querySelector('.ba-page-transition')).toHaveAttribute('data-phase','in');
    act(()=>vi.advanceTimersByTime(250));
    expect(container.querySelector('.ba-page-transition')).toHaveAttribute('data-phase','idle');
  });
  it('respects reduced motion by immediately replacing the screen',()=>{
    const renderView=(key:string)=><span>{key}</span>;
    const {rerender,container}=render(<BAPageTransition viewKey="one" renderView={renderView} reducedMotion/>);
    rerender(<BAPageTransition viewKey="two" renderView={renderView} reducedMotion/>);
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(container.querySelector('.ba-page-transition')).toHaveAttribute('data-phase','idle');
  });
  it('cancels the previous midpoint when a new destination arrives',()=>{
    vi.useFakeTimers();
    const renderView=(key:string)=><p>{key}</p>;
    const {rerender}=render(<BAPageTransition viewKey="A" renderView={renderView} duration={500}/>);
    rerender(<BAPageTransition viewKey="B" renderView={renderView} duration={500}/>);
    act(()=>vi.advanceTimersByTime(100));
    rerender(<BAPageTransition viewKey="C" renderView={renderView} duration={500}/>);
    act(()=>vi.advanceTimersByTime(250));
    expect(screen.getByText('C')).toBeInTheDocument();
    act(()=>vi.advanceTimersByTime(250));
    expect(screen.queryByText('B')).toBeNull();
  });
});
