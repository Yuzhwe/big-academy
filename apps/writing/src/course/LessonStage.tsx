import { useEffect } from 'react';
import { Checkbox, Radio, RadioGroup, Tab, TabList, TabPanel, Tabs } from 'react-aria-components';
import { BAButton, BAIcon } from '@big-academy/design-system';
import type { ActivityModel, CourseSession } from '../product/courseSession';
import './lesson-stage.css';

function choiceKey(key: string): number {
  if (/^[1-9]$/.test(key)) return Number(key) - 1;
  if (/^[a-i]$/i.test(key)) return key.toLowerCase().charCodeAt(0) - 97;
  return -1;
}

function speak(text: string, zh: boolean) {
  if (!text || typeof window.speechSynthesis === 'undefined') return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = zh ? 'zh-CN' : 'en-US';
  window.speechSynthesis.speak(utterance);
}

export function LessonStage({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const zh = session.zh;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable);
      if (typing) return;
      const current = session.activity();
      if (!current) return;
      if (event.key === 'Enter' && current.pick && !current.pick.disabled) {
        const footer = session.footer();
        if (footer.primaryTestId === 'check' && !footer.primaryDisabled) {
          event.preventDefault();
          session.pressPrimary();
        }
        return;
      }
      const index = choiceKey(event.key);
      if (index < 0 || !current.pick || current.pick.disabled || index >= current.pick.options.length) return;
      event.preventDefault();
      session.pick(index);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session]);

  return (
    <article className="course-activity" data-template={activity.template} data-kind={activity.kind} data-screen={activity.screenId}>
      {activity.check && activity.check.phase !== 'results' && activity.check.number > 0 ? (
        <div className="check-heading">
          <p className="check-numeral" aria-hidden="true">{activity.check.number}</p>
          <p className="visually-hidden">{activity.check.accessibleCount}</p>
        </div>
      ) : null}

      {activity.learn ? <LearnBlock session={session} activity={activity} /> : null}
      {activity.pick ? <PickBlock session={session} activity={activity} /> : null}
      {activity.tapword ? <TapwordBlock session={session} activity={activity} /> : null}
      {activity.build ? <BuildBlock session={session} activity={activity} /> : null}
      {activity.writing ? <WritingBlock session={session} activity={activity} /> : null}
      {activity.grid ? <WordGrid session={session} activity={activity} /> : null}
      {activity.check?.phase === 'answering' ? (
        <div className="check-dots" role="group" aria-label={activity.check.accessibleCount}>
          {activity.check.dots.map((dot) => (
            <button
              key={dot.index}
              type="button"
              className="check-dot"
              aria-current={dot.current ? 'true' : undefined}
              aria-label={zh ? `第 ${dot.index + 1} 题${dot.answered ? '，已作答' : ''}` : `Question ${dot.index + 1}${dot.answered ? ', answered' : ''}`}
              data-answered={dot.answered ? 'true' : 'false'}
              onClick={() => session.openCheckDot(dot.index)}
            />
          ))}
        </div>
      ) : null}
      {activity.check?.phase === 'results' ? (
        <div className="check-results">
          <p role="status">{activity.check.summary}</p>
          <ol>
            {(activity.check.rows ?? []).map((row) => (
              <li key={row.index}>
                <button type="button" onClick={() => session.openCheckResult(row.index)}>
                  <span>{row.correct ? (zh ? '正确' : 'Right') : (zh ? '还不对' : 'Not yet')}</span>
                  {row.ask}
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {!activity.supported && !activity.learn ? (
        <p className="course-message" data-testid="unsupported-template">{activity.unsupportedReason}</p>
      ) : null}
      {activity.skip?.mode === 'note' ? <p data-testid="skip-note">{activity.skip.text}</p> : null}
      {activity.skip?.mode === 'offer' ? (
        <div className="course-skip-offer" data-testid="skip-offer">
          <p>{activity.skip.text}</p>
          <BAButton variant="secondary" locale={session.locale} onPress={() => session.chooseSkip('skip')}>
            {zh ? '跳过这个技能' : 'Skip this skill'}
          </BAButton>
          <BAButton variant="secondary" locale={session.locale} onPress={() => session.chooseSkip('review')}>
            {zh ? '先复习' : 'Review it'}
          </BAButton>
        </div>
      ) : null}
    </article>
  );
}

function ListenButton({ text, zh }: { text: string; zh: boolean }) {
  return (
    <button
      type="button"
      className="listen-button"
      aria-label={zh ? '读给我听' : 'Read it to me'}
      onClick={() => speak(text, zh)}
    >
      <BAIcon name="sound-high" size={22} />
    </button>
  );
}

function LearnBlock({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const learn = activity.learn;
  if (!learn) return null;
  return (
    <>
      <div className="activity-prompt">
        <h1 className="course-title">{learn.heading || activity.title}</h1>
        {learn.listenText ? <ListenButton text={learn.listenText} zh={session.zh} /> : null}
      </div>
      {learn.teach ? <p className="course-teach">{learn.teach}</p> : null}
      {learn.weak || learn.strong ? (
        <div className="course-examples">
          {learn.weak ? <p><span>{learn.weakLabel}</span> {learn.weak}</p> : null}
          {learn.strong ? <p><span>{learn.strongLabel}</span> {learn.strong}</p> : null}
        </div>
      ) : null}
      {learn.layers?.length ? (
        <ol className="hamburger" aria-label={session.zh ? '这一课的三层' : 'Three layers for this lesson'}>
          {learn.layers.map((layer, index) => (
            <li key={layer.title} className="hamburger__layer" data-layer={index}>
              <p className="hamburger__title">{layer.title}</p>
              {layer.support ? <p className="hamburger__support">{layer.support}</p> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </>
  );
}

function PickBlock({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const pick = activity.pick;
  if (!pick) return null;
  const prompt = (
    <div className="activity-prompt">
      <h1 className="course-title">{activity.ask}</h1>
      <ListenButton text={activity.ask} zh={session.zh} />
    </div>
  );
  const options = pick.options.map((option) => {
    const body = (
      <>
        <span className="choice-mark" aria-hidden="true">{option.letter}</span>
        <span className="choice-copy">
          <span>{option.text}</span>
          {option.statusLabel ? <span className="choice-status">{option.statusLabel}</span> : null}
        </span>
      </>
    );
    if (pick.multi) {
      return (
        <Checkbox
          key={option.index}
          className="choice-row"
          data-visual={option.visual}
          isSelected={option.selected}
          isDisabled={pick.disabled}
          onChange={() => session.pick(option.index)}
        >
          {body}
        </Checkbox>
      );
    }
    return (
      <Radio key={option.index} className="choice-row" data-visual={option.visual} value={String(option.index)} isDisabled={pick.disabled}>
        {body}
      </Radio>
    );
  });
  return (
    <>
      {prompt}
      {pick.hint ? <p className="choice-hint">{pick.hint}</p> : null}
      {pick.multi ? (
        <div className="choice-list" role="group" aria-label={activity.ask}>{options}</div>
      ) : (
        <RadioGroup
          className="choice-list"
          aria-label={activity.ask}
          value={pick.options.find((option) => option.selected)?.index.toString() ?? ''}
          onChange={(value) => session.pick(Number(value))}
          isDisabled={pick.disabled}
        >
          {options}
        </RadioGroup>
      )}
    </>
  );
}

function TapwordBlock({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const tap = activity.tapword;
  if (!tap) return null;
  return (
    <>
      <div className="activity-prompt">
        <h1 className="course-title">{activity.ask}</h1>
        <ListenButton text={`${activity.ask} ${tap.words.map((word) => word.text).join(' ')}`} zh={session.zh} />
      </div>
      <p className="tapword-line">
        {tap.words.map((word) => (
          <button
            key={word.index}
            type="button"
            className="choice-row tapword-token"
            data-visual={word.visual}
            aria-pressed={word.selected}
            disabled={tap.disabled}
            onClick={() => session.tapWord(word.index)}
          >
            <span>{word.text}</span>
            {word.statusLabel ? <span className="visually-hidden">{word.statusLabel}</span> : null}
          </button>
        ))}
      </p>
    </>
  );
}

function BuildBlock({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const build = activity.build;
  if (!build) return null;
  return (
    <>
      <div className="activity-prompt">
        <h1 className="course-title">{activity.ask}</h1>
        <ListenButton text={activity.ask} zh={session.zh} />
      </div>
      <p className={`build-line${activity.pulse ? ' is-pulse' : ''}`} data-testid="build-line">{build.line || (session.zh ? '把词卡放到这里' : 'Place the word cards here')}</p>
      {build.revealed ? <p className="build-revealed">{build.revealed}</p> : null}
      <div className="word-pills" role="group" aria-label={session.zh ? '词卡' : 'Word cards'}>
        {build.cards.map((card, index) => (
          <button
            key={`${card.text}-${index}`}
            type="button"
            className="word-pill"
            data-used={card.used ? 'true' : 'false'}
            data-pulse={card.pulse ? 'true' : 'false'}
            data-shake={card.shake ? 'true' : 'false'}
            disabled={card.used}
            onClick={() => session.placeCard(card.text)}
          >
            {card.text}
          </button>
        ))}
      </div>
      {build.canReset ? (
        <BAButton variant="secondary" locale={session.locale} onPress={() => session.resetBuild()}>
          {session.zh ? '重新开始' : 'Start again'}
        </BAButton>
      ) : null}
    </>
  );
}

function WritingBlock({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const writing = activity.writing;
  if (!writing) return null;
  return (
    <>
      {!activity.pick && !activity.tapword ? (
        <div className="activity-prompt">
          <h1 className="course-title">{activity.ask || activity.title}</h1>
          <ListenButton text={activity.ask || writing.frame || ''} zh={session.zh} />
        </div>
      ) : null}
      {writing.frame ? <p className="frame-preview">{writing.frame}</p> : null}
      <textarea
        className="writing-canvas"
        value={writing.value}
        readOnly={writing.readOnly}
        aria-label={activity.ask || (session.zh ? '你的答案' : 'Your answer')}
        onChange={(event) => session.setWriting(event.target.value)}
      />
      {writing.tip ? <p className="writing-tip">{writing.tip}</p> : null}
      {writing.criteria?.length ? (
        <ul className="apply-criteria">
          {writing.criteria.map((item) => (
            <li key={item.label} data-met={item.met ? 'true' : 'false'}>{item.label}</li>
          ))}
        </ul>
      ) : null}
      {writing.moveOn ? (
        <BAButton variant="secondary" locale={session.locale} onPress={() => session.moveOn()}>
          {session.zh ? '先继续' : 'Move on for now'}
        </BAButton>
      ) : null}
    </>
  );
}

function WordGrid({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const grid = activity.grid;
  if (!grid || !grid.tabs.length) return null;
  const panel = (words: { text: string; zh?: string; used?: boolean }[]) => (
    <div className="word-pills">
      {words.map((word) => (
        <button key={word.text} type="button" className="word-pill" disabled={word.used} onClick={() => session.insertWord(word.text)}>
          {word.text}
          {session.zh && word.zh ? <span className="word-pill__zh">{word.zh}</span> : null}
        </button>
      ))}
    </div>
  );
  if (grid.hideTabs || grid.tabs.length < 2) {
    return <div className="word-grid">{panel(grid.tabs[0].words)}</div>;
  }
  return (
    <Tabs className="word-grid" selectedKey={grid.active} onSelectionChange={(key) => session.selectGrid(String(key))}>
      <TabList className="word-grid__tabs" aria-label={session.zh ? '词卡分组' : 'Word groups'}>
        {grid.tabs.map((tab) => (
          <Tab key={tab.id} id={tab.id} className="word-grid__tab">{tab.label}</Tab>
        ))}
      </TabList>
      {grid.tabs.map((tab) => (
        <TabPanel key={tab.id} id={tab.id} className="word-grid__panel">{panel(tab.words)}</TabPanel>
      ))}
    </Tabs>
  );
}

export function CoachColumn({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const zh = session.zh;
  const hintLabel = activity.hintAction === 'hint'
    ? zh ? '需要提示？' : 'Need a hint?'
    : activity.hintAction === 'another'
      ? zh ? '再来一个提示' : 'Another hint'
      : activity.hintAction === 'reveal'
        ? zh ? '看答案' : 'Show me the answer'
        : null;
  const feedbackKind = activity.feedback ? activity.feedbackKind : 'none';
  return (
    <div className="coach-stack">
      {activity.coach.map((line) => (
        <p key={line} className="coach-message" data-kind="orientation">{line}</p>
      ))}
      {activity.nudge ? <p className="coach-message" data-kind="reminder">{activity.nudge}</p> : null}
      {activity.hints.map((hint) => (
        <p key={hint} className="coach-message" data-kind="hint" data-testid="hint">{hint}</p>
      ))}
      {activity.feedback ? (
        <p className="coach-message" role="status" data-testid="feedback" data-kind={feedbackKind}>{activity.feedback}</p>
      ) : null}
      {activity.coachMore ? (
        <BAButton variant="secondary" locale={session.locale} onPress={() => session.showAnother()}>
          {zh ? '再看一个' : 'Show me another'}
        </BAButton>
      ) : null}
      {hintLabel ? (
        <BAButton variant="secondary" locale={session.locale} onPress={() => session.openHint()}>
          {hintLabel}
        </BAButton>
      ) : null}
    </div>
  );
}
