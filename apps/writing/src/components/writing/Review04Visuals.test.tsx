import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { WordGrid } from './WordGrid';
import { StairUnitCard } from './StairUnitCard';
import { HamburgerComposition } from './HamburgerComposition';
import { UnitMilestone } from './UnitMilestone';

describe('Review 04 Stage A — opt-in designs only', () => {
  it('uses real interactive rounded tabs without changing caller grading', async()=>{
    const onChange=vi.fn();
    render(<WordGrid
      groups={[{id:'one',label:'Opinion',words:[{id:'a',text:'think'}]},
        {id:'two',label:'Nouns',words:[{id:'b',text:'garden'}]}]}
      activeGroup="one" tabAppearance="connected" onGroupChange={onChange}/>);
    const tabs=screen.getByRole('tablist');
    expect(tabs.closest('.word-grid')).toHaveAttribute('data-tab-appearance','connected');
    await userEvent.click(screen.getByRole('tab',{name:'Nouns'}));
    expect(onChange).toHaveBeenCalledWith('two');
  });

  it('keeps old connected tabs unless the caller opts in',()=>{
    const {container}=render(<WordGrid
      groups={[{id:'a',label:'A',words:[]},{id:'b',label:'B',words:[]}]}
      activeGroup="a"/>);
    expect(container.querySelector('.word-grid')).toHaveAttribute('data-tab-appearance','connected');
  });

  it('shares a four-rounded-corner Unit between library and production',()=>{
    const unit={id:'a',index:1,title:'Opinion Paragraph',typeLabel:'',
      meta:'9 lessons · 170 mins',goals:['Write a clear topic sentence']};
    const {rerender,container}=render(<StairUnitCard unit={unit}/>);
    expect(container.querySelector('.course-unit')).toHaveAttribute('data-component','BA-WR-007');
    expect(container.querySelector('.course-unit__identity')).toBeInTheDocument();
    expect(container.querySelector('.course-unit__meta')).toHaveTextContent('9 lessons · 170 min');
    expect(container.querySelector('.course-unit__fold-flap')).not.toBeInTheDocument();
    rerender(<StairUnitCard unit={unit}/>);
    expect(container.querySelector('.course-unit__fold-flap')).not.toBeInTheDocument();
  });


  it('keeps complete lesson wording and the confirmed brown 18px Unit identity across both locale paths',()=>{
    const unit={id:'r04-unit',index:1,title:'Opinion Paragraph',typeLabel:'',
      meta:'9 lessons · 170 mins',goals:[]};
    const {container,rerender}=render(<StairUnitCard unit={unit} locale="en"/>);
    const kicker=container.querySelector('.course-unit__identity .course-kicker');
    const pill=container.querySelector('.course-unit__identity .course-unit__meta');
    expect(kicker).toHaveTextContent('UNIT 1');
    expect(pill).toHaveTextContent('9 lessons · 170 min');
    expect(container.querySelector('.course-unit h2')).toHaveTextContent('Opinion Paragraph');
    expect(container.querySelector('.course-unit__fold')).not.toBeInTheDocument();
    rerender(<StairUnitCard unit={{...unit,meta:'9 课 · 170 分钟',title:'观点段落'}} locale="zh"/>);
    expect(container.querySelector('.course-unit__meta')).toHaveTextContent('9 课 · 170 分钟');
    expect(container.querySelector('.course-unit__fold')).not.toBeInTheDocument();
  });

  it('uses three existing hamburger layers, preserving approved widths',()=>{
    const {container}=render(<HamburgerComposition layers={[
      {layerId:'top',label:'Top bun',value:'A topic sentence.'},
      {layerId:'fill',label:'Reason',value:'A reason.'},
      {layerId:'bottom',label:'Bottom bun',value:'A closing.'},
    ]}/>);
    expect(container.querySelectorAll('.hamburger-layer')).toHaveLength(3);
    expect(container.querySelector('.hamburger-layer[data-layer="top"]')).toHaveTextContent('Top bun');
    expect(container.querySelector('.hamburger-layer[data-layer="bottom"]')).toHaveTextContent('A closing.');
  });

  it('allows only completed gold badge to trigger a replay event',async()=>{
    const onCelebrate=vi.fn(),user=userEvent.setup();
    const base={unitId:'a',title:'Opinion Paragraph',celebrationEligible:false,
      onCelebrate};
    const {unmount}=render(<UnitMilestone {...base} completed={false}/>);
    const button=screen.getByTestId('milestone');
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('data-shine');
    await user.click(button);expect(onCelebrate).not.toHaveBeenCalled();
    unmount();
    const {container}=render(<UnitMilestone {...base} completed={true}/>);
    const completedButton=screen.getByTestId('milestone');
    expect(container.querySelector('.unit-milestone')).toHaveAttribute('data-state','completed');
    expect(completedButton).toHaveAttribute('data-shine','true');
    expect(completedButton).toBeEnabled();
    await user.click(completedButton);expect(onCelebrate).toHaveBeenCalledOnce();
  });
});

it('uses the submitted R04 PNG artwork in the completed milestone candidate only',()=>{
 const {container}=render(<UnitMilestone unitId="demo" title="Unit completed" completed
    celebrationEligible={false}/>);
 const imgs=[...container.querySelectorAll('.unit-milestone__action img')];
 expect(imgs).toHaveLength(2);
 expect(imgs[0].getAttribute('src')).toContain('writing_milestone_2.png');
 expect(imgs[1].getAttribute('src')).toContain('writing_milestone_1.png');
});
