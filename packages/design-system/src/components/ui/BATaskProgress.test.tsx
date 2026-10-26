import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { TaskProgressItem } from '../../types/task';
import { BATaskProgress } from './BATaskProgress';

const tasks: TaskProgressItem[] = [
  { id: 'done', label: 'Learn', status: 'done' },
  { id: 'skip', label: 'Find the opinion word', status: 'skipped' },
  { id: 'now', label: 'Opinion or fact?', status: 'current' },
  { id: 'open', label: 'Build a topic sentence', status: 'available' },
  { id: 'lock', label: 'Check', status: 'locked' },
];

const zhTasks: TaskProgressItem[] = [
  { id: 'done', label: '学一学', status: 'done' },
  { id: 'skip', label: '找出观点词', status: 'skipped' },
  { id: 'now', label: '观点还是事实？', status: 'current' },
  { id: 'open', label: '拼一个主题句', status: 'available' },
  { id: 'lock', label: '小测', status: 'locked' },
];

describe('BATaskProgress', () => {
  it('names every state in English and marks the active task current', () => {
    render(
      <BATaskProgress tasks={tasks} activeIndex={2} canOpen={() => true} locale="en" />,
    );
    expect(screen.getByRole('button', { name: 'Task 1: Learn, done' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Task 1: Learn, done' }).querySelector('.ba-task-progress__digit')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: 'Task 5: Check, locked' }).querySelector('.ba-task-progress__digit')).toHaveTextContent('5');
    expect(screen.getByRole('button', { name: 'Task 2: Find the opinion word, skipped' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Task 3: Opinion or fact?, current' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: 'Task 4: Build a topic sentence, available' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Task 5: Check, locked' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /skipped/ })).not.toHaveAccessibleName(/done/);
    expect(screen.queryByText('skipped')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skipped/ })).toHaveAttribute('data-state', 'skipped');
    expect(screen.queryByText('done', { selector: '.ba-task-progress__caption' })).not.toBeInTheDocument();
    expect(screen.queryByText('current', { selector: '.ba-task-progress__caption' })).not.toBeInTheDocument();
    expect(screen.queryByText('available', { selector: '.ba-task-progress__caption' })).not.toBeInTheDocument();
    expect(screen.queryByText('locked', { selector: '.ba-task-progress__caption' })).not.toBeInTheDocument();
  });

  it('names every state in Chinese', () => {
    render(
      <BATaskProgress tasks={zhTasks} activeIndex={2} canOpen={() => true} locale="zh" />,
    );
    expect(screen.getByRole('button', { name: '任务 1：学一学，已完成' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '任务 2：找出观点词，已跳过' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '任务 3：观点还是事实？，当前' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: '任务 5：小测，未解锁' })).toBeDisabled();
    expect(screen.queryByText('已跳过')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /已跳过/ })).toHaveAttribute('data-state', 'skipped');
    expect(screen.queryByText('已完成', { selector: '.ba-task-progress__caption' })).not.toBeInTheDocument();
    expect(screen.queryByText('当前', { selector: '.ba-task-progress__caption' })).not.toBeInTheDocument();
    expect(screen.queryByText('可进入', { selector: '.ba-task-progress__caption' })).not.toBeInTheDocument();
    expect(screen.queryByText('未解锁', { selector: '.ba-task-progress__caption' })).not.toBeInTheDocument();
  });

  it('navigates only when the row is not locked and canOpen allows it', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const canOpen = (index: number) => index === 0 || index === 1;
    render(
      <BATaskProgress
        tasks={tasks}
        activeIndex={2}
        canOpen={canOpen}
        onNavigate={onNavigate}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Learn, done/ }));
    await user.click(screen.getByRole('button', { name: /skipped/ }));
    await user.click(screen.getByRole('button', { name: /available/ }));
    await user.click(screen.getByRole('button', { name: /current/ }));
    await user.click(screen.getByRole('button', { name: /locked/ }));

    expect(onNavigate.mock.calls.map((call) => call[0])).toEqual([0, 1]);
  });

  it('keeps a long activity title accessible through the overflow popover', async () => {
    const long = 'Try it in your own writing about the lunch menu and why it should change';
    const rows: TaskProgressItem[] = Array.from({ length: 18 }, (_, index) => ({
      id: `row-${index}`,
      label: index === 8 ? long : `Activity ${index + 1}`,
      status: index === 4 ? 'current' : index < 4 ? 'done' : index < 9 ? 'available' : 'locked',
    }));
    render(
      <BATaskProgress tasks={rows} activeIndex={4} canOpen={(index) => index < 9} />,
    );
    const nav = screen.getByRole('navigation');
    expect(within(nav).getAllByRole('button')).toHaveLength(9); // eight numbered slots + one ellipsis
    const trigger = within(nav).getByRole('button', { name: 'All activity screens' });
    await userEvent.click(trigger);
    const popup = screen.getByRole('dialog', { name: 'All activity screens' });
    expect(within(popup).getAllByRole('button')).toHaveLength(19); // 18 digits + Close
    expect(within(popup).getByRole('button', { name: `Task 9: ${long}, available` })).toBeEnabled();
    expect(within(popup).getByRole('button', { name: 'Task 18: Activity 18, locked' })).toBeDisabled();
  });
});

