import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-aria-components';
import { BAButton, BAChoice, BAField, BAIcon, BANumber, type ChoiceState } from '@big-academy/design-system';
import type { CourseSession, TaskProgress } from '../../product/courseSession';
import { WordGrid } from './WordGrid';
import type { AlexTask } from '../../product/loadAlexSource';

/** BA-WR-007 · task-specific composition. CourseSession owns every learning decision. */
export function LessonActivity({ session: s }: { session: CourseSession }) {
  const sc = s.currentScreen(),
    model = s.activity()!,
    check = sc.kind === 'check';
  const c = check ? s.checkState() : null;
  const t = check ? s.checkTask() : s.currentTask();
  const st = check ? s.checkAnswer() : t ? s.practiceState() : null;
  const graded = check ? !!c?.finished : st?.status !== 'open';
  const result = check && c?.finished ? c.history.at(-1)?.results[c.view ?? c.q] : null;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const question = c?.view ?? c?.q;
  useEffect(() => {
    titleRef.current?.focus();
  }, [sc.id, question]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.isComposing ||
        /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName) ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;
      if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName !== 'BUTTON') {
        e.preventDefault();
        s.pressPrimary();
        return;
      }
      if (t?.type !== 'pick' || graded) return;
      const i = /^[1-9]$/.test(e.key)
        ? Number(e.key) - 1
        : /^[a-i]$/i.test(e.key)
          ? e.key.toUpperCase().charCodeAt(0) - 65
          : -1;
      if (i >= 0 && i < (t.lines?.length ?? 0)) {
        e.preventDefault();
        s.selectAnswer(i);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [s, t, graded]);
  const read = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t ? s.text(t.ask) : (model.learn?.teach ?? model.title));
    u.lang = s.zh ? 'zh-CN' : 'en-US';
    window.speechSynthesis.speak(u);
  };
  if (check && c?.finished && c.view == null) {
    const last = c.history.at(-1)!;
    return (
      <article className="lesson-activity" data-template="P7" data-screen={sc.id}>
        <p className="activity-eyebrow">
          CHECK · SET <BANumber>{c.attempt + 1}</BANumber>
        </p>
        <h1 ref={titleRef} tabIndex={-1} className="course-title">
          {c.passed ? 'You passed this check.' : 'Not yet.'}
        </h1>
        <p className="result-summary" data-testid="check-result">
          <BANumber>{last.score}</BANumber> of <BANumber>4</BANumber> ·{' '}
          {c.passed ? 'Topic sentences' : 'We’ll practise this again together.'}
        </p>
        <p>Open a question to see your answer and the explanation.</p>
        <div className="assessment-results">
          {last.results.map((r, i) => (
            <Button
              key={r.id}
              className="assessment-row"
              data-testid="result-row"
              onPress={() => s.setQuestion(i)}
            >
              <BANumber>{i + 1}</BANumber>
              <span>{s.text(s.task(r.id).ask)}</span>
              <strong>{r.correct ? '✓ Right' : '↻ Look again'}</strong>
            </Button>
          ))}
        </div>
        {!c.passed ? (
          <BAButton variant="secondary" onPress={() => s.newCheckSet()}>
            Try a new set
          </BAButton>
        ) : null}
      </article>
    );
  }
  return (
    <article
      id="course-main"
      lang="en"
      className="lesson-activity"
      data-template={sc.template}
      data-screen={sc.id}
    >
      <div className="activity-meta">
        <p className="activity-eyebrow">
          {check ? 'CHECK' : sc.kind === 'learn' ? 'LEARN' : sc.kind === 'apply' ? 'YOUR TURN' : 'PRACTICE'} ·{' '}
          <BANumber>{s.state.screen + 1}</BANumber> OF <BANumber>8</BANumber>
        </p>
        <Button className="read-aloud" aria-label="Read the prompt aloud" onPress={read}>
          <BAIcon name="book" size={18} /> Listen
        </Button>
      </div>
      {check && c ? (
        <>
          <div className="question-bar">
            <span>
              Question <BANumber>{(question ?? 0) + 1}</BANumber> of <BANumber>4</BANumber>
            </span>
            <div className="question-dots">
              {[0, 1, 2, 3].map((i) => (
                <Button
                  key={i}
                  aria-label={`Question ${i + 1}${s.answered(i) ? ', answered' : ', unanswered'}`}
                  aria-current={i === question ? 'step' : undefined}
                  data-answered={s.answered(i) || undefined}
                  onPress={() => s.setQuestion(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            {c.finished ? <Button onPress={() => s.allResults()}>All results</Button> : null}
          </div>
          <p className="assessment-note">No grid and no help this time.</p>
        </>
      ) : null}
      <h1 ref={titleRef} tabIndex={-1} className="course-title">
        {sc.kind === 'learn'
          ? 'Topic sentences'
          : t?.ask
            ? typeof t.ask === 'string'
              ? t.ask
              : t.ask.en
            : model.title}
      </h1>
      {s.zh && t?.ask && typeof t.ask !== 'string' && t.ask.zh ? (
        <p className="prompt-zh" lang="zh-CN">
          {t.ask.zh}
        </p>
      ) : null}
      {sc.kind === 'learn' ? (
        <>
          <p className="learn-rule">
            A topic sentence tells <strong>the topic</strong> and <strong>what you think.</strong>
          </p>
          {s.zh ? <p lang="zh-CN">主题句要说出话题和你的想法。</p> : null}
          <Hamburger />
          <div className="learn-examples">
            <section>
              <span className="example-label">Not yet</span>
              <p>{model.learn?.weak}</p>
              <span className="example-note">A fact</span>
            </section>
            <section className="better-example">
              <span className="example-label">
                Better <BAIcon name="check" size={16} />
              </span>
              <p>{model.learn?.strong}</p>
              <span className="example-note">Topic + opinion</span>
            </section>
          </div>
          <p className="learn-next">{model.learn?.nextUp}</p>
        </>
      ) : null}
      {t?.type === 'pick' && st ? (
        <>
          <p className="answer-instruction">
            {t.multi
              ? `Choose ${t.answers?.length} · ${st.picked?.length ?? 0} chosen`
              : 'Choose one answer.'}
          </p>
          <BAChoice
            label={s.text(t.ask)}
            choiceMode={t.multi ? 'multiple' : 'single'}
            selectedKeys={(st.picked ?? []).map(String)}
            disabled={graded}
            onChange={(keys) => {
              const changed = t.multi
                ? (keys.map(Number).find((i) => !st.picked?.includes(i)) ??
                  st.picked?.find((i) => !keys.includes(String(i))))
                : Number(keys[0]);
              if (changed != null) s.selectAnswer(changed);
            }}
            options={(t.lines ?? []).map((line, i) => {
              const selected = st.picked?.includes(i),
                right = t.answers?.includes(i),
                revealed = graded && (!check ? st.status === 'shown' : !result?.correct);
              const state: ChoiceState = graded
                ? right
                  ? revealed
                    ? 'revealed'
                    : 'correct'
                  : selected
                    ? 'wrong'
                    : 'dim'
                : st.wrong?.includes(i)
                  ? 'wrong'
                  : selected
                    ? 'selected'
                    : 'idle';
              const stateLabel =
                state === 'revealed'
                  ? 'Right answer'
                  : state === 'correct'
                    ? 'Your answer · right'
                    : state === 'wrong'
                      ? graded
                        ? 'Your answer · look again'
                        : 'Try again'
                      : state === 'selected'
                        ? 'Selected'
                        : undefined;
              return { id: String(i), text: line, state, stateLabel };
            })}
          />
        </>
      ) : null}
      {t?.type === 'tapword' && st ? (
        <div className="tapword-passage" role="group" aria-label={s.text(t.ask)}>
          {s.engine.tokens(t.text ?? '').map((word, i) => {
            const right = t.targets?.some((x) => s.engine.locate(t.text ?? '', x) === i),
              selected = st.sel === i;
            const state =
              graded && right
                ? (!check && st.status === 'shown') || (check && !result?.correct)
                  ? 'revealed'
                  : selected
                    ? 'correct'
                    : 'dim'
                : st.bad === i || (graded && selected && !right)
                  ? 'wrong'
                  : selected
                    ? 'selected'
                    : 'idle';
            return (
              <Button
                key={i}
                className="tapword"
                aria-pressed={selected}
                isDisabled={graded}
                data-feedback={state}
                onPress={() => s.selectWord(i)}
              >
                {word.w}
                <span>
                  {state === 'correct'
                    ? '✓ Your answer · right'
                    : state === 'revealed'
                      ? 'Right answer'
                      : state === 'wrong'
                        ? graded
                          ? 'Your answer · look again'
                          : 'Try again'
                        : selected
                          ? 'Selected'
                          : ''}
                </span>
              </Button>
            );
          })}
        </div>
      ) : null}
      {t?.type === 'build' && st ? <Build session={s} task={t} state={st} /> : null}
      {t?.type === 'write' ? (
        <Writing
          key={check ? s.checkKey() : sc.id}
          session={s}
          task={t}
          assessment={check}
          readOnly={graded && sc.kind !== 'apply'}
        />
      ) : null}
      {check && c?.finished ? (
        <p className="graded-explanation" role="status">
          {result?.correct ? s.text(t?.ok) || s.text(t?.why) : result?.explanation || s.text(t?.why)}
        </p>
      ) : null}
      {!check && t && t.type !== 'build' && sc.kind !== 'apply' && st?.status !== 'open' ? (
        <p className="completion-label" data-status={st?.status}>
          {st?.status === 'shown' ? 'Answer revealed · ready to continue' : '✓ Practice complete'}
        </p>
      ) : null}
      {model.skip ? (
        <div className="skip-offer">
          <p>{model.skip.text}</p>
          {model.skip.mode === 'offer' ? (
            <>
              <BAButton variant="secondary" onPress={() => s.chooseSkip('skip')}>
                Skip this skill
              </BAButton>
              <BAButton variant="tertiary" onPress={() => s.chooseSkip('review')}>
                Review it
              </BAButton>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
function Hamburger() {
  return (
    <figure
      className="hamburger-diagram"
      aria-label="A paragraph is like a hamburger. Topic sentence on top, reasons in the middle, closing sentence at the bottom."
    >
      <div className="hamburger-diagram__bun">
        <strong>Topic sentence</strong>
        <span>The topic + what you think</span>
      </div>
      <div className="hamburger-diagram__filling">
        <span>Reasons & details</span>
      </div>
      <div className="hamburger-diagram__bottom">Closing sentence</div>
    </figure>
  );
}
function Build({
  session: s,
  task: t,
  state: st,
}: {
  session: CourseSession;
  task: AlexTask;
  state: TaskProgress;
}) {
  const [wrong, setWrong] = useState('');
  const placed = st.status === 'shown' ? (t.target ?? []) : (st.order ?? []);
  return (
    <>
      <p className="answer-instruction">
        Build it here{' '}
        <span>
          {placed.length} / {t.target?.length}
        </span>
      </p>
      <div className="sentence-build" aria-live="polite">
        {placed.length ? (
          placed.map((w, i) => <span key={i}>{i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w}</span>)
        ) : (
          <span className="empty-build">Choose the first word below.</span>
        )}
      </div>
      <div className="word-cards" aria-label="Sentence word cards">
        {(t.cells ?? []).map((cell, i) => {
          const word = typeof cell === 'string' ? cell : cell.t;
          return (
            <Button
              key={i}
              className="word-card"
              data-wrong={wrong === word || undefined}
              data-needed={((st.missStreak ?? 0) >= 3 && word === t.target?.[placed.length]) || undefined}
              isDisabled={st.status !== 'open' || placed.includes(word)}
              onPress={() => {
                if (word !== t.target?.[placed.length]) {
                  setWrong(word);
                  setTimeout(() => setWrong(''), 400);
                }
                s.buildCard(word);
              }}
            >
              {word}
            </Button>
          );
        })}
      </div>
      {st.status === 'open' ? (
        <BAButton variant="tertiary" onPress={() => s.resetBuild()}>
          Start again
        </BAButton>
      ) : (
        <p className="completion-label">
          {st.status === 'shown' ? 'Answer revealed' : '✓ Sentence complete'}
        </p>
      )}
    </>
  );
}
function Writing({
  session: s,
  task: t,
  assessment,
  readOnly,
}: {
  session: CourseSession;
  task: AlexTask;
  assessment: boolean;
  readOnly: boolean;
}) {
  const area = useRef<HTMLTextAreaElement>(null),
    source = useRef('typed');
  const sc = s.currentScreen(),
    apply = sc.kind === 'apply';
  const id = assessment ? s.checkKey() : apply ? sc.page : `${sc.page}:${t.id}`;
  const initial = t.start ?? '',
    value = s.region(id, initial);
  const [gridOpen, setGridOpen] = useState(false),
    [tab, setTab] = useState(apply ? 'opinion' : 'task');
  const caret = useRef({ start: value.length, end: value.length });
  const groups = s.config.grids?.tabs ?? {};
  const a = apply ? s.applyState() : null;
  const insert = (word: string) => {
    const { start, end } = caret.current;
    const next = s.engine.smartInsert(value, start, end, word);
    s.editRegion(id, next.value, 'grid', initial);
    caret.current = { start: next.caret, end: next.caret };
    requestAnimationFrame(() => {
      area.current?.focus();
      area.current?.setSelectionRange(next.caret, next.caret);
    });
  };
  return (
    <div className="writing-bench" data-grid-open={gridOpen || undefined}>
      <div className="writing-toolbar">
        <span>{apply ? 'Your topic sentences' : 'Your sentence'}</span>
        <span className="autosave">
          <BAIcon name="check" size={14} /> Saved on this device
        </span>
      </div>
      {apply && t.tip ? <p>{s.text(t.tip)}</p> : null}
      <BAField
        ref={area}
        label={apply ? 'Your writing' : 'Your sentence'}
        value={value}
        readOnly={readOnly}
        onPaste={() => {
          source.current = 'paste';
        }}
        onSelect={() => {
          if (area.current)
            caret.current = { start: area.current.selectionStart, end: area.current.selectionEnd };
        }}
        onChange={(v) => {
          s.editRegion(id, v, source.current, initial);
          source.current = 'typed';
        }}
      />
      <div className="writing-meta">
        <span>
          <BANumber>{s.analyzer.wordCount(value)}</BANumber> words
        </span>
        {!assessment && !readOnly ? (
          <Button className="grid-toggle" aria-expanded={gridOpen} onPress={() => setGridOpen(!gridOpen)}>
            {gridOpen ? 'Close word grid' : 'Open word grid'}
          </Button>
        ) : null}
      </div>
      {!assessment && !readOnly && gridOpen ? (
        <WordGrid
          activeGroup={tab}
          onGroupChange={setTab}
          onInsert={insert}
          groups={(apply ? ['opinion', 'nouns', 'adjectives', 'marks'] : ['task', 'opinion', 'marks']).map(
            (g) => ({
              id: g,
              label: g === 'task' ? 'From the task' : (groups[g]?.label ?? g),
              words: (g === 'task'
                ? (t.cells ?? [])
                : ((apply ? groups[g]?.words : (groups[g]?.chunks ?? groups[g]?.words)) ?? [])
              ).map((w) => (typeof w === 'string' ? w : w.t)),
            }),
          )}
        />
      ) : null}
      {apply && a?.result ? (
        <div className="apply-checks" aria-label="Writing check criteria">
          {a.result.checks.map((r) => (
            <p key={r.label}>
              <span aria-hidden="true">{r.met ? '✓' : '↻'}</span> {r.label}{' '}
              <span className="sr-only">{r.met ? 'Met' : 'Keep working'}</span>
            </p>
          ))}
        </div>
      ) : null}
      {apply && a && a.tries >= 2 && !a.passed && !s.state.done[sc.page] && !a.result?.safety_flag ? (
        <BAButton variant="tertiary" onPress={() => s.moveOnApply()}>
          Move on for now
        </BAButton>
      ) : null}
      {a?.movedOn ? (
        <p className="completion-label" data-status="deferred">
          Saved for more practice · ready to continue
        </p>
      ) : null}
    </div>
  );
}
