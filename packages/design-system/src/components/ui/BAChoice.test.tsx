import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BAChoice, type ChoiceOption } from './BAChoice';

const options: ChoiceOption[] = [
  { id: '0', letter: 'A', label: 'Gardens have plants.' },
  { id: '1', letter: 'B', label: 'Our school should have a garden for two big reasons.' },
  { id: '2', letter: 'C', label: 'I like flowers.' },
];

function Harness({ mode = 'single' as 'single' | 'multiple' }) {
  const [keys, setKeys] = useState<string[]>([]);
  return (
    <BAChoice
      choiceMode={mode}
      options={options}
      selectedKeys={keys}
      onChange={setKeys}
      aria-label="Topic sentence"
    />
  );
}

describe('BAChoice', () => {
  it('selects a single option without writing a grade', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('radio', { name: /Our school should have a garden/ }));
    expect(screen.getByRole('radio', { name: /Our school should have a garden/ })).toBeChecked();
    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.queryByText(/Right answer|Your answer/)).not.toBeInTheDocument();
  });

  it('keeps multiple selections when another box is toggled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <BAChoice
        choiceMode="multiple"
        options={options}
        selectedKeys={['0']}
        onChange={onChange}
        aria-label="Opinions"
      />,
    );
    await user.click(screen.getByRole('checkbox', { name: /I like flowers/ }));
    expect(onChange).toHaveBeenCalledWith(['0', '2']);
  });

  it('dims unselected rows after a correct grade and labels the reveal separately', () => {
    const { rerender } = render(
      <BAChoice
        choiceMode="single"
        aria-label="Graded"
        disabled
        selectedKeys={['1']}
        options={options.map((option) => ({
          ...option,
          state: option.id === '1' ? 'correct' : 'dim',
        }))}
      />,
    );
    expect(screen.getByText('Your answer · right')).toBeInTheDocument();
    const dimmed = document.querySelectorAll('[data-state="dim"]');
    expect(dimmed).toHaveLength(2);
    expect(document.querySelector('[data-state="wrong"]')).toBeNull();

    rerender(
      <BAChoice
        choiceMode="single"
        aria-label="Revealed"
        disabled
        selectedKeys={[]}
        options={options.map((option) => ({
          ...option,
          state: option.id === '1' ? 'shown' : option.id === '0' ? 'wrong' : 'dim',
        }))}
      />,
    );
    expect(screen.getByText('Right answer')).toBeInTheDocument();
    expect(screen.getByText('Wrong')).toBeInTheDocument();
    expect(document.querySelector('[data-state="shown"]')).not.toBeNull();
  });

  it('uses the brown error token for wrong and opacity for dim', () => {
    const css = readFileSync(resolve(process.cwd(), 'packages/design-system/src/components/ui/BAChoice.css'), 'utf8');
    expect(css).toContain('var(--ba-error)');
    expect(css).toContain('opacity: 0.4');
    expect(css).not.toMatch(/#ff0000|#f00\b|classic red/i);
    expect(css).toContain("data-state='shown'");
  });
});