describe('R2 Design Review 01 numeric-only composite indicators', () => {
  it('keeps the status independent of navigation selection for done, skipped and incomplete', () => {
    const { container, rerender } = render(
      <BATaskProgress tasks={tasks} activeIndex={0} canOpen={() => true} />,
    );
    const done = screen.getByRole('button', { name: 'Task 1: Learn, done' });
    const skip = screen.getByRole('button', { name: /Find the opinion word, skipped/ });
    const current = screen.getByRole('button', { name: /Opinion or fact\?, current/ });
    const locked = screen.getByRole('button', { name: /Check, locked/ });
    expect(done).toHaveAttribute('data-state', 'done');
    expect(done).toHaveAttribute('data-selected', 'true');
    expect(done).toHaveAttribute('aria-current', 'step');
    expect(skip).toHaveAttribute('data-selected', 'false');
    expect(container.querySelectorAll('.ba-task-progress__digit')).toHaveLength(tasks.length);
    expect(container.querySelectorAll('.ba-task-progress__badge, .ba-task-progress__icon, .ba-task-progress__caption')).toHaveLength(0);
    expect(locked).toBeDisabled();

    rerender(<BATaskProgress tasks={tasks} activeIndex={1} canOpen={() => true} />);
    expect(skip).toHaveAttribute('data-state', 'skipped');
    expect(skip).toHaveAttribute('data-selected', 'true');
    expect(skip).toHaveAttribute('aria-current', 'step');
    expect(done).toHaveAttribute('data-selected', 'false');

    rerender(<BATaskProgress tasks={tasks} activeIndex={2} canOpen={() => true} />);
    expect(current).toHaveAttribute('data-state', 'current');
    expect(current).toHaveAttribute('data-selected', 'true');
    expect(skip).toHaveAttribute('data-selected', 'false');
  });

  it('keeps all numeric indicators visible in a finished lesson and can still navigate', async () => {
    const onNavigate = vi.fn();
    const rows: TaskProgressItem[] = [
      { id: 'one', label: 'Learn', status: 'done' },
      { id: 'two', label: 'Task', status: 'done' },
      { id: 'three', label: 'Shown', status: 'skipped' },
    ];
    const { container } = render(
      <BATaskProgress tasks={rows} activeIndex={2} canOpen={() => true} onNavigate={onNavigate} />,
    );
    expect(container.querySelectorAll('.ba-task-progress__digit')).toHaveLength(3);
    expect(container.querySelectorAll('.ba-task-progress__badge')).toHaveLength(0);
    await userEvent.click(screen.getByRole('button', { name: 'Task 2: Task, done' }));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });
});

it('supports closing the six-column full index with Escape and outside click without navigation', async () => {
  const rows: TaskProgressItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: String(i), label: 'Activity '+(i+1), status: i===7?'current':'available',
  }));
  const navigate = vi.fn();
  render(<BATaskProgress tasks={rows} activeIndex={7} canOpen={() => true} onNavigate={navigate}/>);
  const overflow = screen.getByRole('button', { name: 'All activity screens' });
  await userEvent.click(overflow);
  expect(screen.getByRole('dialog', { name: 'All activity screens' })).toBeVisible();
  await userEvent.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(navigate).not.toHaveBeenCalled();
  await userEvent.click(overflow);
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
