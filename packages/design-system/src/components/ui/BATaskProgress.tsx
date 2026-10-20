import { useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import { BAIcon } from './BAIcon';
import type { BALocale, TaskProgressItem } from '../../types/task';
import { taskChrome, taskMayNavigate } from '../../i18n/chrome';
import './BATaskProgress.css';

export interface ActivityScreenIndicatorProps {
  screenNumber: number;
  progressStatus: 'incomplete' | 'done' | 'locked' | 'skipped';
  isSelected: boolean;
  canOpen: boolean;
  onNavigate?: () => void;
  label: string;
  answerRevealed?: boolean;
  size?: 'compact' | 'regular';
  skippedLabel?: string;
}
/** BA-UI-012 · progress status and selected view are independent. Never grades. */
export function ActivityScreenIndicator({
  screenNumber,
  progressStatus,
  isSelected,
  canOpen,
  onNavigate,
  label,
  answerRevealed,
  size = 'compact',
  skippedLabel = 'skipped',
}: ActivityScreenIndicatorProps) {
  return (
    <Button
      className="ba-task-progress__button"
      data-component="BA-UI-012"
      data-state={progressStatus}
      data-selected={isSelected || undefined}
      data-size={size}
      isDisabled={!canOpen}
      aria-current={isSelected ? 'step' : undefined}
      aria-label={`${label}${answerRevealed ? ' · answer revealed' : ''}`}
      onPress={() => {
        if (canOpen) onNavigate?.();
      }}
    >
      <span className="ba-task-progress__marker" aria-hidden="true">
        {screenNumber}
        {progressStatus === 'done' || progressStatus === 'locked' ? (
          <span className="ba-task-progress__badge">
            <BAIcon name={progressStatus === 'done' ? 'check' : 'lock'} size={12} />
          </span>
        ) : null}
      </span>
      {progressStatus === 'skipped' ? (
        <span className="ba-task-progress__caption">{skippedLabel}</span>
      ) : null}
    </Button>
  );
}
export interface BATaskProgressProps {
  tasks: readonly TaskProgressItem[];
  activeIndex: number;
  canOpen: (index: number) => boolean;
  onNavigate?: (index: number) => void;
  locale?: BALocale;
  label?: string;
}
/** BA-UI-006 · measured rail and anchored nonmodal full index. */
export function BATaskProgress({
  tasks,
  activeIndex,
  canOpen,
  onNavigate,
  locale = 'en',
  label,
}: BATaskProgressProps) {
  const copy = taskChrome(locale),
    ref = useRef<HTMLElement>(null);
  const [capacity, setCapacity] = useState(tasks.length),
    [open, setOpen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => setCapacity(Math.max(2, Math.floor(el.clientWidth / 48)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const overflow = tasks.length > capacity;
  const count = overflow ? Math.max(1, capacity - 1) : tasks.length;
  const start = Math.max(0, Math.min(activeIndex - Math.floor(count / 2), tasks.length - count));
  const indices = Array.from({ length: count }, (_, i) => i + start);
  const indicator = (task: TaskProgressItem, index: number, size: 'compact' | 'regular' = 'compact') => (
    <ActivityScreenIndicator
      screenNumber={task.number ?? index + 1}
      progressStatus={task.status === 'current' || task.status === 'available' ? 'incomplete' : task.status}
      isSelected={index === activeIndex}
      canOpen={taskMayNavigate(task.status, index, canOpen)}
      answerRevealed={task.answerRevealed}
      label={copy.task(task.number ?? index + 1, task.label, copy.status[task.status])}
      skippedLabel={copy.status.skipped}
      size={size}
      onNavigate={() => {
        if (canOpen(index)) {
          onNavigate?.(index);
          setOpen(false);
        }
      }}
    />
  );
  return (
    <nav ref={ref} className="ba-task-progress" data-component="BA-UI-006" aria-label={label ?? copy.nav}>
      <ol className="ba-task-progress__list">
        {indices.map((index) => (
          <li key={tasks[index].id} data-task-index={index}>
            {indicator(tasks[index], index)}
          </li>
        ))}
      </ol>
      {overflow ? (
        <DialogTrigger isOpen={open} onOpenChange={setOpen}>
          <Button
            className="ba-task-progress__overflow"
            aria-label={locale === 'zh' ? '所有活动页面' : 'All activity screens'}
          >
            •••
          </Button>
          <Popover className="ba-task-progress__popover" placement="bottom" isNonModal onOpenChange={setOpen}>
            <Dialog aria-label="All activity screens" className="ba-task-progress__dialog">
              {({ close }) => (
                <>
                  <div className="ba-task-progress__popover-title">
                    <strong>{locale === 'zh' ? '所有活动页面' : 'All activity screens'}</strong>
                    <Button aria-label="Close all activity screens" onPress={close}>
                      ×
                    </Button>
                  </div>
                  <ol
                    className="ba-task-progress__grid"
                    ref={(el) => {
                      if (el)
                        requestAnimationFrame(() =>
                          el.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest' }),
                        );
                    }}
                  >
                    {tasks.map((task, index) => (
                      <li key={task.id}>
                        {indicator(task, index, 'regular')}
                        <span>{task.label}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </Dialog>
          </Popover>
        </DialogTrigger>
      ) : null}
    </nav>
  );
}
export { taskMayNavigate };
