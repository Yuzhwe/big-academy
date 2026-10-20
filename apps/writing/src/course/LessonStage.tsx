import { useEffect } from 'react';
import { BAButton, BAChoice, BAField } from '@big-academy/design-system';
import type { ActivityModel, CourseSession } from '../product/courseSession';

export function LessonStage({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const pick = activity.assessment?.stage === 'answering' ? activity.assessment.pick : activity.pick;
      if (!pick || pick.closed) return;
      const index = session.engine.choiceKey(event.key, pick.options.length);
      if (index < 0) return;
      event.preventDefault();
      session.pick(index);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activity, session]);

  return (
    <article className="course-activity" data-template={activity.template} data-kind={activity.kind} data-screen={activity.screenId}>
      {activity.learn ? <LearnBlock activity={activity} /> : null}
      {activity.assessment ? <AssessmentBlock session={session} activity={activity} /> : null}
      {!activity.assessment && activity.pick ? <PickBlock session={session} activity={activity} pick={activity.pick} ask={activity.ask} /> : null}
      {!activity.assessment && activity.tapword ? <TapBlock session={session} activity={activity} tap={activity.tapword} ask={activity.ask} /> : null}
      {activity.build ? <BuildBlock session={session} activity={activity} /> : null}
      {!activity.assessment && activity.write ? <WriteBlock session={session} activity={activity} write={activity.write} /> : null}
      {activity.apply ? <ApplyBlock session={session} activity={activity} /> : null}
      {!activity.supported && !activity.learn && !activity.assessment ? (
        <>
          <h1 className="course-title">{activity.ask || activity.title}</h1>
          <p className="course-message" data-testid="unsupported-template">{activity.unsupportedReason}</p>
        </>
      ) : null}
      {activity.skip?.mode === 'note' ? <p data-testid="skip-note">{activity.skip.text}</p> : null}
      {activity.skip?.mode === 'offer' ? (
        <div className="course-skip-offer" data-testid="skip-offer">
          <p>{activity.skip.text}</p>
          <BAButton variant="secondary" locale={session.locale} onPress={() => session.chooseSkip('skip')}>
            {session.zh ? '跳过这个技能' : 'Skip this skill'}
          </BAButton>
          <BAButton variant="ghost" locale={session.locale} onPress={() => session.chooseSkip('review')}>
            {session.zh ? '先复习' : 'Review it'}
          </BAButton>
        </div>
      ) : null}
    </article>
  );
}

function LearnBlock({ activity }: { activity: ActivityModel }) {
  const learn = activity.learn!;
  return (
    <>
      <h1 className="course-title">{learn.heading || activity.title}</h1>
      <div className="course-learn">
        <div>
          {learn.teach ? <p className="course-teach">{learn.teach}</p> : null}
          {learn.weak || learn.strong ? (
            <div className="course-examples">
              {learn.weak ? <p><span>{learn.weakLabel}</span> {learn.weak}</p> : null}
              {learn.strong ? <p><span>{learn.strongLabel}</span> {learn.strong}</p> : null}
            </div>
          ) : null}
          {learn.nextUp ? <p>{learn.nextUp}</p> : null}
        </div>
        <div className="course-burger" data-layer="top" aria-hidden="true">
          <div className="course-burger__top" />
          <div className="course-burger__let" />
          <div className="course-burger__tom" />
          <div className="course-burger__pat" />
          <div className="course-burger__bot" />
        </div>
      </div>
    </>
  );
}

function PickBlock({
  session,
  activity,
  pick,
  ask,
}: {
  session: CourseSession;
  activity: ActivityModel;
  pick: NonNullable<ActivityModel['pick']>;
  ask: string;
}) {
  return (
    <>
      {activity.assessment ? <h2 className="course-ask">{ask}</h2> : <h1 className="course-title">{ask || activity.title}</h1>}
      {pick.hint ? <p data-testid="choose-n">{pick.hint}</p> : null}
      <BAChoice
        mode={pick.multi ? 'multiple' : 'single'}
        label={ask}
        disabled={pick.closed}
        selectedIds={pick.options.filter((option) => option.selected).map((option) => String(option.index))}
        onChange={(ids) => {
          if (pick.multi) {
            const next = new Set(ids);
            const current = new Set(pick.options.filter((option) => option.selected).map((option) => String(option.index)));
            const changed = [...next].find((id) => !current.has(id)) ?? [...current].find((id) => !next.has(id));
            if (changed != null) session.pick(Number(changed));
          } else if (ids[0] != null) session.pick(Number(ids[0]));
        }}
        options={pick.options.map((option) => ({
          id: String(option.index),
          marker: option.letter,
          text: option.text,
          visual: option.visual,
          mark: option.mark,
        }))}
      />
    </>
  );
}

