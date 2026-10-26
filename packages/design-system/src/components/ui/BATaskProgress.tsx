import { useEffect, useRef } from 'react';
import { Button } from 'react-aria-components';
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

/** Visual-only marker. Progress and selection stay separate; aria-label owns status. */
function Marker({ number }: { number: number }) {
  return <span className="ba-task-progress__digit">{number}</span>;
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
                  data-selected={isCurrent ? 'true' : 'false'}
                  data-task-index={index}
                  isDisabled={!openable}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={copy.task(number, task.label, statusWord)}
                  onPress={() => {
                    if (openable) onNavigate?.(index);
                  }}
                >
                  <span className="ba-task-progress__marker" aria-hidden="true">
                    <Marker number={number} />
                  </span>
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
