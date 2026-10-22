import { useEffect, useRef } from 'react';
import { Button } from 'react-aria-components';
import { BAIcon } from './BAIcon';
import type { BALocale, TaskProgressItem } from '../../types/task';
import { taskChrome, taskMayNavigate } from '../../i18n/chrome';
import './BATaskProgress.css';

export interface BATaskProgressProps {
  tasks: readonly TaskProgressItem[];
  activeIndex: number;
  canOpen: (index: number) => boolean;
  onNavigate?: (index: number) => void;
  locale?: BALocale;
  /** Accessible name for the whole group. Defaults to the locale chrome string. */
  label?: string;
}

function Marker({ status, number }: { status: TaskProgressItem['status']; number: number }) {
  return (
    <>
      <span className="ba-task-progress__digit">{number}</span>
      {status === 'done' ? (
        <span className="ba-task-progress__badge" data-badge="check">
          <BAIcon name="check" size={12} className="ba-task-progress__icon" />
        </span>
      ) : null}
      {status === 'locked' ? (
        <span className="ba-task-progress__badge" data-badge="lock">
          <BAIcon name="lock" size={12} className="ba-task-progress__icon" />
        </span>
      ) : null}
    </>
  );
}

/**
 * BA-UI-006 · task number and completion group.
 * Not a tab list. Entitlement stays in `canOpen`, which the product adapter supplies.
 */
export function BATaskProgress({
  tasks,
  activeIndex,
  canOpen,
  onNavigate,
  locale = 'en',
  label,
}: BATaskProgressProps) {
  const copy = taskChrome(locale);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
    current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeIndex, tasks, locale]);

  return (
    <nav className="ba-task-progress" data-component="BA-UI-006" aria-label={label ?? copy.nav}>
      <div className="ba-task-progress__rail">
        <ol className="ba-task-progress__list" ref={listRef}>
          {tasks.map((task, index) => {
            const number = task.number ?? index + 1;
            const openable = taskMayNavigate(task.status, index, canOpen);
            const isCurrent = index === activeIndex;
            const statusWord = copy.status[task.status];
            return (
              <li className="ba-task-progress__item" key={task.id}>
                <Button
                  className="ba-task-progress__button"
                  data-state={task.status}
                  data-task-index={index}
                  isDisabled={!openable}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={copy.task(number, task.label, statusWord)}
                  onPress={() => {
                    if (openable) onNavigate?.(index);
                  }}
                >
                  <span className="ba-task-progress__marker" aria-hidden="true">
                    <Marker status={task.status} number={number} />
                  </span>
                  {task.status === 'skipped' ? (
                    <span className="ba-task-progress__caption">{statusWord}</span>
                  ) : null}
                </Button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export { taskMayNavigate };
