import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BAChoice, type ChoiceOption } from './BAChoice';

const options: ChoiceOption[] = [
  { id: '0', letter: 'A', text: 'Gardens have plants.' },
  { id: '1', letter: 'B', text: 'Our school should have a garden for two big reasons.' },
  { id: '2', letter: 'C', text: 'I like flowers.' },
];

function rowFor(role: 'radio' | 'checkbox', name: RegExp) {
  const control = screen.getByRole(role, { name });
  const row = control.closest('label');
  if (!row) throw new Error('Choice row label is missing');
  return row;
}

describe('BAChoice candidate chrome', () => {
  it('selects one row without painting a status caption', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAChoice choiceMode="single" options={options} selectedKeys={[]} onChange={onChange} aria-label="Topic sentence" />,
    );
    const row = rowFor('radio', /Our school should have a garden/);
    expect(row).toHaveAttribute('data-state', 'default');
    expect(row).not.toHaveTextContent(/correct|wrong|shown/i);
    await user.click(row);
    expect(onChange).toHaveBeenCalledWith(['1']);
    expect(row.getAttribute('data-component')).toBeNull();
    expect(document.querySelector('[data-component="BA-UI-003"]')).not.toBeNull();
  });

  it('renders the six option states from the session and keeps feedback off the row', () => {
    const graded: ChoiceOption[] = [
      { id: '0', letter: 'A', text: 'Gardens have plants.', state: 'wrong' },
      { id: '1', letter: 'B', text: 'Our school should have a garden for two big reasons.', state: 'shown' },
      { id: '2', letter: 'C', text: 'I like flowers.', state: 'dim' },
    ];
    const { rerender } = render(
      <BAChoice
        choiceMode="single"
        options={[{ ...options[1], state: 'selected' }]}
        selectedKeys={['1']}
        feedback={{ message: 'Right. You chose B.' }}
        aria-label="Topic sentence"
      />,
    );
    expect(rowFor('radio', /Our school should have a garden/)).toHaveAttribute('data-state', 'selected');
    expect(screen.queryByText('Right. You chose B.')).toBeNull();

    rerender(<BAChoice choiceMode="single" options={graded} selectedKeys={['0']} disabled aria-label="Topic sentence" />);
    expect(rowFor('radio', /Gardens have plants/)).toHaveAttribute('data-state', 'wrong');
    expect(rowFor('radio', /Our school should have a garden/)).toHaveAttribute('data-state', 'shown');
    expect(rowFor('radio', /I like flowers/)).toHaveAttribute('data-state', 'dim');

    rerender(
      <BAChoice
        choiceMode="single"
        options={options.map((option) => ({ ...option, state: option.id === '1' ? 'correct' : 'dim' }))}
        selectedKeys={['1']}
        disabled
        aria-label="Topic sentence"
      />,
    );
    expect(rowFor('radio', /Our school should have a garden/)).toHaveAttribute('data-state', 'correct');
  });

  it('toggles multiple rows and does not grade', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAChoice choiceMode="multiple" options={options} selectedKeys={['0']} onChange={onChange} aria-label="Opinions" />,
    );
    expect(rowFor('checkbox', /Gardens have plants/)).toHaveAttribute('data-state', 'selected');
    await user.click(screen.getByRole('checkbox', { name: /I like flowers/ }));
    expect(onChange).toHaveBeenCalledWith(['0', '2']);
  });
});
