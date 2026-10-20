import { Button, Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
export interface WordGroup {
  id: string;
  label: string;
  words: string[];
}
export interface WordGridProps {
  groups: WordGroup[];
  activeGroup: string;
  onGroupChange: (key: string) => void;
  onInsert: (word: string) => void;
}
/** BA-WR-003 · no scoring or editor state. Parent preserves the active selection. */
export function WordGrid({ groups, activeGroup, onGroupChange, onInsert }: WordGridProps) {
  return (
    <Tabs
      className="writing-word-grid"
      data-component="BA-WR-003"
      selectedKey={activeGroup}
      onSelectionChange={(key) => onGroupChange(String(key))}
    >
      <TabList className="word-grid-tabs" aria-label="Word groups">
        {groups.map((g) => (
          <Tab id={g.id} key={g.id}>
            {g.label}
          </Tab>
        ))}
      </TabList>
      {groups.map((g) => (
        <TabPanel id={g.id} key={g.id} className="word-grid-panel">
          {g.words.map((word, i) => (
            <Button key={i} onPress={() => onInsert(word)}>
              {word}
            </Button>
          ))}
        </TabPanel>
      ))}
    </Tabs>
  );
}
