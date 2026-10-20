import { useEffect, useState } from 'react';
import { Checkbox, Radio, RadioGroup } from 'react-aria-components';
import { BAButton, BATabs, BATabList, BATabPanel } from '@big-academy/design-system';
import type { CourseSession } from '../product/courseSession';

export function LessonStage({ session }: { session: CourseSession }) {
  const activity = session.activity();
  const zh = session.zh;
  if (!activity) return null;

  const pick = activity.check?.stage === 'answering' || activity.check?.stage === 'graded' ? activity.check.pick : activity.pick;
  const tapword = activity.check ? activity.check.tapword : activity.tapword;
  const writing = activity.check?.writing ?? activity.writing;
  const ask = activity.check?.prompt || activity.ask;

  return (
    <article className="course-activity" data-template={activity.template} data-kind={activity.kind} data-testid="activity-screen">
      {activity.ending ? (
        <section data-testid="lesson-end">
          <h1 className="course-title">{activity.title}</h1>
          <p data-testid="lesson-end-summary">{activity.ending.summary}</p>
          <p>
            {zh
              ? `完成 ${activity.ending.doneCount} / ${activity.ending.total} 屏。`
              : `${activity.ending.doneCount} of ${activity.ending.total} screens are complete.`}
          </p>
          {activity.ending.nextTitle ? (
            <p>
              {zh ? `下一课：${activity.ending.nextTitle}` : `Next: ${activity.ending.nextTitle}`}
            </p>
          ) : null}
          <div className="course-end-actions">
            <BAButton variant="secondary" locale={session.locale} onPress={() => session.stopForToday()}>
              <span data-testid="stop-for-today">{zh ? '今天先到这里' : 'Stop for today'}</span>
            </BAButton>
            <BAButton variant="ghost" locale={session.locale} onPress={() => session.backToPathFromEnd()}>
              <span data-testid="back-to-path-end">{zh ? '回到我的路径' : 'Back to my path'}</span>
            </BAButton>
          </div>
        </section>
      ) : null}

      {activity.learn && !activity.ending ? (
        <>
          <h1 className="course-title">{activity.learn.heading || activity.title}</h1>
          {activity.learn.teach ? <p className="course-teach">{activity.learn.teach}</p> : null}
          {activity.learn.weak || activity.learn.strong ? (
            <>
              <div className="course-hamburger" aria-label={zh ? '段落结构：主题、理由、结尾' : 'Paragraph shape: topic, reasons, closing'}>
                <span>{zh ? '主题' : 'Topic'}</span>
                <span>{zh ? '理由' : 'Reasons'}</span>
                <span>{zh ? '结尾' : 'Closing'}</span>
              </div>
              <div className="course-examples">
                {activity.learn.weak ? (
                  <p>
                    <span>{activity.learn.weakLabel}</span> {activity.learn.weak}
                  </p>
                ) : null}
                {activity.learn.strong ? (
                  <p>
                    <span>{activity.learn.strongLabel}</span> {activity.learn.strong}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
          {activity.learn.nextUp ? <p>{activity.learn.nextUp}</p> : null}
        </>
      ) : null}

      {activity.check ? (
        <section data-testid="check-panel">
          <p className="course-kicker" data-testid="check-note">
            {activity.check.note}
          </p>
          <p data-testid="check-progress">
            {zh
              ? `第 ${activity.check.question + 1} 题，共 ${activity.check.total} 题`
              : `Question ${activity.check.question + 1} of ${activity.check.total}`}
          </p>
          <div className="course-dots" role="group" aria-label={zh ? '检查题目' : 'Check questions'}>
            {activity.check.items.map((item) => (
              <button
                key={item.index}
                type="button"
                className="course-dot"
                data-answered={item.answered ? 'true' : 'false'}
                data-current={item.index === activity.check?.question ? 'true' : 'false'}
                aria-current={item.index === activity.check?.question ? 'true' : undefined}
                onClick={() => (activity.check?.stage === 'results' ? session.openCheckResult(item.index) : session.jumpCheckQuestion(item.index))}
              >
                {item.index + 1}
              </button>
            ))}
          </div>
          {activity.check.blankWarning ? <p data-testid="blank-warning">{activity.check.blankWarning}</p> : null}
          {activity.check.stage === 'results' ? (
            <div data-testid="check-results">
              <h1 className="course-title">{activity.check.scoreLabel}</h1>
              <ol className="course-results">
                {(activity.check.results ?? []).map((result) => (
                  <li key={result.index}>
                    <button type="button" className="course-result" onClick={() => session.openCheckResult(result.index)}>
                      <span>{result.correct ? (zh ? '正确' : 'Correct') : zh ? '还不对' : 'Not yet'}</span>
                      <span>{result.ask}</span>
                    </button>
                  </li>
                ))}
              </ol>
              {activity.check.canRetry ? (
                <BAButton variant="secondary" locale={session.locale} onPress={() => session.startNewCheckSet()}>
                  <span data-testid="retry-check">{zh ? '换一套题' : 'Try a new set'}</span>
                </BAButton>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {ask && !activity.learn && !activity.ending && activity.check?.stage !== 'results' ? <h1 className="course-title">{ask}</h1> : null}
      {activity.pick?.hint && !activity.check ? <p>{activity.pick.hint}</p> : null}
      {pick && activity.check?.stage !== 'results' ? (
        <ChoiceList session={session} ask={ask} pick={pick} />
      ) : null}
      {tapword && activity.check?.stage !== 'results' ? (
        <p className="course-words">
          {tapword.words.map((word) => (
            <button
              key={word.index}
              type="button"
              className="course-word"
              data-selected={word.selected ? 'true' : undefined}
              data-wrong={word.wrong ? 'true' : undefined}
              data-mark={word.mark}
              disabled={activity.check?.stage === 'graded'}
              onClick={() => session.tapWord(word.index)}
            >
              {word.text}
              <span className="course-mark">{word.markLabel}</span>
            </button>
          ))}
        </p>
      ) : null}

      {activity.build ? (
        <section data-testid="build-bench">
          <p className="course-line" data-testid="build-line">
            {activity.build.line || (zh ? '在这里拼' : 'Build it here')}
          </p>
          {activity.build.revealed ? <p data-testid="build-revealed">{activity.build.revealed}</p> : null}
          <div className="course-cards">
            {activity.build.cards.map((card) => (
              <button
                key={card.index}
                type="button"
                className="course-card"
                data-testid={`build-card-${card.index}`}
                data-shake={card.shake ? 'true' : undefined}
                data-pulse={card.pulse ? 'true' : undefined}
                data-used={card.used ? 'true' : undefined}
                disabled={activity.build?.readOnly || card.used}
                onClick={() => session.placeBuild(card.index)}
              >
                {card.text}
              </button>
            ))}
          </div>
          {!activity.build.readOnly ? (
            <BAButton variant="ghost" locale={session.locale} onPress={() => session.resetBuild()}>
              {zh ? '重新开始' : 'Start again'}
            </BAButton>
          ) : null}
        </section>
      ) : null}

      {writing && activity.check?.stage !== 'results' && !activity.build ? (
        <label className="course-writing">
          <span className="course-kicker">{zh ? '你的句子' : 'Your sentence'}</span>
          <textarea
            data-testid="writing-input"
            value={writing.value}
            readOnly={writing.readOnly}
            placeholder={writing.placeholder}
            onChange={(event) => session.setWriting(event.target.value)}
          />
          {writing.revealed ? <p data-testid="writing-revealed">{writing.revealed}</p> : null}
        </label>
      ) : null}

      {activity.apply ? (
        <section data-testid="apply-panel">
          {activity.apply.tip ? <p>{activity.apply.tip}</p> : null}
          {activity.apply.nudge ? <p data-testid="apply-nudge">{activity.apply.nudge}</p> : null}
          {activity.apply.praise ? <p data-testid="apply-praise">{activity.apply.praise}</p> : null}
          {activity.apply.checks.length ? (
            <ul data-testid="apply-checks">
              {activity.apply.checks.map((item) => (
                <li key={item.label} data-met={item.met ? 'true' : 'false'}>
                  {item.met ? (zh ? '达到' : 'Met') : zh ? '还没有' : 'Not yet'} · {item.label}
                </li>
              ))}
            </ul>
          ) : null}
          {activity.apply.also ? <p data-testid="apply-also">{activity.apply.also}</p> : null}
          {activity.apply.glow ? <p data-testid="apply-glow">{activity.apply.glow}</p> : null}
          {activity.apply.canMoveOn ? (
            <BAButton variant="ghost" locale={session.locale} onPress={() => session.moveOnApply()}>
              <span data-testid="move-on">{zh ? '先继续' : 'Move on for now'}</span>
            </BAButton>
          ) : null}
        </section>
      ) : null}

      {activity.wordGrid && activity.check?.stage !== 'graded' ? <WordDock session={session} tabs={activity.wordGrid.tabs} /> : null}

      {!activity.supported && !activity.learn ? (
        <p className="course-message" data-testid="unsupported-template">
          {activity.unsupportedReason}
        </p>
      ) : null}
      {activity.skip?.mode === 'note' ? <p data-testid="skip-note">{activity.skip.text}</p> : null}
      {activity.skip?.mode === 'offer' ? (
        <div className="course-skip-offer" data-testid="skip-offer">
          <p>{activity.skip.text}</p>
          <BAButton variant="secondary" locale={session.locale} onPress={() => session.chooseSkip('skip')}>
            {zh ? '跳过这个技能' : 'Skip this skill'}
          </BAButton>
          <BAButton variant="ghost" locale={session.locale} onPress={() => session.chooseSkip('review')}>
            {zh ? '先复习' : 'Review it'}
          </BAButton>
        </div>
      ) : null}
    </article>
  );
}

function ChoiceList({
  session,
  ask,
  pick,
}: {
  session: CourseSession;
  ask: string;
  pick: NonNullable<ReturnType<CourseSession['activity']>>['pick'];
}) {
  if (!pick) return null;
  if (pick.multi) {
    return (
      <div className="course-choices" role="group" aria-label={ask}>
        {pick.hint ? <p>{pick.hint}</p> : null}
        {pick.options.map((option) => (
          <Checkbox
            key={option.index}
            className="course-choice"
            data-mark={option.mark}
            data-wrong={option.wrong ? 'true' : undefined}
            isSelected={option.selected}
            isDisabled={pick.closed}
            onChange={() => session.pick(option.index)}
          >
            <span className="course-choice__letter">{option.letter}</span>
            <span>{option.text}</span>
            <span className="course-mark">{option.markLabel}</span>
          </Checkbox>
        ))}
      </div>
    );
  }
  return (
    <RadioGroup
      className="course-choices"
      aria-label={ask}
      value={pick.options.find((option) => option.selected)?.index.toString() ?? ''}
      isDisabled={pick.closed}
      onChange={(value) => session.pick(Number(value))}
    >
      {pick.options.map((option) => (
        <Radio key={option.index} className="course-choice" data-mark={option.mark} data-wrong={option.wrong ? 'true' : undefined} value={String(option.index)}>
          <span className="course-choice__letter">{option.letter}</span>
          <span>{option.text}</span>
          <span className="course-mark">{option.markLabel}</span>
        </Radio>
      ))}
    </RadioGroup>
  );
}

function WordDock({ session, tabs }: { session: CourseSession; tabs: { id: string; label: string; cells: string[] }[] }) {
  const zh = session.zh;
  const [tab, setTab] = useState(tabs[0]?.id ?? '');
  if (!tabs.length) return null;
  const selected = tabs.some((item) => item.id === tab) ? tab : tabs[0].id;
  return (
    <BATabs className="course-grid" selectedKey={selected} onSelectionChange={setTab}>
      <BATabList aria-label={zh ? '词卡' : 'Word grid'} selectedKey={selected} options={tabs.map((item) => ({ id: item.id, label: item.label }))} />
      {tabs.map((item) => (
        <BATabPanel key={item.id} id={item.id}>
          <div className="course-cards">
            {item.cells.map((cell) => (
              <button key={`${item.id}-${cell}`} type="button" className="course-card" data-testid="grid-word" onClick={() => session.insertGrid(cell)}>
                {cell}
              </button>
            ))}
          </div>
        </BATabPanel>
      ))}
    </BATabs>
  );
}

export function useLessonKeys(session: CourseSession, revision: number): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable);
      if (event.key === 'Enter' && !typing && target?.tagName !== 'BUTTON') {
        event.preventDefault();
        session.pressPrimary();
        return;
      }
      if (typing) return;
      const activity = session.activity();
      const pick = activity?.check?.stage === 'answering' ? activity.check.pick : activity?.pick;
      if (!pick || pick.closed) return;
      let index = -1;
      if (/^[1-9]$/.test(event.key)) index = Number(event.key) - 1;
      else if (/^[a-i]$/i.test(event.key)) index = event.key.toUpperCase().charCodeAt(0) - 65;
      if (index >= 0 && index < pick.options.length) {
        event.preventDefault();
        session.pick(index);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session, revision]);
}
