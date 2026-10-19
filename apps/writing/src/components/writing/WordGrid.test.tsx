import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WordGrid, type WordGridGroup } from './WordGrid';

const groups: WordGridGroup[] = [
  { id: 'opinion', label: 'Opinion', cells: [{ id: 'should', text: 'should' }] },
  { id: 'reasons', label: 'Reasons', cells: [{ id: 'because', text: 'because' }] },
];

function Harness({ presentation = 'docked' }: { presentation?: 'docked' | 'overlay' }) {
  const [group, setGroup] = useState('opinion');
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  return (
    <div>
      <button type="button">Write here</button>
      <WordGrid
        groups={groups}
        activeGroup={group}
        presentation={presentation}
        open={open}
        onOpenChange={setOpen}
        onGroupChange={setGroup}
        onInsert={setWord}
      />
      <p data-testid="inserted">{word}</p>
    </div>
  );
}

describe('WordGrid', () => {
  it('switches groups and inserts the cell text', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('tab', { name: 'Reasons' }));
    expect(screen.getByRole('tab', { name: 'Reasons' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('button', { name: 'because' }));
    expect(screen.getByTestId('inserted')).toHaveTextContent('because');
  });

  it('closes an overlay with Escape and restores focus', async () => {
    const user = userEvent.setup();
    render(<Harness presentation="overlay" />);
    const writer = screen.getByRole('button', { name: 'Write here' });
    writer.focus();
    await user.click(screen.getByRole('button', { name: 'Open the grid' }));
    expect(screen.getByRole('tab', { name: 'Opinion' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tab', { name: 'Opinion' })).not.toBeInTheDocument();
    expect(writer).toHaveFocus();
  });

  it('shows the locked check message without word buttons', () => {
    render(
      <WordGrid
        groups={groups}
        activeGroup="opinion"
        presentation="docked"
        mode="locked"
        onGroupChange={vi.fn()}
        onInsert={vi.fn()}
      />,
    );
    expect(screen.getByText(/word grid is off/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'should' })).not.toBeInTheDocument();
  });
});