function TapBlock({
  session,
  activity,
  tap,
  ask,
}: {
  session: CourseSession;
  activity: ActivityModel;
  tap: NonNullable<ActivityModel['tapword']>;
  ask: string;
}) {
  return (
    <>
      {activity.assessment ? <h2 className="course-ask">{ask}</h2> : <h1 className="course-title">{ask || activity.title}</h1>}
      <p className="course-words">
        {tap.words.map((word) => (
          <button
            key={word.index}
            type="button"
            className="course-word"
            data-selected={word.selected ? 'true' : undefined}
            data-wrong={word.wrong ? 'true' : undefined}
            data-correct={word.correct ? 'true' : undefined}
            aria-pressed={word.selected}
            disabled={tap.closed}
            onClick={() => session.tapWord(word.index)}
          >
            {word.correct ? <span className="course-word__mark" aria-hidden="true">✓ </span> : null}
            {word.text}
            {word.wrong ? <span className="visually-hidden"> incorrect</span> : null}
            {word.correct ? <span className="visually-hidden"> correct</span> : null}
          </button>
        ))}
      </p>
    </>
  );
}

function BuildBlock({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const build = activity.build!;
  return (
    <>
      <h1 className="course-title">{activity.ask}</h1>
      <p className="course-bench-label">{session.zh ? '在这里拼' : 'Build it here'}</p>
      <p className="course-sentence" data-testid="built-sentence">{build.sentence || (session.zh ? '点下面的词卡。' : 'Tap the word cards below.')}</p>
      <div className="course-cells" role="group" aria-label={activity.ask}>
        {build.cells.map((cell, index) => (
          <button
            key={`${cell.text}-${index}`}
            type="button"
            className="course-cell"
            data-hint={cell.hint ? 'true' : undefined}
            disabled={build.status !== 'open' || cell.used}
            onClick={() => session.buildCell(cell.text)}
          >
            {cell.text}
          </button>
        ))}
      </div>
      {build.status === 'open' ? (
        <BAButton variant="ghost" locale={session.locale} onPress={() => session.resetBuild()}>
          {session.zh ? '重新开始' : 'Start again'}
        </BAButton>
      ) : null}
      {build.answer ? <p className="course-answer-line">{session.zh ? '答案是：' : 'Here it is: '}{build.answer}</p> : null}
    </>
  );
}

function WriteBlock({
  session,
  activity,
  write,
}: {
  session: CourseSession;
  activity: ActivityModel;
  write: NonNullable<ActivityModel['write']>;
}) {
  return (
    <>
      {activity.assessment ? <h2 className="course-ask">{write.label}</h2> : <h1 className="course-title">{activity.ask}</h1>}
      <BAField
        label={session.zh ? '你的句子' : 'Your sentence'}
        multiline
        value={write.value}
        readOnly={write.status !== 'open'}
        onChange={(value) => session.setWriting(value)}
      />
      {write.chunks.length ? (
        <div className="course-cells" role="group" aria-label={session.zh ? '可用的词' : 'Words you can use'}>
          {write.chunks.map((chunk) => (
            <button key={chunk} type="button" className="course-cell" onClick={() => session.insertChunk(chunk)}>
              {chunk}
            </button>
          ))}
        </div>
      ) : null}
      {write.status === 'open' ? (
        <BAButton variant="ghost" locale={session.locale} onPress={() => session.resetBuild()}>
          {session.zh ? '重新开始' : 'Start again'}
        </BAButton>
      ) : null}
      {write.answer ? <p className="course-answer-line">{session.zh ? '一种写法：' : 'One way: '}{write.answer}</p> : null}
    </>
  );
}

function ApplyBlock({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const apply = activity.apply!;
  return (
    <>
      <h1 className="course-title">{activity.ask}</h1>
      {apply.tip ? <p className="course-tip">{apply.tip}</p> : null}
      <BAField
        label={activity.ask}
        multiline
        value={apply.value}
        readOnly={apply.passed}
        onChange={(value) => session.setWriting(value)}
      />
      {apply.checks.length ? (
        <ul className="course-checks" data-testid="apply-checks">
          {apply.checks.map((item) => (
            <li key={item.label} data-met={item.met ? 'true' : 'false'}>
              <span aria-hidden="true">{item.met ? '✓' : '○'}</span> {item.label}
            </li>
          ))}
        </ul>
      ) : null}
      {apply.glow ? <p className="course-glow">{apply.glow}</p> : null}
      {apply.canMoveOn ? (
        <BAButton variant="ghost" locale={session.locale} onPress={() => session.moveOnApply()}>
          <span data-testid="move-on">{session.zh ? '先继续' : 'Move on for now'}</span>
        </BAButton>
      ) : null}
    </>
  );
}

function AssessmentBlock({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const assessment = activity.assessment!;
  return (
    <div data-testid="assessment" data-stage={assessment.stage}>
      <h1 className="course-title">{activity.title}</h1>
      <div className="course-qbar">
        <span className="course-qbar__count">
          {session.zh
            ? `第 ${assessment.index + 1} 题，共 ${assessment.total} 题`
            : `Question ${assessment.index + 1} of ${assessment.total}`}
        </span>
        {assessment.stage === 'answering' ? (
          <span className="course-qdots" role="group" aria-label={session.zh ? '小测题目' : 'Check questions'}>
            {assessment.dots.map((dot) => (
              <button
                key={dot.index}
                type="button"
                className="course-qdot"
                data-current={dot.current ? 'true' : undefined}
                data-answered={dot.answered ? 'true' : undefined}
                aria-current={dot.current ? 'true' : undefined}
                aria-label={session.zh ? `第 ${dot.index + 1} 题` : `Question ${dot.index + 1}`}
                onClick={() => session.gotoQuestion(dot.index)}
              />
            ))}
          </span>
        ) : null}
        <span className="course-tip">{assessment.note}</span>
      </div>
      {assessment.blankWarning ? <p role="status" data-testid="blank-warning">{assessment.blankWarning}</p> : null}
      {assessment.reviewStatus ? <p data-testid="graded-status">{assessment.reviewStatus}</p> : null}
      {assessment.stage === 'review' ? (
        <BAButton variant="ghost" locale={session.locale} onPress={() => session.openResult(null)}>
          <span data-testid="all-results">{session.zh ? '全部结果' : 'All results'}</span>
        </BAButton>
      ) : null}
      {assessment.stage !== 'results' && assessment.pick ? (
        <PickBlock session={session} activity={activity} pick={assessment.pick} ask={assessment.ask ?? ''} />
      ) : null}
      {assessment.stage !== 'results' && assessment.tapword ? (
        <TapBlock session={session} activity={activity} tap={assessment.tapword} ask={assessment.ask ?? ''} />
      ) : null}
      {assessment.stage !== 'results' && assessment.write ? (
        <WriteBlock session={session} activity={activity} write={assessment.write} />
      ) : null}
      {assessment.resultLine ? <p data-testid="check-result">{assessment.resultLine}</p> : null}
      {assessment.rows ? (
        <div className="course-results">
          {assessment.rows.map((row) => (
            <button key={row.index} type="button" className="course-result" data-correct={row.correct ? 'true' : 'false'} data-testid="result-row" onClick={() => session.openResult(row.index)}>
              <span>{row.index + 1}</span>
              <span>
                {row.ask}
                <span className="course-result__why" data-testid="result-why">{row.why}</span>
              </span>
              <span>{row.correct ? (session.zh ? '对' : 'Right') : session.zh ? '再看看' : 'Look again'}</span>
            </button>
          ))}
        </div>
      ) : null}
      {assessment.canRetry && assessment.stage === 'results' ? (
        <BAButton variant="secondary" locale={session.locale} onPress={() => session.retryAssessment()}>
          <span data-testid="retry-check">{session.zh ? '换一组' : 'Try a new set'}</span>
        </BAButton>
      ) : null}
    </div>
  );
}
