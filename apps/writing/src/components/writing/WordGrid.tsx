import { useEffect, useId, useRef } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';
import type { BALocale } from '@big-academy/design-system';
import './WordGrid.css';

export interface WordGridCell {
  id: string;
  text: string;
  gloss?: string;
  caption?: string;
}

export interface WordGridGroup {
  id: string;
  label: string;
  cells: WordGridCell[];
}

export type WordGridMode = 'expanded' | 'collapsed' | 'locked' | 'empty';

export interface WordGridProps {
  groups: WordGridGroup[];
  activeGroup: string;
  presentation: 'docked' | 'overlay';
  /** Additive. Defaults to expanded when groups exist. */
  mode?: WordGridMode;
  /** Overlay starts closed. Docked expanded ignores this and stays open. */
  open?: boolean;
  locale?: BALocale;
  messages?: {
    locked?: string;
    collapsed?: string;
    empty?: string;
    open?: string;
    fold?: string;
  };
  onGroupChange: (key: string) => void;
  onInsert: (word: string) => void;
  onOpenChange?: (open: boolean) => void;
}

const copy = {
  en: {
    locked: 'The word grid is off for this check. Use the keyboard.',
    collapsed: 'The grid is folded away.',
    empty: 'Use the keyboard here.',
    open: 'Open the grid',
    fold: 'Fold away',
    label: 'Word grid',
  },
  zh: {
    locked: '这次检查关掉了词表。请用键盘。',
    collapsed: '词表折起来了。',
    empty: '这里用键盘。',
    open: '打开词表',
    fold: '折起词表',
    label: '词表',
  },
};

/**
 * BA-WR-003 · word grid.
 * Tabs switch real groups. The grid does not score or unlock.
 * Tablet overlay stays in the writing column. Candidate Warm Frame. Not validated.
 */
export function WordGrid({
  groups,
  activeGroup,
  presentation,
  mode = 'expanded',
  open = false,
  locale = 'en',
  messages,
  onGroupChange,
  onInsert,
  onOpenChange,
}: WordGridProps) {
  const text = { ...copy[locale], ...stripEmpty(messages) };
  const restoreFocus = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const overlayOpen = presentation === 'overlay' && mode === 'expanded' && open;

  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onOpenChange?.(false);
      restoreFocus.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpenChange, overlayOpen]);

  function rememberFocus() {
    const current = document.activeElement;
    if (current instanceof HTMLElement) restoreFocus.current = current;
  }

  function openOverlay() {
    onOpenChange?.(true);
    window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('[role="tab"]')?.focus());
  }

  function closeOverlay() {
    onOpenChange?.(false);
    restoreFocus.current?.focus();
  }

  if (mode === 'locked') {
    return (
      <div className="word-grid word-grid--locked" data-component="BA-WR-003" data-mode="locked" data-testid="word-grid">
        <p>{text.locked}</p>
      </div>
    );
  }

  if (mode === 'collapsed' || mode === 'empty') {
    return (
      <div
        className="word-grid word-grid--bar"
        data-component="BA-WR-003"
        data-mode={mode}
        data-testid="word-grid"
      >
        <p>{mode === 'empty' ? text.empty : text.collapsed}</p>
        {mode === 'collapsed' ? (
          <button type="button" className="word-grid__text-button" onClick={() => onOpenChange?.(true)}>
            {text.open}
          </button>
        ) : null}
      </div>
    );
  }

  if (presentation === 'overlay' && !open) {
    return (
      <div className="word-grid word-grid--overlay" data-component="BA-WR-003" data-mode="collapsed" data-presentation="overlay" data-testid="word-grid">
        <button type="button" className="word-grid__text-button" onPointerDown={rememberFocus} onClick={openOverlay}>
          {text.open}
        </button>
      </div>
    );
  }

  const selected = groups.some((group) => group.id === activeGroup) ? activeGroup : groups[0]?.id;

  return (
    <div
      className={`word-grid word-grid--expanded word-grid--${presentation}`}
      data-component="BA-WR-003"
      data-mode="expanded"
      data-presentation={presentation}
      data-testid="word-grid"
    >
      <div className="word-grid__panel" ref={panelRef}>
        <div className="word-grid__bar">
          <p id={titleId}>{text.label}</p>
          {presentation === 'overlay' ? (
            <button type="button" className="word-grid__text-button" onClick={closeOverlay}>
              {text.fold}
            </button>
          ) : (
            <button type="button" className="word-grid__text-button" onClick={() => onOpenChange?.(false)}>
              {text.fold}
            </button>
          )}
        </div>
        {selected ? (
          <Tabs selectedKey={selected} onSelectionChange={(key) => onGroupChange(String(key))}>
            <TabList aria-label={text.label} className="word-grid__tabs">
              {groups.map((group) => (
                <Tab key={group.id} id={group.id} className="word-grid__tab">
                  {group.label}
                </Tab>
              ))}
            </TabList>
            {groups.map((group) => (
              <TabPanel key={group.id} id={group.id} className="word-grid__cells">
                {group.cells.length ? (
                  group.cells.map((cell) => (
                    <button
                      key={cell.id}
                      type="button"
                      className="word-grid__cell"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onInsert(cell.text)}
                    >
                      <span className="word-grid__word">{cell.text}</span>
                      {cell.gloss ? <span className="word-grid__gloss">{cell.gloss}</span> : null}
                      {cell.caption ? <span className="word-grid__gloss">{cell.caption}</span> : null}
                    </button>
                  ))
                ) : (
                  <p className="word-grid__empty">{text.empty}</p>
                )}
              </TabPanel>
            ))}
          </Tabs>
        ) : (
          <p className="word-grid__empty">{text.empty}</p>
        )}
      </div>
    </div>
  );
}

function stripEmpty(messages: WordGridProps['messages']): Partial<(typeof copy)['en']> {
  if (!messages) return {};
  const next: Partial<(typeof copy)['en']> = {};
  if (messages.locked) next.locked = messages.locked;
  if (messages.collapsed) next.collapsed = messages.collapsed;
  if (messages.empty) next.empty = messages.empty;
  if (messages.open) next.open = messages.open;
  if (messages.fold) next.fold = messages.fold;
  return next;
}
