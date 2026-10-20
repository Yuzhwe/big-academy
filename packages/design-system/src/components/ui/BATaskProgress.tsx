import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import { ActivityScreenIndicator, indicatorProgress } from './ActivityScreenIndicator';
import type { BALocale, TaskProgressItem } from '../../types/task';
import { taskChrome, taskMayNavigate } from '../../i18n/chrome';
import './BATaskProgress.css';

export interface BATaskProgressProps {
  tasks: readonly TaskProgressItem[];
  activeIndex: number;
  canOpen: (index: number) => boolean;
  onNavigate?: (index: number) => void;
  onPopoverOpenChange?: (open: boolean) => void;
  locale?: BALocale;
  /** Accessible name for the whole group. Defaults to the locale chrome string. */
  label?: string;
}

const ITEM_PX = 48;

function statusPhrase(task: TaskProgressItem, locale: BALocale, copyStatus: string): string {
  if (task.revealed) return locale === 'zh' ? '已显示答案' : 'answer shown';
  return copyStatus;
}

/**
 * BA-UI-006 · lesson activity screen numbers.
 * Overflow uses the same ActivityScreenIndicator inside a nonmodal popover.
 * `canOpen` is injected. This component does not grade or unlock.
 * Indicator visuals are in review.
 */
export function BATaskProgress({
  tasks,
  activeIndex,
  canOpen,
  onNavigate,
  onPopoverOpenChange,
  locale = 'en',
  label,
}: BATaskProgressProps) {
  const copy = taskChrome(locale);
  const railRef = useRef<HTMLDivElement>(null);
  const popoverListRef = useRef<HTMLOListElement>(null);
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const allLabel = locale === 'zh' ? '全部活动页' : 'All activity screens';

  useLayoutEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [tasks.length]);

  const capacity = width > 0 ? Math.max(1, Math.floor(width / ITEM_PX)) : tasks.length;
  const overflow = capacity < tasks.length;
  const visibleCount = overflow ? Math.max(1, capacity - 1) : tasks.length;
  const start = overflow
    ? Math.min(Math.max(0, activeIndex - Math.floor((visibleCount - 1) / 2)), Math.max(0, tasks.length - visibleCount))
    : 0;
  const visible = tasks.map((task, index) => ({ task, index })).slice(start, start + visibleCount);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      popoverListRef.current?.querySelector<HTMLElement>('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, activeIndex, tasks]);

  function renderIndicator(task: TaskProgressItem, index: number, size: 'compact' | 'regular') {
    const number = task.number ?? index + 1;
    const phrase = statusPhrase(task, locale, copy.status[task.status]);
    return (
      <ActivityScreenIndicator
        screenNumber={number}
        accessibleName={copy.task(number, task.label, phrase)}
        caption={task.status === 'skipped' ? phrase : undefined}
        progressStatus={indicatorProgress(task.status)}
        isSelected={index === activeIndex}
        canOpen={taskMayNavigate(task.status, index, canOpen)}
        revealed={task.revealed}
        size={size}
        onNavigate={() => onNavigate?.(index)}
      />
    );
  }

  return (
    <nav className="ba-task-progress" data-component="BA-UI-006" aria-label={label ?? copy.nav}>
      <div className="ba-task-progress__rail" ref={railRef}>
        <ol className="ba-task-progress__list">
          {visible.map(({ task, index }) => (
            <li className="ba-task-progress__item" key={task.id}>
              {renderIndicator(task, index, 'compact')}
            </li>
          ))}
          {overflow ? (
            <li className="ba-task-progress__item">
              <DialogTrigger
                isOpen={open}
                onOpenChange={(next) => {
                  setOpen(next);
                  onPopoverOpenChange?.(next);
                }}
              >
                <Button className="activity-indicator activity-indicator--more" aria-label={allLabel} aria-expanded={open} aria-controls={popoverId}>
                  <span className="activity-indicator__circle" aria-hidden="true">
                    <span className="activity-indicator__number">…</span>
                  </span>
                </Button>
                <Popover className="activity-screen-popover" placement="bottom" offset={8} isNonModal>
                  <Dialog id={popoverId} aria-label={allLabel} className="activity-screen-popover__dialog">
                    <div className="activity-screen-popover__bar">
                      <p className="activity-screen-popover__title">{allLabel}</p>
                      <Button className="activity-screen-popover__close" aria-label={locale === 'zh' ? '关闭' : 'Close'} onPress={() => setOpen(false)}>
                        {locale === 'zh' ? '关闭' : 'Close'}
                      </Button>
                    </div>
                    <ol className="activity-screen-popover__grid" ref={popoverListRef}>
                      {tasks.map((task, index) => (
                        <li key={task.id} data-popover-current={index === activeIndex ? 'true' : undefined}>
                          {renderIndicator(task, index, 'regular')}
                        </li>
                      ))}
                    </ol>
                  </Dialog>
                </Popover>
              </DialogTrigger>
            </li>
          ) : null}
        </ol>
      </div>
    </nav>
  );
}

export { taskMayNavigate };
