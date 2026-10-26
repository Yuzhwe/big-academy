import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { catalog, defaultScene, readScene, sceneSearch, statusFor } from './catalog';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  window.scrollTo = vi.fn();
});

describe('review scene links', () => {
  it('restores a full multi-select review scene, including selections', () => {
    const scene = { ...defaultScene, mode: 'state' as const, state: 'correctUnselected', locale: 'zh' as const,
      width: '320' as const, choice: 'multiple' as const, selected: ['a', 'c'], sample: 'long' as const, motion: 'reduce' as const };
    expect(readScene(sceneSearch(scene))).toEqual(scene);
  });

  it('rejects unsupported states, sizes, and unknown/duplicate selections', () => {
    const scene = readScene('?component=lesson&state=correct&width=-1&size=1000&selected=a,a,b,unknown');
    expect(scene.state).toBe('start');
    expect(scene.width).toBe('fit');
    expect(scene.size).toBe(50);
    expect(scene.selected).toEqual(['a']);
  });
});

describe('designer task flow', () => {
  it('starts with a real interactive preview and keeps review material collapsed', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelectorAll('details[open]')).toHaveLength(0);
    await user.click(screen.getByRole('radio', { name: /Gardens have plants/ }));
    expect(screen.getByRole('radio', { name: /Gardens have plants/ })).toBeChecked();
    expect(readScene(window.location.search).selected).toEqual(['a']);
    await user.click(screen.getByRole('button', { name: '查看状态' }));
    await user.selectOptions(screen.getByLabelText('视觉状态'), 'wrong');
    expect(container.querySelector('.ba-choice__option[data-state="wrong"]')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '交互体验' }));
    expect(readScene(window.location.search).selected).toEqual([]);
  });

  it('restores selections from a link and resets the scene without changing contracts', async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, '', sceneSearch({ ...defaultScene, choice: 'multiple', selected: ['a', 'c'], locale: 'zh', sample: 'long' }));
    render(<App />);
    expect(screen.getByText('已选择 2 项 · 只改变选择，不评分')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '重置场景' }));
    expect(readScene(window.location.search)).toEqual(defaultScene);
    expect(statusFor(catalog[0]).approved).toBe(false);
    expect(statusFor(catalog[5]).approved).toBe(false); // Integrated curves/feedback await rendered review.
  });

  it('finds components by stable ID and navigates directly to a preview', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText('名称、英文名或 ID'), 'BA-UI-001');
    const nav = screen.getByRole('navigation', { name: '组件目录' });
    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    await user.click(within(nav).getByRole('link', { name: /按钮/ }));
    expect(screen.getByRole('button', { name: 'Continue learning' })).toBeVisible();
    expect(document.activeElement).toBe(screen.getByRole('main'));
    await user.selectOptions(screen.getByLabelText('控件尺寸'), '90');
    expect(screen.getByRole('button', { name: 'Continue learning' })).toHaveAttribute('data-size', '90');
  });

  it('copies a reproducible feedback draft while keeping visual approval read-only', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const { container } = render(<App />);
    await user.click(screen.getByText('评审证据与反馈', { exact: false }));
    await user.click(screen.getByLabelText('窄屏与长文本'));
    await user.type(screen.getByLabelText('观察与建议'), '检查长文本换行');
    await user.click(screen.getByRole('button', { name: '复制反馈摘要' }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('反馈：检查长文本换行'));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('此摘要不是设计批准记录。'));
    expect(statusFor(catalog[0]).approved).toBe(false);
    expect(container.querySelector('.preview-panel')).toBeVisible();
  });

  it('restores browser back navigation', () => {
    render(<App />);
    window.history.replaceState({}, '', '?component=words');
    fireEvent.popState(window);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('词卡面板');
    expect(screen.getByRole('button', { name: 'We' })).toBeVisible();
  });
});
