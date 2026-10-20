import { useEffect, useState, type CSSProperties } from 'react';
import { StaircaseScene, type StaircaseVariant } from './StaircaseScene';
import { useSyncExternalStore } from 'react';
import { Checkbox, Radio, RadioGroup } from 'react-aria-components';
import { BAButton, BATabs, BATabList, BATabPanel, localeTag } from '@big-academy/design-system';
import { LessonTopBar } from '../components/writing/LessonTopBar';
import { LessonWorkspace } from '../components/writing/LessonWorkspace';
import { StairLessonCard, type StairLessonState } from '../components/writing/StairLessonCard';
import { UnitMilestone } from '../components/writing/UnitMilestone';
import alexHtml from '../../source/alex-original.html?raw';
import { CourseSession } from '../product/courseSession';
import './course.css';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function cardState(courseState: string, action: string): StairLessonState {
  if (courseState === 'skipped') return 'skipped';
  if (action === 'start' || action === 'continue' || action === 'review' || action === 'locked') return action;
  return 'locked';
}

export function CourseApp({ session: provided }: { session?: CourseSession }) {
  const [session] = useState(() => provided ?? new CourseSession({ html: alexHtml, search: window.location.search }));
  const revision = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  // Visual A/B state is a review-only control, not saved to Alex's learning state.
  const [staircaseVariant, setStaircaseVariant] = useState<StaircaseVariant>('A');
  const locale = session.locale;
  const zh = locale === 'zh';

  useEffect(() => {
    document.documentElement.lang = localeTag(locale);
  }, [locale]);

  useEffect(() => {
    if (session.view === 'path') session.observePath();
  }, [session, revision]);

  useEffect(() => {
    if (session.view !== 'path' || !session.returnFocus) return;
    const focus = session.returnFocus;
    const frame = window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-lesson-focus="${focus.unitId}:${focus.number}"]`)
        ?.focus();
      if (session.returnFocus?.unitId === focus.unitId && session.returnFocus.number === focus.number) {
        session.returnFocus = null;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [session, revision]);

  return (
    <div className="course-app" lang={localeTag(locale)} data-revision={revision} data-view={session.view} data-ab-variant={staircaseVariant} data-ba-product="writing">
      <a className="course-skip" href="#course-main">
        {zh ? '跳到主要内容' : 'Skip to content'}
      </a>
      {session.view === 'path' ? <PathView session={session} variant={staircaseVariant} onVariantChange={setStaircaseVariant} /> : null}
      {session.view === 'lesson' || session.view === 'lessonEnd' ? <LessonView session={session} /> : null}
      {session.view === 'preview' ? <PreviewView session={session} /> : null}
      {session.celebration ? <Celebration session={session} /> : null}
    </div>
  );
}

function PathView({ session, variant, onVariantChange }: { session: CourseSession; variant: StaircaseVariant; onVariantChange: (next: StaircaseVariant) => void }) {
  const zh = session.zh;
  const level = session.level();
  const nodes = session.pathNodes();
  const freshMilestone = session.celebration && !session.celebration.replay ? session.celebration.unitId : null;
  const focusIndex = Math.max(0, nodes.findIndex((node) => node.kind === 'lesson' && node.lesson && (node.lesson.action === 'start' || node.lesson.action === 'continue')));

  return (
    <div className="course-path">
      <BATabs className="course-level-tabs" selectedKey={session.levelId} onSelectionChange={(key) => session.switchLevel(key)}>
        <header className="course-path__bar course-path__header">
          <div className="course-path__header-title">
            <p className="course-kicker course-visually-hidden">{zh ? '写作路径' : 'Writing path'}</p>
            <h1 className="course-title" title={session.text(level.name)}>
              {zh ? '第 ' + level.id.slice(1) + ' 级' : 'Level ' + level.id.slice(1)} {session.text(level.name)}
            </h1>
          </div>
          <BATabList className="course-level-tablist" size={36} radius="full" emphasis="strong" distribution="hug"
            selectedKey={session.levelId} aria-label={zh ? '切换级别' : 'Choose level'}
            options={session.levelPath.levels.map(item => ({
              id: item.id, label: item.id, accessibleLabel: session.text(item.name)
            }))}/>
          <div className="course-path__header-locale">
            <BAButton variant="secondary" locale={session.locale} onPress={() => session.toggleLocale()}>
              {zh ? 'English' : '中文'}
            </BAButton>
          </div>
        </header>
        <BATabPanel id={session.levelId} className="course-level-panel">
      <main id="course-main" className="course-path__main">
        {session.message ? (
          <p className="course-message" role="status" data-testid="locked-note">
            {session.message}
          </p>
        ) : null}
        {session.openNotice ? (
          <p className="course-message" role="status" data-testid="open-notice">
            {session.openNotice}
          </p>
        ) : null}
        <StaircaseScene key={level.id} variant={variant} locale={session.locale} count={nodes.length} focusIndex={focusIndex}>
        <ol className="course-nodes">
          {nodes.map((node, index) => {
            if (node.kind === 'intro') {
              return (
                <li key={node.id} style={{ '--step-index': index } as CSSProperties}>
                  <p className="course-intro" data-testid="level-intro">
                    {node.intro}
                  </p>
                </li>
              );
            }
            if (node.kind === 'unit' && node.unit) {
              return (
                <li key={node.id} style={{ '--step-index': index } as CSSProperties}>
                  <section className="course-unit" data-testid="unit" data-unit={node.unit.id}>
                    <p className="course-kicker">
                      {zh ? `第 ${node.unit.index} 单元` : `Unit ${node.unit.index}`} · {node.unit.typeLabel}
                    </p>
                    <h2>{node.unit.title}</h2>
                    <p>{node.unit.meta}</p>
                    {node.unit.goals.length ? (
                      <ul className="course-unit-goals">
                        {node.unit.goals.map((goal) => (
                          <li key={goal}>{goal}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                </li>
              );
            }
            if (node.kind === 'lesson' && node.lesson) {
              const lesson = node.lesson;
              return (
                <li key={node.id} style={{ '--step-index': index } as CSSProperties}>
                  <StairLessonCard
                    lessonId={lesson.lessonId}
                    number={lesson.number}
                    title={lesson.title}
                    state={cardState(lesson.courseState, lesson.action)}
                    detail={lesson.detail}
                    locale={session.locale}
                    onEnter={() => session.openLesson(lesson.unitId, lesson.number)}
                  />
                </li>
              );
            }
            if (node.kind === 'milestone' && node.milestone) {
              return (
                <li key={node.id} style={{ '--step-index': index } as CSSProperties}>
                  <UnitMilestone
                    unitId={node.milestone.unitId}
                    title={node.milestone.title}
                    completed={node.milestone.completed}
                    celebrationEligible={freshMilestone === node.milestone.unitId}
                    locale={session.locale}
                    onCelebrate={(unitId) => session.replayMilestone(unitId)}
                  />
                </li>
              );
            }
            if (node.kind === 'goal' && node.goal) {
              return (
                <li key={node.id} style={{ '--step-index': index } as CSSProperties}>
                  <section className="course-goal" data-testid="level-goal" data-formula="open">
                    <p className="course-kicker">{node.goal.title}</p>
                    <h2>{node.goal.detail}</h2>
                    <p>
                      {zh
                        ? '完成公式仍未决定（Q-M06）。这里只保留位置，不记完成。'
                        : 'The completion formula is still open (Q-M06). This marker is not scored.'}
                    </p>
                  </section>
                </li>
              );
            }
            return null;
          })}
        </ol>
        </StaircaseScene>
      </main>
        </BATabPanel>
      </BATabs>
    </div>
  );
}

function LessonView({ session }: { session: CourseSession }) {
  const bar = session.topBar();
  const activity = session.activity();
  const footer = session.footer();
  if (!bar || !activity) return null;
  const hintLabel =
    activity.hintAction === 'hint'
      ? session.zh
        ? '需要提示？'
        : 'Need a hint?'
      : activity.hintAction === 'another'
        ? session.zh
          ? '再来一个提示'
          : 'Another hint'
        : activity.hintAction === 'reveal'
          ? session.zh
            ? '看答案'
            : 'Show me the answer'
          : null;

  return (
    <div className="course-lesson">
      <LessonTopBar
        lessonTitle={bar.lessonTitle}
        lessonNumber={bar.lessonNumber}
        tasks={bar.tasks}
        current={bar.current}
        canOpen={session.canOpenLocal}
        tags={bar.tags}
        locale={session.locale}
        onBack={() => session.backToPath()}
        onNavigate={(index) => session.navigateLocal(index)}
      />
      <LessonWorkspace
        activity={
          <article className="course-activity" data-template={activity.template} data-kind={activity.kind}>
            {activity.learn ? (
              <>
                <h1 className="course-title">{activity.learn.heading || activity.title}</h1>
                {activity.learn.teach ? <p className="course-teach">{activity.learn.teach}</p> : null}
                {activity.learn.weak || activity.learn.strong ? (
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
                ) : null}

              </>
            ) : null}
            {activity.pick ? (
              <>
                <div className="course-instruction"><h1 className="course-title">{activity.ask}</h1><button type="button" className="course-listen" aria-label={session.zh?'朗读题目':'Listen to instruction'} onClick={() => {if ('speechSynthesis' in window) {window.speechSynthesis.cancel();window.speechSynthesis.speak(new SpeechSynthesisUtterance(activity.ask));}}}>◖))</button></div>
                {activity.pick.hint ? <p>{activity.pick.hint}</p> : null}
                {activity.pick.multi ? (
                  <div className="course-choices" role="group" aria-label={activity.ask}>
                    {activity.pick.options.map((option) => (
                      <Checkbox
                        key={option.index}
                        className="course-choice"
                        data-wrong={option.wrong ? 'true' : undefined}
                        data-correct={option.correct ? 'true' : undefined}
                        data-revealed={option.revealed ? 'true' : undefined}
                        isSelected={option.selected}
                        onChange={() => session.pick(option.index)}
                      >
                        <span className="course-choice__letter">{option.letter}</span>
                        <span>{option.text}</span>
                      </Checkbox>
                    ))}
                  </div>
                ) : (
                  <RadioGroup
                    className="course-choices"
                    aria-label={activity.ask}
                    value={activity.pick.options.find((option) => option.selected)?.index.toString() ?? ''}
                    onChange={(value) => session.pick(Number(value))}
                  >
                    {activity.pick.options.map((option) => (
                      <Radio
                        key={option.index}
                        className="course-choice"
                        data-wrong={option.wrong ? 'true' : undefined}
                        data-correct={option.correct ? 'true' : undefined}
                        data-revealed={option.revealed ? 'true' : undefined}
                        isDisabled={option.correct || option.revealed}
                        value={String(option.index)}
                      >
                        <span className="course-choice__letter">{option.letter}</span>
                        <span>{option.text}</span>
                      </Radio>
                    ))}
                  </RadioGroup>
                )}
              </>
            ) : null}
            {activity.tapword ? (
              <>
                <h1 className="course-title">{activity.ask}</h1>
                <p className="course-words">
                  {activity.tapword.words.map((word) => (
                    <button
                      key={word.index}
                      type="button"
                      className="course-word"
                      data-selected={word.selected ? 'true' : undefined}
                      data-wrong={word.wrong ? 'true' : undefined}
                      data-correct={word.correct ? 'true' : undefined}
                      data-revealed={word.revealed ? 'true' : undefined}
                      onClick={() => session.tapWord(word.index)}
                    >
                      {word.text}
                    </button>
                  ))}
                </p>
              </>
            ) : null}

            {activity.writing ? (
              <section className="course-writing">
                <div className="course-instruction"><h1 className="course-title">{activity.ask}</h1></div>
                {activity.writing.type === 'build' ? (
                  <>
                    <p className="course-build-line" aria-live="polite">{activity.writing.built.join(' ') || (session.zh ? '按顺序选择词语' : 'Build it here')}</p>
                    <div className="course-word-grid" role="group" aria-label="Word grid">
                      {activity.writing.tokens.map((word,index)=><button key={index} disabled={activity.writing?.status !== 'open' || index < (activity.writing?.built.filter(w=>w===word).length ?? 0)} onClick={()=>session.addBuildWord(word)}>{word}</button>)}
                    </div>
                    <BAButton variant="secondary" onPress={()=>session.clearBuild()}>Start again</BAButton>
                  </>
                ) : (
                  <>
                    <label htmlFor="writing-frame">{session.zh?'你的句子':'Your sentence'}</label>
                    <textarea id="writing-frame" rows={5} value={activity.writing.text} disabled={activity.writing.status!=='open'} onChange={e=>session.setWriting(e.target.value)} />
                    {activity.writing.tokens.length>0 ? <div className="course-word-grid">{activity.writing.tokens.map((word,index)=><button key={index} onClick={()=>session.setWriting(activity.writing!.text.replace('___',word))}>{word}</button>)}</div>:null}
                  </>
                )}
              </section>
            ) : null}
            {activity.apply ? (
              <section className="course-writing">
                <div className="course-instruction"><h1 className="course-title">{activity.ask}</h1></div>
                <label htmlFor="apply-text">{session.zh?'写下三个不同的主题句':'Your three topic sentences'}</label>
                <textarea id="apply-text" rows={9} value={activity.apply.text} onChange={e=>session.setWriting(e.target.value)}/>
                {activity.apply.tries>=2 && !activity.apply.passed ? <BAButton variant="secondary" onPress={()=>session.moveOnApply()}>{session.zh?'暂时跳过':'Move on for now'}</BAButton>:null}
              </section>
            ) : null}
            {activity.assessment ? (
              <section className="course-assessment">
                <span className="course-question-number" aria-label={`Question ${activity.assessment.index+1} of 4`}>{activity.assessment.index+1}</span>
                <h1 className="course-title">{activity.ask}</h1>
                <nav className="course-question-dots" aria-label="Assessment questions">{[0,1,2,3].map(n=><button aria-label={`Question ${n+1} of 4`} aria-current={n===activity.assessment?.index?'step':undefined} key={n} onClick={()=>session.assessmentQuestion(n)}>{n+1}</button>)}</nav>
                {activity.assessment.question.type === 'tapword' ? (
                  <div className="course-words" role="group" aria-label={activity.ask}>
                    {session.engine.tokens(activity.assessment.question.text ?? '').map((word, index) => {
                      const response = Array.isArray(activity.assessment?.answer) ? activity.assessment.answer : [];
                      const isTarget = (activity.assessment?.question.targets ?? []).some(target =>
                        session.engine.locate(activity.assessment?.question.text ?? '', target) === index
                      );
                      const graded = !!activity.assessment?.results;
                      return (
                        <button
                          type="button"
                          key={index}
                          className="course-word"
                          aria-pressed={response.includes(index)}
                          data-selected={response.includes(index) ? 'true' : undefined}
                          data-correct={graded && isTarget ? 'true' : undefined}
                          data-wrong={graded && response.includes(index) && !isTarget ? 'true' : undefined}
                          disabled={graded}
                          onClick={() => session.answerAssessment([index])}
                        >
                          {word.w}
                        </button>
                      );
                    })}
                  </div>
                ) : activity.assessment.question.type === 'pick' ? (
                  <div className="course-choices" role="group" aria-label={activity.ask}>
                    {(activity.assessment.question.lines ?? []).map((option, index) => {
                      const response = Array.isArray(activity.assessment?.answer) ? activity.assessment.answer : [];
                      const graded = !!activity.assessment?.results;
                      const correct = (activity.assessment?.question.answers ?? []).includes(index);
                      return (
                        <button
                          type="button"
                          key={index}
                          className="course-choice"
                          aria-pressed={response.includes(index)}
                          data-selected={response.includes(index) ? 'true' : undefined}
                          data-correct={graded && correct ? 'true' : undefined}
                          data-revealed={graded && correct && !response.includes(index) ? 'true' : undefined}
                          data-wrong={graded && response.includes(index) && !correct ? 'true' : undefined}
                          disabled={graded}
                          onClick={() => session.answerAssessment(
                            activity.assessment?.question.multi
                              ? response.includes(index) ? response.filter(i => i !== index) : [...response, index]
                              : [index]
                          )}
                        >
                          <span className="course-choice__letter">{String.fromCharCode(65 + index)}</span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    rows={6}
                    aria-label={session.zh ? '书写答案' : 'Writing answer'}
                    value={typeof activity.assessment.answer === 'string' ? activity.assessment.answer : ''}
                    disabled={!!activity.assessment.results}
                    onChange={e => session.answerAssessment(e.target.value)}
                  />
                )}
                {activity.assessment.results ? <p role="status">{activity.assessment.passed?'You passed this check.':'Not yet.'} {activity.assessment.results.filter(Boolean).length} / 4</p>:null}
              </section>
            ):null}
            {!activity.supported && !activity.learn ? (
              <>
                <h1 className="course-title">{activity.ask || activity.title}</h1>
                <p className="course-message" data-testid="unsupported-template">
                  {activity.unsupportedReason}
                </p>
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
        }
        coach={
          <div>
            {activity.coach.map((line) => (
              <p key={line} className="course-coach-message" data-tone="orientation">{line}</p>
            ))}
            {activity.hints.map((hint) => (
              <p key={hint} data-testid="hint" className="course-coach-message" data-tone="hint">
                {hint}
              </p>
            ))}
            {activity.coachMore ? (
              <BAButton variant="secondary" locale={session.locale} onPress={() => session.showAnother()}>
                {session.zh ? '再看一个' : 'Show me another'}
              </BAButton>
            ) : null}
            {hintLabel ? (
              <BAButton variant="secondary" locale={session.locale} onPress={() => session.openHint()}>
                {hintLabel}
              </BAButton>
            ) : null}
            {activity.feedback ? (
              <p className="course-feedback course-coach-message" data-tone={activity.feedback.match(/Right|Yes|passed|met|对|正确/i) ? "success" : "error"} role="status" data-testid="feedback">
                {activity.feedback}
              </p>
            ) : null}
          </div>
        }
        navigation={
          <>
            <BAButton variant="secondary" locale={session.locale} isDisabled={footer.previousDisabled}
              onPress={() => session.pressBack()}>
              {footer.backLabel}
            </BAButton>
            <BAButton variant="primary" locale={session.locale} onPress={() => session.pressPrimary()}>
              <span data-testid={footer.primaryTestId}>{footer.primaryLabel}</span>
            </BAButton>
          </>
        }
      />
    </div>
  );
}

function PreviewView({ session }: { session: CourseSession }) {
  const preview = session.previewModel();
  return (
    <main id="course-main" className="course-preview">
      <h1 className="course-title">{preview?.title}</h1>
      <p>{preview?.body}</p>
      <BAButton variant="primary" locale={session.locale} onPress={() => session.backToPath()}>
        {session.zh ? '我的路径' : 'My path'}
      </BAButton>
    </main>
  );
}

function Celebration({ session }: { session: CourseSession }) {
  const reduced = window.matchMedia(REDUCED_MOTION).matches;
  const title = session.celebration?.title ?? '';
  return (
    <div className="course-celebration" role="dialog" aria-modal="false" aria-label={title} data-testid="celebration">
      {reduced ? null : (
        <div className="course-confetti" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
      )}
      <div className="course-celebration__card">
        <p>{session.zh ? '里程碑' : 'Milestone'}</p>
        <h2>{title}</h2>
        <p>
          {reduced
            ? session.zh
              ? '已达成。减少动效时不播放彩纸。'
              : 'Reached. Confetti stays off when motion is reduced.'
            : session.zh
              ? '达成了。彩纸只是提示，不改变课程进度。'
              : 'Reached. Confetti is only a receipt. It does not change course progress.'}
        </p>
        <BAButton variant="primary" locale={session.locale} onPress={() => session.dismissCelebration()}>
          {session.zh ? '好' : 'OK'}
        </BAButton>
      </div>
    </div>
  );
}
