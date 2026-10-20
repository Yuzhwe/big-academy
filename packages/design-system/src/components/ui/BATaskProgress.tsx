import { useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import { BAIcon } from './BAIcon';
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

/**
 * Shared Activity Screen marker. The numeral stays visible.
 * Done and locked add a separate status circle that touches the number.
 * There is no connecting line.
 */
export function ActivityScreenIndicator({
  number,
  status,
  selected,
  revealed,
  size = 'compact',
}: {
  number: number;
  status: TaskProgressItem['status'];
  selected: boolean;
  revealed?: boolean;
  size?: 'compact' | 'regular';
}) {
  return (
    <span
      className="ba-activity-indicator"
      data-status={status}
      data-selected={selected ? 'true' : 'false'}
      data-revealed={revealed ? 'true' : 'false'}
      data-size={size}
    >
      <span className="ba-activity-indicator__number">{number}</span>
      {status === 'done' ? (
        <span className="ba-activity-indicator__badge" data-badge="done">
          <BAIcon name="check" size={12} />
        </span>
      ) : null}
      {status === 'locked' ? (
        <span className="ba-activity-indicator__badge" data-badge="locked">
          <BAIcon name="lock" size={12} />
        </span>
      ) : null}
    </span>
  );
}

function visibleIndexes(count: number, active: number, capacity: number): number[] {
  if (capacity >= count) return Array.from({ length: count }, (_, index) => index);
  const start = Math.min(Math.max(0, active - Math.floor((capacity - 1) / 2)), Math.max(0, count - capacity));
  return Array.from({ length: capacity }, (_, offset) => start + offset);
}

/**
 * BA-UI-006 · activity screen numbers and the anchored all-screens popover.
 * Entitlement stays in `canOpen`. Opening the popover does not change progress.
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
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const node = railRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [tasks.length]);

  const capacity = width <= 0 ? tasks.length : Math.max(1, Math.floor((width - 8) / 52));
  const overflow = capacity < tasks.length;
  const shown = visibleIndexes(tasks.length, activeIndex, overflow ? Math.max(1, capacity - 1) : tasks.length);

  const press = (index: number) => {
    const task = tasks[index];
    if (!task || !taskMayNavigate(task.status, index, canOpen)) return;
    onNavigate?.(index);
  };

  return (
    <nav className="ba-task-progress" data-component="BA-UI-006" aria-label={label ?? copy.nav}>
      <div className="ba-task-progress__rail" ref={railRef}>
        <ol className="ba-task-progress__list">
          {shown.map((index) => {
            const task = tasks[index];
            return (
              <li className="ba-task-progress__item" key={task.id}>
                <ScreenButton
                  task={task}
                  index={index}
                  selected={index === activeIndex}
                  locale={locale}
                  canOpen={canOpen}
                  onPress={() => press(index)}
                />
              </li>
            );
          })}
          {overflow ? (
            <li className="ba-task-progress__item">
              <DialogTrigger
                isOpen={open}
                onOpenChange={(next) => {
                  setOpen(next);
                  onPopoverOpenChange?.(next);
                }}
              >
                <Button className="ba-task-progress__more" aria-label={locale === 'zh' ? '全部活动屏' : 'All activity screens'}>
                  <span aria-hidden="true">…</span>
                </Button>
                <Popover className="ba-task-progress__popover" placement="bottom" offset={8}>
                  <Dialog aria-label={locale === 'zh' ? '全部活动屏' : 'All activity screens'} className="ba-task-progress__dialog">
                    <ol className="ba-task-progress__grid">
                      {tasks.map((task, index) => (
                        <li key={task.id}>
                          <ScreenButton
                            task={task}
                            index={index}
                            selected={index === activeIndex}
                            locale={locale}
                            canOpen={canOpen}
                            size="regular"
                            onPress={() => {
                              press(index);
                              if (taskMayNavigate(task.status, index, canOpen)) setOpen(false);
                            }}
                          />
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

function ScreenButton({
  task,
  index,
  selected,
  locale,
  canOpen,
  onPress,
  size = 'compact',
}: {
  task: TaskProgressItem;
  index: number;
  selected: boolean;
  locale: BALocale;
  canOpen: (index: number) => boolean;
  onPress: () => void;
  size?: 'compact' | 'regular';
}) {
  const copy = taskChrome(locale);
  const number = task.number ?? index + 1;
  const openable = taskMayNavigate(task.status, index, canOpen);
  const statusWord = copy.status[task.status];
  return (
    <Button
      className="ba-task-progress__button"
      data-state={task.status}
      data-task-index={index}
      data-selected={selected ? 'true' : 'false'}
      isDisabled={!openable}
      aria-current={selected ? 'step' : undefined}
      aria-label={copy.task(number, task.label, statusWord, task.revealed)}
      onPress={onPress}
    >
      <ActivityScreenIndicator
        number={number}
        status={task.status}
        selected={selected}
        revealed={task.revealed}
        size={size}
      />
      {task.status === 'skipped' ? <span className="ba-task-progress__caption">{statusWord}</span> : null}
    </Button>
  );
}

export { taskMayNavigate };
