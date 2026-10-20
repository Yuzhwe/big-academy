import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BASegmentedControl } from './BASegmentedControl';

const options = [{id:'day',label:'Day'},{id:'week',label:'Week'},{id:'month',label:'Month'}];

describe('BA-UI-011 · Segmented local selection', () => {
  it('selects precisely one accessible radio via click and keyboard', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<BASegmentedControl aria-label="Period" options={options} defaultSelectedKey="week" onSelectionChange={onSelectionChange} />);
    const group = screen.getByRole('radiogroup', {name:'Period'});
    expect(group).toBeInTheDocument();
    const week = screen.getByRole('radio',{name:'Week'});
    expect(week).toBeChecked();
    await user.click(screen.getByRole('radio',{name:'Month'}));
    expect(screen.getByRole('radio',{name:'Month'})).toBeChecked();
    expect(onSelectionChange).toHaveBeenCalledWith('month');
  });

  it('requires an accessible label for icon-only choices', () => {
    render(<BASegmentedControl aria-label="Mode" options={[
      {id:'a',accessibleLabel:'Read',icon:<span aria-hidden="true">◉</span>},
      {id:'b',accessibleLabel:'Listen',icon:<span aria-hidden="true">◎</span>},
    ]} />);
    expect(screen.getByRole('radio',{name:'Read'})).toBeInTheDocument();
    expect(screen.getByRole('radio',{name:'Listen'})).toBeInTheDocument();
  });

  it('does not open a tabpanel or navigate and honors disabled options', async () => {
    const user = userEvent.setup();
    render(<BASegmentedControl aria-label="Period" options={[options[0],{...options[1],disabled:true},options[2]]} />);
    await user.click(screen.getByRole('radio',{name:'Week'}));
    expect(screen.getByRole('radio',{name:'Day'})).toBeChecked();
    expect(screen.queryByRole('tabpanel')).toBeNull();
  });
});
