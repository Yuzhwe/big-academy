import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { WordGrid, type WordGroup } from './WordGrid';

const groups: WordGroup[] = [
  {
    id: 'opinion',
    tone: 'opinion',
    label: 'Opinion',
    words: [
      { id: 'think', text: 'think' },
      { id: 'should', text: 'should', state: 'used' },
    ],
  },
  { id: 'nouns', tone: 'nouns', label: 'Nouns', words: [{ id: 'garden', text: 'garden' }] },
  { id: 'adjectives', tone: 'adjectives', label: 'Adjectives', words: [{ id: 'fresh', text: 'fresh', state: 'disabled' }] },
  { id: 'marks', tone: 'marks', label: 'Marks', words: [{ id: 'period', text: '.' }] },
];

describe('WordGrid', () => {
  it('omits a tab strip when only one group is present', () => {
    render(
      <WordGrid
        groups={[{ id: 'set', tone: 'set', label: 'Sentence set', words: [{ id: 'our', text: 'our' }] }]}
        activeGroup="set"
      />,
    );
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'our' })).toBeInTheDocument();
  });

  it('switches authored groups without inserting or grading', async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();
    const onGroupChange = vi.fn();
    function Harness() {
      const [active, setActive] = useState('opinion');
      return (
        <WordGrid
          groups={groups}
          activeGroup={active}
          onInsert={onInsert}
          onGroupChange={(key) => {
            onGroupChange(key);
            setActive(key);
          }}
        />
      );
    }
    render(<Harness />);
    expect(screen.getByRole('tab', { name: 'Opinion' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: 'Nouns' }));
    expect(onGroupChange).toHaveBeenCalledWith('nouns');
    expect(onInsert).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'garden' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'garden' }));
    expect(onInsert).toHaveBeenCalledWith({ id: 'garden', text: 'garden', groupId: 'nouns' });
  });

  it('exposes used and disabled word states and keeps overlay inside a host', () => {
    const { container } = render(
      <div className="host" style={{ position: 'relative', height: 300 }}>
        <WordGrid groups={groups} activeGroup="opinion" presentation="overlay" />
      </div>,
    );
    expect(screen.getByRole('button', { name: /should/ })).toHaveAttribute('data-state', 'used');
    const grid = container.querySelector('[data-component="BA-WR-003"]');
    expect(grid).toHaveAttribute('data-presentation', 'overlay');
    expect(grid).not.toHaveStyle({ position: 'fixed' });
  });

  it('does not restyle global BATabs', () => {
    const css = readFileSync(resolve(process.cwd(), 'apps/writing/src/components/writing/WordGrid.css'), 'utf8');
    const tabs = readFileSync(resolve(process.cwd(), 'packages/design-system/src/components/ui/BATabs.css'), 'utf8');
    expect(css).toContain('--ba-writing-grid-opinion-surface');
    expect(css).not.toContain('.ba-tabs');
    expect(tabs).not.toContain('word-grid');
  });
});
