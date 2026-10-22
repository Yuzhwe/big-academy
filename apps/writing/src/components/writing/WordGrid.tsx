import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
import type { BALocale } from '@big-academy/design-system';
import './WordGrid.css';

export interface WordGridWord {
  id: string;
  text: string;
  used?: boolean;
  hint?: boolean;
  shake?: boolean;
}

export interface WordGridGroup {
  id: string;
  label: string;
  words: WordGridWord[];
}

export interface WordGridProps {
  groups: WordGridGroup[];
  activeGroup: string;
  presentation?: 'docked' | 'overlay';
  locale?: BALocale;
  onGroupChange?: (key: string) => void;
  onInsert?: (word: string) => void;
}

/**
 * BA-WR-003 vocabulary palette.
 * Tabs change the visible set only. The parent owns insertion and grading.
 * Peach connected sticky tabs and white pills are Approved.
 */
export function WordGrid({
  groups,
  activeGroup,
  presentation = 'docked',
  locale = 'en',
  onGroupChange,
  onInsert,
}: WordGridProps) {
  if (!groups.length) return null;
  const active = groups.some((group) => group.id === activeGroup) ? activeGroup : groups[0].id;
  const current = groups.find((group) => group.id === active) ?? groups[0];
  const showTabs = groups.length > 1;

  const cards = (
    <div className="word-grid__cards" data-testid="word-grid-cards">
      {current.words.length ? (
        current.words.map((word) => (
          <button
            key={word.id}
            type="button"
            className={word.shake ? 'word-grid__card shake' : 'word-grid__card'}
            lang="en"
            data-used={word.used ? 'true' : undefined}
            data-hint={word.hint ? 'true' : undefined}
            data-shake={word.shake ? 'true' : undefined}
            disabled={word.used}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onInsert?.(word.text)}
          >
            {word.text}
          </button>
        ))
      ) : (
        <p className="word-grid__empty">{locale === 'zh' ? '这里还没有词。' : 'Nothing here yet.'}</p>
      )}
    </div>
  );

  if (!showTabs) {
    return (
      <div className="word-grid" data-component="BA-WR-003" data-presentation={presentation} data-visual="approved" data-tabs="off">
        {cards}
      </div>
    );
  }

  return (
    <Tabs
      className="word-grid"
      data-component="BA-WR-003"
      data-presentation={presentation}
      data-visual="approved"
      selectedKey={active}
      onSelectionChange={(key) => onGroupChange?.(String(key))}
    >
      <TabList className="word-grid__tabs" aria-label={locale === 'zh' ? '词表分类' : 'Word groups'}>
        {groups.map((group) => (
          <Tab key={group.id} id={group.id} className="word-grid__tab">
            {group.label}
          </Tab>
        ))}
      </TabList>
      <TabPanel id={active} className="word-grid__panel">
        {cards}
      </TabPanel>
    </Tabs>
  );
}
