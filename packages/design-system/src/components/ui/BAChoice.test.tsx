import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { BAChoice, type BAChoiceOption } from './BAChoice';

const options: BAChoiceOption[] = [
  { id: '0', marker: 'A', text: 'Gardens have plants.' },
  { id: '1', marker: 'B', text: 'Our school should have a garden for two big reasons.' },
];

function Harness({ mode = 'single' as 'single' | 'multiple' }) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <BAChoice
      mode={mode}
      label="Pick a topic sentence"
      options={options}
      selectedIds={selected}
      onChange={setSelected}
    />
  );
}

describe('BAChoice', () => {
  it('selects one radio and does not grade by itself', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const choice = screen.getByRole('radio', { name: /Our school should have a garden/ });
    await user.click(choice);
    expect(choice).toBeChecked();
    expect(screen.queryByText(/Right/)).not.toBeInTheDocument();
    expect(choice.closest('[data-component="BA-UI-003"]')).toBeTruthy();
  });

  it('toggles multiple checkboxes from the keyboard', async () => {
    const user = userEvent.setup();
    render(<Harness mode="multiple" />);
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
    await user.keyboard(' ');
    expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked();
  });

  it('exposes correct state with text, not color alone', () => {
    render(
      <BAChoice
        mode="single"
        label="Graded"
        disabled
        selectedIds={['1']}
        onChange={() => undefined}
        options={[
          { id: '0', marker: 'A', text: 'Gardens have plants.', visual: 'dim' },
          { id: '1', marker: 'B', text: 'Our school should have a garden.', visual: 'correct', mark: 'Your answer · right' },
        ]}
      />,
    );
    expect(screen.getByText('Your answer · right')).toBeInTheDocument();
    const radio = screen.getByRole('radio', { name: /Your answer · right/ });
    expect(radio.closest('[data-visual="correct"]')).toBeTruthy();
  });
});
