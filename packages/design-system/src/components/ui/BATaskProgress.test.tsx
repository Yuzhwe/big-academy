import { render, screen } from '@testing-library/react';
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
    expect(screen.getByText('skipped')).toBeVisible();
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
    expect(screen.getByText('已跳过')).toBeVisible();
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

  it('keeps a long activity title in the accessible name across many tasks', () => {
    const long = 'Try it in your own writing about the lunch menu and why it should change';
    const rows: TaskProgressItem[] = Array.from({ length: 18 }, (_, index) => ({
      id: `row-${index}`,
      label: index === 8 ? long : `Activity ${index + 1}`,
      status: index === 4 ? 'current' : index < 4 ? 'done' : index < 9 ? 'available' : 'locked',
    }));
    render(
      <BATaskProgress tasks={rows} activeIndex={4} canOpen={(index) => index < 9} />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(18);
    expect(screen.getByRole('button', { name: `Task 9: ${long}, available` })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Task 18: Activity 18, locked' })).toBeDisabled();
  });
});
