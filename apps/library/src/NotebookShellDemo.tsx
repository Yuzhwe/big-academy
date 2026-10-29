import { useCallback, useRef, useState, type ChangeEvent, type FocusEvent, type SyntheticEvent } from 'react';
import { NotebookShell, type NotebookOrientation } from '../../writing/src/components/writing/NotebookShell';
import { WordGrid, type WordGridGroup } from '../../writing/src/components/writing/WordGrid';

type Locale = 'en' | 'zh';

function demoGroups(locale: Locale): WordGridGroup[] {
  if (locale === 'zh') {
    return [
      {
        id: 'link',
        label: '连接',
        words: [
          { id: 'zh-because', text: '因为' },
          { id: 'zh-so', text: '所以' },
          { id: 'zh-but', text: '但是' },
        ],
      },
      {
        id: 'place',
        label: '地点',
        words: [
          { id: 'zh-garden', text: '花园' },
          { id: 'zh-school', text: '学校' },
          { id: 'zh-park', text: '公园' },
        ],
      },
      {
        id: 'feel',
        label: '感受',
        words: [
          { id: 'zh-happy', text: '开心' },
          { id: 'zh-tired', text: '累' },
          { id: 'zh-proud', text: '骄傲' },
        ],
      },
    ];
  }
  return [
    {
      id: 'link',
      label: 'Link',
      words: [
        { id: 'en-because', text: 'because' },
        { id: 'en-so', text: 'so' },
        { id: 'en-but', text: 'but' },
      ],
    },
    {
      id: 'place',
      label: 'Place',
      words: [
        { id: 'en-garden', text: 'garden' },
        { id: 'en-school', text: 'school' },
        { id: 'en-park', text: 'park' },
      ],
    },
    {
      id: 'feel',
      label: 'Feel',
      words: [
        { id: 'en-happy', text: 'happy' },
        { id: 'en-tired', text: 'tired' },
        { id: 'en-proud', text: 'proud' },
      ],
    },
  ];
}

/** Insert `word` at caret (replaces selection). Adds spaces so words don't glue together. */
function insertAtCaret(value: string, start: number, end: number, word: string): { value: string; caret: number } {
  const from = Math.max(0, Math.min(start, value.length));
  const to = Math.max(from, Math.min(end, value.length));
  const before = value.slice(0, from);
  const after = value.slice(to);
  const lead =
    before.length > 0 &&
    !/\s$/.test(before) &&
    !/^[.,!?;:]/.test(word)
      ? ' '
      : '';
  const trail =
    after.length > 0 &&
    !/^\s/.test(after) &&
    !/^[.,!?;:]/.test(after) &&
    !/[.,!?;:]$/.test(word)
      ? ' '
      : '';
  const chunk = lead + word + trail;
  const next = before + chunk + after;
  return { value: next, caret: before.length + chunk.length };
}

export function NotebookShellDemo({
  orientation = 'portrait',
  locale = 'en',
}: {
  orientation?: NotebookOrientation;
  locale?: Locale;
}) {
  const groups = demoGroups(locale);
  const [activeGroup, setActiveGroup] = useState(groups[0].id);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef({ start: 0, end: 0 });

  const rememberCaret = useCallback((el: HTMLTextAreaElement) => {
    caretRef.current = {
      start: el.selectionStart ?? el.value.length,
      end: el.selectionEnd ?? el.value.length,
    };
  }, []);

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    rememberCaret(event.target);
  };

  const onCaretEvent = (event: FocusEvent<HTMLTextAreaElement> | SyntheticEvent<HTMLTextAreaElement>) => {
    rememberCaret(event.currentTarget);
  };

  const onInsert = useCallback((word: string) => {
    const el = inputRef.current;
    const start = el ? el.selectionStart ?? caretRef.current.start : caretRef.current.start;
    const end = el ? el.selectionEnd ?? caretRef.current.end : caretRef.current.end;
    const base = el ? el.value : text;
    const next = insertAtCaret(base, start, end, word);
    setText(next.value);
    caretRef.current = { start: next.caret, end: next.caret };
    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(next.caret, next.caret);
      rememberCaret(node);
    });
  }, [rememberCaret, text]);

  return (
    <NotebookShell orientation={orientation}>
      <div className="notebook-shell-demo__field">
        <textarea
          ref={inputRef}
          className="notebook-shell-demo__input"
          rows={4}
          value={text}
          onChange={onChange}
          onFocus={onCaretEvent}
          onSelect={onCaretEvent}
          onKeyUp={onCaretEvent}
          onClick={onCaretEvent}
          placeholder={locale === 'zh' ? '在这里写…' : 'Write here…'}
          aria-label={locale === 'zh' ? '笔记本示意输入' : 'Notebook demo input'}
          data-testid="notebook-shell-demo-input"
        />
      </div>
      <div className="notebook-shell-demo__words" data-testid="notebook-shell-wordgrid">
        <WordGrid
          groups={groups}
          activeGroup={activeGroup}
          tabs="show"
          locale={locale === 'zh' ? 'zh' : 'en'}
          onGroupChange={setActiveGroup}
          onInsert={onInsert}
        />
      </div>
    </NotebookShell>
  );
}

export default NotebookShellDemo;
