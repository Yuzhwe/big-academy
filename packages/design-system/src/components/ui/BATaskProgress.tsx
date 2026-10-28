import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  label?: string;
}

const MAX_SLOTS = 9;
const SLOT_WIDTH = 44;
const ITEM_GAP = 4;

function capacity(width: number): number {
  return Math.max(1, Math.min(MAX_SLOTS, Math.floor((width + ITEM_GAP) / (SLOT_WIDTH + ITEM_GAP))));
}

/** Single visual implementation, used unchanged in the top rail and full-index popover. */
function Indicator({ task, index, activeIndex, canOpen, onNavigate, locale }: {
  task: TaskProgressItem; index: number; activeIndex: number;
  canOpen: (index: number) => boolean; onNavigate?: (index: number) => void; locale: BALocale;
}) {
  const copy = taskChrome(locale);
  const openable = taskMayNavigate(task.status, index, canOpen);
  return <Button
    className="ba-task-progress__button"
    data-state={task.status}
    data-selected={index === activeIndex ? 'true' : 'false'}
    data-task-index={index}
    isDisabled={!openable}
    aria-current={index === activeIndex ? 'step' : undefined}
    aria-label={copy.task(task.number ?? index + 1, task.label, copy.status[task.status])}
    onPress={() => { if (openable) onNavigate?.(index); }}
  >
    <span className="ba-task-progress__marker" aria-hidden="true">
      <span className="ba-task-progress__digit">{task.number ?? index + 1}</span>
    </span>
  </Button>;
}

/** Numeric progress status is data; selection is the current view, not a new grade. */
export function BATaskProgress({ tasks, activeIndex, canOpen, onNavigate, locale = 'en', label }: BATaskProgressProps) {
  const copy = taskChrome(locale);
  const rootRef = useRef<HTMLElement>(null);
  const overflowRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, left: 0, width: 424 });
  const previousActive = useRef(activeIndex);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => setAvailableWidth(root.clientWidth || 480); // JSDOM and unmeasured initial render
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const slots = capacity(availableWidth);
  const hasOverflow = tasks.length > slots;
  const visibleCount = hasOverflow ? Math.max(0, slots - 1) : Math.min(tasks.length, slots);
  const safeActive = Math.max(0, Math.min(tasks.length - 1, activeIndex));
  // Center around the current activity when practical, preserving original order.
  const first = Math.max(0, Math.min(tasks.length - visibleCount, safeActive - Math.floor((visibleCount - 1) / 2)));
  const visibleIndices = Array.from({ length: visibleCount }, (_, i) => first + i);

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => {
      const target = overflowRef.current ?? rootRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
      target?.focus();
    });
  };
  const place = () => {
    const trigger = overflowRef.current;
    if (!trigger) return;
    const bounds = trigger.getBoundingClientRect();
    const width = Math.min(424, window.innerWidth - 24);
    const left = Math.max(12, Math.min(window.innerWidth - width - 12, bounds.right - width));
    const estimatedHeight = Math.min(500, 134 + Math.ceil(tasks.length / 6) * 48);
    const top = bounds.bottom + 8 + estimatedHeight <= window.innerHeight - 12
      ? bounds.bottom + 8 : Math.max(12, bounds.top - estimatedHeight - 8);
    setAnchor({ top, left, width });
  };
  const toggle = () => { if (open) { close(); return; } place(); setOpen(true); };

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!popoverRef.current?.contains(target) && !overflowRef.current?.contains(target)) close();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
    };
    const reposition = () => place();
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', keydown);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', keydown);
      window.removeEventListener('resize', reposition);
    };
  }, [open, tasks.length]);

  useEffect(() => {
    if (previousActive.current !== activeIndex) {
      previousActive.current = activeIndex;
      setOpen(false);
    }
  }, [activeIndex]);

  useEffect(() => {
    if (open) popoverRef.current?.querySelector<HTMLElement>('[aria-current="step"]')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [open, activeIndex]);

  return <>
    <nav ref={rootRef} className="ba-task-progress" data-component="BA-UI-006" aria-label={label ?? copy.nav}>
      <ol className="ba-task-progress__list">
        {visibleIndices.map(index => <li className="ba-task-progress__item" key={tasks[index].id}>
          <Indicator task={tasks[index]} index={index} activeIndex={activeIndex} canOpen={canOpen} onNavigate={onNavigate} locale={locale}/>
        </li>)}
        {hasOverflow && <li className="ba-task-progress__item">
          <Button ref={overflowRef} className="ba-task-progress__button ba-task-progress__more"
            aria-label={locale === 'zh' ? '所有活动页面' : 'All activity screens'}
            aria-haspopup="dialog" aria-expanded={open} onPress={toggle}>
            <span className="ba-task-progress__marker" aria-hidden="true">···</span>
          </Button>
        </li>}
      </ol>
    </nav>
    {open && hasOverflow && createPortal(
      <div className="ba-task-progress__popover" ref={popoverRef} role="dialog"
        aria-modal="false" aria-label={locale === 'zh' ? '所有活动页面' : 'All activity screens'}
        style={{ top: anchor.top, left: anchor.left, width: anchor.width }}>
        <div className="ba-task-progress__popover-header">
          <h2>{locale === 'zh' ? '所有活动页面' : 'All activity screens'}</h2>
          <Button className="ba-task-progress__close"
            aria-label={locale === 'zh' ? '关闭' : 'Close'} onPress={() => close()}>×</Button>
        </div>
        <ol className="ba-task-progress__popover-grid">
          {tasks.map((task, index) => <li key={task.id}>
            <Indicator task={task} index={index} activeIndex={activeIndex}
              canOpen={canOpen} locale={locale}
              onNavigate={destination => { close(false); onNavigate?.(destination); requestAnimationFrame(() => {
                (overflowRef.current ?? rootRef.current?.querySelector<HTMLElement>('[aria-current="step"]'))?.focus();
              }); }}/>
          </li>)}
        </ol>
      </div>, document.body
    )}
  </>;
}
export { taskMayNavigate };
