import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LONG_TITLE_EN, LONG_TITLE_ZH, getFixture } from '../../fixtures/topbarFixtures';
import { LessonTopBar } from './LessonTopBar';

function renderBar(fixtureId: string, locale: 'en' | 'zh', handlers?: { onBack?: () => void; onNavigate?: (index: number) => void }) {
  const fixture = getFixture(fixtureId, locale);
  return render(
    <LessonTopBar
      lessonTitle={fixture.lessonTitle}
      lessonNumber={fixture.lessonNumber}
      tasks={fixture.tasks}
      current={fixture.current}
      canOpen={fixture.canOpen}
      tags={fixture.tags}
      locale={locale}
      onBack={handlers?.onBack}
      onNavigate={handlers?.onNavigate}
    />,
  );
}

describe('LessonTopBar', () => {
  it('puts back and the English lesson identity on the left and leaves the end slot empty', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderBar('mixed', 'en', { onBack });
    expect(screen.getByRole('banner')).toHaveAttribute('data-component', 'BA-WR-001');
    expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    expect(screen.getByText('Topic sentences')).toBeInTheDocument();
    expect(screen.getByText('G2-O')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /menu|index|hamburger|菜单/i })).not.toBeInTheDocument();
    expect(screen.getByRole('banner').querySelector('[data-slot="end"]')?.querySelector('button')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Back to my path' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows a long Chinese title without adding a second language', () => {
    renderBar('long', 'zh');
    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('lang', 'zh-CN');
    expect(screen.getByText('第 1 课')).toBeInTheDocument();
    expect(screen.getByText(LONG_TITLE_ZH)).toBeInTheDocument();
    expect(screen.queryByText(LONG_TITLE_EN)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '回到我的学习路径' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '任务 3：找出观点词，已跳过' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '任务 4：观点还是事实？，当前' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: '任务 3：找出观点词，已跳过' })).toHaveAttribute('data-state', 'skipped');
    expect(header.querySelectorAll('.ba-task-progress__digit')).toHaveLength(8);
    expect(header.querySelector('.ba-task-progress__badge')).toBeNull();
    expect(header.querySelector('.lesson-topbar__name')).toHaveTextContent(LONG_TITLE_ZH);
  });

  it('blocks locked tasks and emits navigate for an open task in a long list', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderBar('many', 'en', { onNavigate });
    expect(screen.getAllByRole('button', { name: /^Task / })).toHaveLength(18);
    await user.click(screen.getByRole('button', { name: 'Task 6: Activity 6, available' }));
    await user.click(screen.getByRole('button', { name: 'Task 18: Activity 18, locked' }));
    expect(onNavigate.mock.calls.map((call) => call[0])).toEqual([5]);
  });
});
