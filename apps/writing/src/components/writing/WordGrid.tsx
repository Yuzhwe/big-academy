import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';
import type { BALocale } from '@big-academy/design-system';
import './WordGrid.css';

/** Word-card state. Insertion is not a grade. */
export type WordCardState = 'available' | 'used' | 'disabled' | 'focused';

export interface WordCard {
  id: string;
  /** English learning material. Not translated in Chinese UI mode. */
  text: string;
  state?: WordCardState;
}

export interface WordGroup {
  id: string;
  /** Already localized by the caller (Opinion / 观点). */
  label: string;
  words: readonly WordCard[];
  /** Candidate tone id. Colors stay [E] tokens. */
  tone?: string;
}

export interface WordInsert {
  id: string;
  text: string;
  groupId: string;
}

export interface WordGridProps {
  groups: readonly WordGroup[];
  activeGroup: string;
  presentation?: 'docked' | 'overlay';
  onGroupChange?: (key: string) => void;
  /** Inserts into the caller-owned writing target. Must not grade. */
  onInsert?: (word: WordInsert) => void;
  locale?: BALocale;
  label?: string;
}

/**
 * BA-WR-003 · vocabulary palette.
 * One group renders cards only. Several groups use connected sticky tabs
 * that belong to this component, not the global BATabs skin.
 * The overlay presentation is positioned by the writing host, never the viewport.
 */
export function WordGrid({
  groups,
  activeGroup,
  presentation = 'docked',
  onGroupChange,
  onInsert,
  locale = 'en',
  label,
}: WordGridProps) {
  const zh = locale === 'zh';
  const active = groups.find((group) => group.id === activeGroup) ?? groups[0];
  const tone = active?.tone ?? active?.id ?? 'neutral';
  const accessibleLabel = label ?? (zh ? '词格' : 'Word grid');

  if (!active) return null;

  const words = (
    <ul className="word-grid__words">
      {active.words.length ? (
        active.words.map((word) => {
          const state = word.state ?? 'available';
          const used = state === 'used';
          const disabled = state === 'disabled';
          return (
            <li key={word.id}>
              <button
                type="button"
                className="word-grid__word"
                data-state={state}
                lang="en"
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (disabled) return;
                  onInsert?.({ id: word.id, text: word.text, groupId: active.id });
                }}
              >
                <span className="word-grid__word-text">{word.text}</span>
                {used ? <span className="word-grid__word-state">{zh ? '已用' : 'Used'}</span> : null}
                {disabled ? <span className="word-grid__word-state">{zh ? '不可用' : 'Unavailable'}</span> : null}
              </button>
            </li>
          );
        })
      ) : (
        <li>
          <p className="word-grid__empty" data-state="empty-group">
            {zh ? '这一组现在没有词。' : 'This group has no words right now.'}
          </p>
        </li>
      )}
    </ul>
  );

  return (
    <div
      className="word-grid"
      data-component="BA-WR-003"
      data-presentation={presentation}
      data-tone={tone}
      data-groups={groups.length}
      lang={zh ? 'zh-CN' : 'en'}
    >
      {groups.length < 2 ? (
        <div className="word-grid__body" role="group" aria-label={accessibleLabel} data-tone={tone}>
          {words}
        </div>
      ) : (
        <Tabs
          selectedKey={active.id}
          onSelectionChange={(key) => onGroupChange?.(String(key))}
        >
          <TabList className="word-grid__tabs" aria-label={accessibleLabel}>
            {groups.map((group) => (
              <Tab
                key={group.id}
                id={group.id}
                className={`word-grid__tab word-grid__tab--${group.tone ?? group.id}`}
              >
                {group.label}
              </Tab>
            ))}
          </TabList>
          <TabPanel id={active.id} className="word-grid__body">
            {words}
          </TabPanel>
        </Tabs>
      )}
    </div>
  );
}
