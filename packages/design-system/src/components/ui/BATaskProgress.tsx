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

const ITEM_SLOT = 52;
const MORE_SLOT = 48;

function statusWord(task: TaskProgressItem, locale: BALocale): string {
  if (task.revealed) return locale === 'zh' ? '已显示答案' : 'answer shown';
  return taskChrome(locale).status[task.status];
}

/**
 * Shared circle used by the top bar and the All activity screens popover.
 * The numeral always stays visible. Done and locked add a badge under the circle.
 */
export function ActivityScreenIndicator({
  task,
  index,
  activeIndex,
  canOpen,
  onNavigate,
  locale = 'en',
  compact = false,
}: {
  task: TaskProgressItem;
  index: number;
  activeIndex: number;
  canOpen: (index: number) => boolean;
  onNavigate?: (index: number) => void;
  locale?: BALocale;
  compact?: boolean;
}) {
  const copy = taskChrome(locale);
  const number = task.number ?? index + 1;
  const openable = taskMayNavigate(task.status, index, canOpen);
  const selected = index === activeIndex;
  const showCheck = task.status === 'done' && !task.revealed;
  const showLock = task.status === 'locked';
  return (
    <Button
      className="ba-task-progress__button"
      data-state={task.status}
      data-selected={selected ? 'true' : 'false'}
      data-revealed={task.revealed ? 'true' : undefined}
      data-size={compact ? 'compact' : 'regular'}
      data-task-index={index}
      data-popover-current={selected ? 'true' : undefined}
      isDisabled={!openable}
      aria-current={selected ? 'step' : undefined}
      aria-label={copy.task(number, task.label, statusWord(task, locale))}
      onPress={() => {
        if (openable) onNavigate?.(index);
      }}
    >
      <span className="ba-task-progress__marker" aria-hidden="true">
        <span className="ba-task-progress__numeral">{number}</span>
        {showCheck ? (
          <span className="ba-task-progress__badge" data-badge="check">
            <BAIcon name="check" size={12} className="ba-task-progress__icon" />
          </span>
        ) : null}
        {showLock ? (
          <span className="ba-task-progress__badge" data-badge="lock">
            <BAIcon name="lock" size={12} className="ba-task-progress__icon" />
          </span>
        ) : null}
      </span>
      {task.status === 'skipped' ? <span className="ba-task-progress__caption">{copy.status.skipped}</span> : null}
    </Button>
  );
}

function visibleRange(count: number, activeIndex: number, capacity: number): { start: number; end: number } {
  if (capacity >= count) return { start: 0, end: count };
  const size = Math.max(1, capacity);
  let start = Math.max(0, Math.min(activeIndex - Math.floor((size - 1) / 2), count - size));
  return { start, end: start + size };
}

/**
 * BA-UI-006 · activity screen indicator group.
 * Not a tab list. Entitlement stays in `canOpen`, which the product adapter supplies.
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
  const moreRef = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const node = railRef.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const capacity = width < MORE_SLOT ? tasks.length : Math.max(1, Math.floor((width - MORE_SLOT) / ITEM_SLOT));
  const range = visibleRange(tasks.length, activeIndex, capacity);
  const visible = tasks.slice(range.start, range.end);
  const allLabel = locale === 'zh' ? '全部活动屏' : 'All activity screens';

  return (
    <nav className="ba-task-progress" data-component="BA-UI-006" aria-label={label ?? copy.nav}>
      <div className="ba-task-progress__rail" ref={railRef}>
        <ol className="ba-task-progress__list" aria-hidden={popoverOpen ? true : undefined}>
          {visible.map((task, offset) => {
            const index = range.start + offset;
            return (
              <li className="ba-task-progress__item" key={task.id}>
                <ActivityScreenIndicator
                  task={task}
                  index={index}
                  activeIndex={activeIndex}
                  canOpen={canOpen}
                  onNavigate={onNavigate}
                  locale={locale}
                  compact
                />
              </li>
            );
          })}
        </ol>
        <DialogTrigger
          onOpenChange={(open) => {
            setPopoverOpen(open);
            onPopoverOpenChange?.(open);
            if (!open) window.setTimeout(() => moreRef.current?.focus(), 0);
          }}
        >
          <Button ref={moreRef} className="ba-task-progress__more" data-testid="all-activity-screens" aria-label={allLabel}>
            <span aria-hidden="true">…</span>
          </Button>
          <Popover isNonModal className="ba-task-progress__popover" placement="bottom" offset={8}>
            <Dialog className="ba-task-progress__dialog" aria-label={allLabel}>
              <ol className="ba-task-progress__grid">
                {tasks.map((task, index) => (
                  <li key={task.id}>
                    <ActivityScreenIndicator
                      task={task}
                      index={index}
                      activeIndex={activeIndex}
                      canOpen={canOpen}
                      onNavigate={(next) => {
                        onNavigate?.(next);
                      }}
                      locale={locale}
                    />
                  </li>
                ))}
              </ol>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
    </nav>
  );
}

export { taskMayNavigate };
