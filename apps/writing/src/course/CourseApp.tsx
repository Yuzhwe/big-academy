import { useEffect, useState, useRef, type CSSProperties, type ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { BAButton, BAChoice, BATabs, BATabList, BATabPanel, localeTag } from '@big-academy/design-system';
import { LessonTopBar } from '../components/writing/LessonTopBar';
import { CoachMessage, LessonWorkspace } from '../components/writing/LessonWorkspace';
import { StairLessonCard, type StairLessonState } from '../components/writing/StairLessonCard';
import { UnitMilestone } from '../components/writing/UnitMilestone';
import { HamburgerComposition } from '../components/writing/HamburgerComposition';
import { WordGrid } from '../components/writing/WordGrid';
import { StaircaseScene } from './StaircaseScene';
import { StairUnitCard } from '../components/writing/StairUnitCard';
import alexHtml from '../../source/alex-original.html?raw';
import { CourseSession, type ActivityModel } from '../product/courseSession';
import './course.css';
import { LevelRewardFlag } from './LevelRewardFlag';
import { SolarLessonPreview } from '../components/writing/SolarLessonPreview';
import { BAPageTransition } from '../components/writing/BAPageTransition';
import { SpeechButton } from '../components/writing/SpeechButton';
import { lessonSpeech } from '../components/writing/speech';
import { LessonTestTools } from './LessonTestTools';
import { resolveMotionMode, type MotionMode } from './staircaseMotion';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION).matches;
}

function cardState(courseState: string, action: string): StairLessonState {
  if (courseState === 'skipped') return 'skipped';
  if (action === 'start' || action === 'continue' || action === 'review' || action === 'locked') return action;
  return 'locked';
}

export function CourseApp({ session: provided, enableLessonTestTools = true }: { session?: CourseSession; enableLessonTestTools?: boolean }) {
  const [formalSession] = useState(() => provided ?? new CourseSession({ html: alexHtml, search: window.location.search }));
  const [testSession,setTestSession] = useState<CourseSession|null>(null);
  const session = testSession ?? formalSession;
  const revision = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const locale = session.locale;
  const zh = locale === 'zh';
  const [motionMode, setMotionMode] = useState<MotionMode>('high');
  const [systemReduced, setSystemReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(REDUCED_MOTION);
    const update = () => setSystemReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  const effectiveMotion = resolveMotionMode(motionMode, systemReduced);
  const lowMotion = effectiveMotion === 'low';
  useEffect(()=>{lessonSpeech.stop();return()=>lessonSpeech.stop();},[session,session.view,session.state.screen]);
  useEffect(()=>{
    const stop=()=>lessonSpeech.stop();
    const hidden=()=>{if(document.hidden)stop();};
    window.addEventListener('pagehide',stop);document.addEventListener('visibilitychange',hidden);
    return()=>{stop();window.removeEventListener('pagehide',stop);document.removeEventListener('visibilitychange',hidden);};
  },[]);
  useEffect(() => {
    const flush = () => session.flush();
    const visibility = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', visibility);
    return () => { flush(); window.removeEventListener('pagehide', flush); window.removeEventListener('beforeunload', flush); document.removeEventListener('visibilitychange', visibility); };
  }, [session]);
  const gallery = new URLSearchParams(window.location.search).get('gallery') === 'choice';

  useEffect(() => {
    document.documentElement.lang = localeTag(locale);
  }, [locale]);

  useEffect(() => {
    if (session.view === 'path') session.observePath();
  }, [session, revision]);

  /* Navigation is now visually deferred by Cross Blur. Restore lesson card
   * focus only AFTER the new path DOM has actually mounted and settled. */
  const restorePathFocus=()=>{
    if(session.view!=='path'||!session.returnFocus)return;
    const focus=session.returnFocus;
    window.requestAnimationFrame(()=>{
      const target=document.querySelector<HTMLElement>(`[data-lesson-focus="${focus.unitId}:${focus.number}"]`);
      if(target) {
        target.focus();
        if(session.returnFocus?.unitId===focus.unitId&&session.returnFocus.number===focus.number)session.returnFocus=null;
      }
    });
  };

  if (gallery) return <ChoiceGallery zh={zh} />;

  return (
    <div className="course-app" lang={localeTag(locale)} data-revision={revision} data-view={session.view} data-ba-product="writing" data-test-mode={testSession?'true':undefined} data-motion={effectiveMotion} data-system-reduced={systemReduced ? 'true' : 'false'}>
      {testSession&&<div className="course-test-banner" role="region" aria-label="Test Mode">
        <strong>Test Mode</strong><span>{zh?'正式学习记录已保留':'Your real learning record is preserved'}</span>
        <BAButton size={36} variant="secondary" onPress={()=>{lessonSpeech.stop();setTestSession(null);}}>Exit Test</BAButton>
      </div>}
      <a className="course-skip" href="#course-main">
        {zh ? '跳到主要内容' : 'Skip to content'}
      </a>
      <BAPageTransition viewKey={session.view === 'lessonEnd' ? 'lesson' : session.view}
        duration={500} maxBlur={12} reducedMotion={lowMotion}
        onSettled={target=>{if(target==='path')restorePathFocus();}}
        renderView={key=>key==='path'?<PathView session={session} motionMode={motionMode} effectiveMotion={effectiveMotion} systemReduced={systemReduced} onMotionModeChange={setMotionMode}/>:key==='lesson'?<LessonView session={session} lowMotion={lowMotion}
          onResetLesson={enableLessonTestTools?()=>{lessonSpeech.stop();setTestSession(session.createLessonTestSession());}:undefined}/>:<PreviewView session={session}/>}/>
      {session.celebration ? <Celebration session={session} lowMotion={lowMotion} /> : null}
      {session.practiceBurst ? <PracticeBurst session={session} lowMotion={lowMotion} /> : null}
    </div>
  );
}

function PathView({ session, motionMode, effectiveMotion, systemReduced, onMotionModeChange }: { session: CourseSession; motionMode: MotionMode; effectiveMotion: MotionMode; systemReduced: boolean; onMotionModeChange: (mode: MotionMode) => void }) {
  const zh = session.zh;
  const level = session.level();
  const nodes = session.pathNodes();
  const freshMilestone = session.celebration && !session.celebration.replay ? session.celebration.unitId : null;
  const focusIndex = Math.max(0, nodes.findIndex((node) => node.kind === 'lesson' && node.lesson && (node.lesson.action === 'start' || node.lesson.action === 'continue')));

  return (
    <div className="course-path" data-motion={effectiveMotion}>
      <BATabs className="course-level-tabs" selectedKey={session.levelId} onSelectionChange={(key) => session.switchLevel(key)}>
        <header className="course-path__bar course-path__header">
          <div className="course-path__header-title">
            <h1 className="course-title" title={session.text(level.name)}>
              {zh ? '第 ' + level.id.slice(1) + ' 级' : 'Level ' + level.id.slice(1)} {session.text(level.name)}
            </h1>
          </div>
          <BATabList className="course-level-tablist" size={36} radius="full" emphasis="strong" distribution="hug"
            selectedKey={session.levelId} appearance="glass" aria-label={zh ? '切换级别' : 'Choose level'}
            options={session.levelPath.levels.map(item => ({
              id: item.id, label: item.id, accessibleLabel: session.text(item.name)
            }))}/>
          <div className="course-path__header-locale">
            <div className="course-motion-toggle" role="group" aria-label={zh ? '阶梯动效' : 'Staircase motion'}>
              <button type="button" aria-pressed={motionMode === 'high'} onClick={() => onMotionModeChange('high')}>{zh ? '高动态' : 'High motion'}</button>
              <button type="button" aria-pressed={motionMode === 'low'} onClick={() => onMotionModeChange('low')}>{zh ? '低动态' : 'Low motion'}</button>
            </div>
            {systemReduced ? <span className="course-motion-system-note" role="status">{zh ? '系统减少动态已启用' : 'System reduced motion is on'}</span> : null}
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
        {session.stoppedForToday ? (
          <p className="course-message" role="status" data-testid="saved-on-device">
            {zh ? '进度保存在这台设备上。' : 'Your work is saved on this device.'}
          </p>
        ) : null}
        <StaircaseScene key={level.id} levelId={level.id} locale={session.locale} count={nodes.length} focusIndex={focusIndex} motionMode={effectiveMotion}>
        <ol className="course-nodes">
          {nodes.map((node, index) => {
            if (node.kind === 'intro') {
              return (
                <li key={node.id} data-node-kind={node.kind} style={{ '--step-index': index } as CSSProperties}>
                  <p className="course-intro" data-testid="level-intro">
                    {node.intro}
                  </p>
                </li>
              );
            }
            if (node.kind === 'unit' && node.unit) {
              return (
                <li key={node.id} data-node-kind={node.kind} style={{ '--step-index': index } as CSSProperties}>
                  <StairUnitCard unit={node.unit} locale={session.locale} />
                </li>
              );
            }
            if (node.kind === 'lesson' && node.lesson) {
              const lesson = node.lesson;
              return (
                <li key={node.id} data-node-kind={node.kind} style={{ '--step-index': index } as CSSProperties}>
                  {lesson.courseState === 'current'
                    ? <SolarLessonPreview motionEnabled={effectiveMotion === 'high'}><StairLessonCard
                    lessonId={lesson.lessonId}
                    number={lesson.number}
                    title={lesson.title}
                    minutes={lesson.minutes}
                    current={lesson.courseState === 'current'}
                    state={cardState(lesson.courseState, lesson.action)}
                    detail={lesson.detail}
                    locale={session.locale}
                    onEnter={() => session.openLesson(lesson.unitId, lesson.number)}
                    onBlocked={() => session.openLesson(lesson.unitId, lesson.number)}
                  /></SolarLessonPreview>
                    : <StairLessonCard lessonId={lesson.lessonId} number={lesson.number} title={lesson.title}
                      minutes={lesson.minutes} current={false}
                      state={cardState(lesson.courseState,lesson.action)} detail={lesson.detail}
                      locale={session.locale}
                      onEnter={()=>session.openLesson(lesson.unitId,lesson.number)}
                      onBlocked={()=>session.openLesson(lesson.unitId,lesson.number)}/> }
                </li>
              );
            }
            if (node.kind === 'milestone' && node.milestone) {
              return (
                <li key={node.id} data-node-kind={node.kind} style={{ '--step-index': index } as CSSProperties}>
                  <UnitMilestone
                    unitId={node.milestone.unitId}
                    title={node.milestone.title}
                    completed={node.milestone.completed}
                    celebrationEligible={freshMilestone === node.milestone.unitId}
                    motionEnabled={effectiveMotion === 'high'}
                    locale={session.locale}
                    onCelebrate={(unitId) => session.replayMilestone(unitId)}
                  />
                </li>
              );
            }
            if (node.kind === 'goal' && node.goal) {
              return (
                <li key={node.id} data-node-kind={node.kind} style={{ '--step-index': index } as CSSProperties}>
                  <section className="course-goal" data-testid="level-goal" data-formula="open" aria-label={`${node.goal.title} · ${node.goal.detail}`}>
                    <LevelRewardFlag playing={effectiveMotion === 'high'} completed={session.levelRewardDone()} label={`${node.goal.title} · ${node.goal.detail} · ${session.levelRewardDone()?(zh?'已完成':'Completed'):(zh?'未完成':'Upcoming')}`} />
                  </section>
                </li>
              );
            }
            return null;
          })}
        </ol>
        </StaircaseScene>
        <p className="course-candidate">
          {zh
            ? 'E-01 使用 v2-terraces。天空是 135° 渐变。'
            : 'E-01 uses v2-terraces. The sky is the 135° gradient.'}
        </p>
      </main>
        </BATabPanel>
      </BATabs>
    </div>
  );
}

function LessonView({ session,lowMotion,onResetLesson }: { session: CourseSession;lowMotion?:boolean;onResetLesson?:()=>void }) {
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
        : null;
  const lessonEnd = session.view === 'lessonEnd';

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
        onBack={() => (lessonEnd ? session.leaveLesson('path') : session.backToPath())}
        onNavigate={(index) => session.navigateLocal(index)}
      />
      <LessonWorkspace
        navigationLayout={lessonEnd ? 'end' : 'pair'}
        tools={onResetLesson ? <LessonTestTools onReset={onResetLesson} zh={session.zh}/> : null}
        activity={<BAPageTransition viewKey={String(bar.current)} duration={300} maxBlur={6} reducedMotion={lowMotion}
          renderView={()=> <ActivityBody session={session} activity={activity}/>}/> }
        coach={
          <div>
            {activity.coach.map((line, index) => (
              <CoachMessage key={index} tone="orientation" locale={session.locale}>{line}</CoachMessage>
            ))}
            {activity.hints.map((hint, index) => (
              <CoachMessage key={index} tone="hint" locale={session.locale} data-testid="hint">{hint}</CoachMessage>
            ))}
            {activity.feedback ? (
              <CoachMessage tone={activity.feedbackTone} locale={session.locale} role="status" data-testid="feedback" data-outcome={activity.feedbackTone}>{activity.feedback}</CoachMessage>
            ) : null}
            <div className="lesson-workspace__coach-actions">
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
            </div>
          </div>
        }
        navigation={
          lessonEnd ? (
            <>
              <BAButton size={70} variant="secondary" locale={session.locale} onPress={() => session.leaveLesson('stop')}>
                {session.zh ? '今天先停' : 'Stop for today'}
              </BAButton>
              <BAButton size={70} variant="secondary" locale={session.locale} onPress={() => session.leaveLesson('path')}>
                {session.zh ? '回到我的学习路径' : 'Back to my path'}
              </BAButton>
              <BAButton size={70} variant="primary" locale={session.locale} disabled={footer.primaryDisabled} onPress={() => session.pressPrimary()}>
                <span data-testid={footer.primaryTestId}>{footer.primaryLabel}</span>
              </BAButton>
            </>
          ) : (
            <>
              <BAButton size={70} variant="secondary" locale={session.locale} disabled={footer.backDisabled} onPress={() => session.pressBack()}>
                {footer.backLabel}
              </BAButton>
              <BAButton size={70} variant="primary" locale={session.locale} disabled={footer.primaryDisabled} onPress={() => session.pressPrimary()}>
                <span data-testid={footer.primaryTestId}>{footer.primaryLabel}</span>
              </BAButton>
            </>
          )
        }
      />
    </div>
  );
}

function ActivityHeading({ title, speaker }: { title: string; speaker: ReactNode }) {
  return <div className="course-activity__heading">
    <h1 className="course-title">{title}</h1>
    {speaker}
  </div>;
}

function ActivityBody({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const editor = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const rememberCaret = (el: HTMLInputElement | HTMLTextAreaElement) => {
    editor.current = el;
    session.setCaret(el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length);
  };
  const insert = (word: string, id?: string) => {
    session.placeCard(word, id);
    requestAnimationFrame(() => {
      const el = editor.current;
      if (el && el.isConnected) { el.focus(); el.setSelectionRange(session.caret.start, session.caret.end); }
    });
  };
  const speaker = activity.check?.phase === 'results' ? null : (
    <SpeechButton className="course-listen" size={50} prompt locale={session.locale}
      text={activity.ask || activity.learn?.teach || activity.title}/>
  );
  const pickLocked =
    !!activity.pick?.locked ||
    !!activity.pick?.options.some((option) => option.state === 'correct' || option.state === 'correctUnselected' || option.state === 'dim');
  return (
    <article className="course-activity" data-template={activity.template} data-kind={activity.kind} data-writing={activity.canvas ? 'true' : undefined}>
      {activity.check && activity.check.phase !== 'results' ? (
        <div className="course-check">
          <p className="course-check__number" data-testid="check-number">
            {activity.check.number}
          </p>
          <div className="course-dots" role="group" aria-label={session.zh ? '检查题目' : 'Check questions'}>
            {activity.check.dots.map((dot, index) => (
              <button
                key={index}
                type="button"
                className="course-dot"
                aria-label={session.zh ? `第 ${index + 1} 题` : `Question ${index + 1}`}
                aria-current={dot.current ? 'true' : undefined}
                data-answered={dot.answered ? 'true' : 'false'}
                onClick={() => (activity.check?.phase === 'graded' ? session.openCheckResult(index) : session.openCheckQuestion(index))}
              />
            ))}
          </div>
        </div>
      ) : null}
      {activity.check?.phase === 'results' ? (
        <div className="course-results" data-testid="check-results">
          <h1 className="course-title">{activity.check.passed ? (session.zh ? '你通过了这次检查。' : 'You passed this check.') : session.zh ? '还没有。' : 'Not yet.'}</h1>
          {activity.check.scoreLine ? <p>{activity.check.scoreLine}</p> : null}
          <ol>
            {activity.check.rows?.map((row) => (
              <li key={row.index}>
                <button type="button" onClick={() => session.openCheckResult(row.index)}>
                  <span aria-hidden="true">{row.index + 1}</span>
                  <span lang="en">{row.ask}</span>
                  <span className="course-results__mark">{row.correct ? (session.zh ? '对' : 'Right') : session.zh ? '还没有' : 'Not yet'}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {activity.learn ? (
        <>
          <ActivityHeading title={activity.learn.heading || activity.title} speaker={speaker} />
          {activity.learn.teach ? <p className="course-teach">{activity.learn.teach}</p> : null}
          {activity.learn.weak || activity.learn.strong ? (
            <div className={activity.layers?.length ? 'course-learn-two-column' : undefined}>
              {activity.layers?.length ? <HamburgerComposition layers={activity.layers.map(layer=>({layerId:layer.id,label:layer.label,value:layer.value,emphasis:layer.emphasis}))}/> : null}
            <div className="course-examples">
              {activity.learn.weak ? (
                <p lang="en">
                  <span className="course-examples__label">{activity.learn.weakLabel}</span> {activity.learn.weak}
                </p>
              ) : null}
              {activity.learn.strong ? (
                <p className="course-examples__better" lang="en" data-testid="better-panel" data-cue="pedagogical">
                  <span>
                    <span className="course-examples__label">{activity.learn.strongLabel}</span> {activity.learn.strong}
                  </span>
                </p>
              ) : null}
            </div>
            </div>
          ) : null}
          {activity.learn.nextUp ? <p>{activity.learn.nextUp}</p> : null}
        </>
      ) : null}
      {activity.layers?.length && !activity.learn ? (
        <div className="hamburger-stack" data-testid="hamburger">
          <HamburgerComposition layers={activity.layers.map(layer=>({layerId:layer.id,label:layer.label,value:layer.value,emphasis:layer.emphasis}))}/>
        </div>
      ) : null}
      {activity.pick && activity.check?.phase !== 'results' ? (
        <>
          <ActivityHeading title={activity.ask} speaker={speaker} />
          {activity.pick.hint ? <p>{activity.pick.hint}</p> : null}
          <BAChoice
            choiceMode={activity.pick.multi ? 'multiple' : 'single'}
            aria-label={activity.ask}
            disabled={pickLocked}
            selectedKeys={activity.pick.options.filter((option) => option.selected).map((option) => String(option.index))}
            options={activity.pick.options.map((option) => ({
              id: String(option.index),
              letter: option.letter,
              text: option.text,
              state: option.state,
            }))}
            onChange={(keys) => {
              if (activity.pick?.multi) {
                const previous = new Set(activity.pick.options.filter((option) => option.selected).map((option) => String(option.index)));
                const next = new Set(keys);
                for (const key of keys) if (!previous.has(key)) session.pick(Number(key));
                for (const key of previous) if (!next.has(key)) session.pick(Number(key));
                return;
              }
              if (keys[0] != null) session.pick(Number(keys[0]));
            }}
          />
        </>
      ) : null}
      {activity.tapword && activity.check?.phase !== 'results' ? (
        <>
          <ActivityHeading title={activity.ask} speaker={speaker} />
          <p className="course-words" lang="en">
            {activity.tapword.words.map((word) => (
              <button
                key={word.index}
                type="button"
                className="course-word"
                disabled={activity.tapword?.locked}
                data-selected={word.selected ? 'true' : undefined}
                data-wrong={word.wrong ? 'true' : undefined}
                data-revealed={word.revealed ? 'true' : undefined}
                data-correct={word.correct ? 'true' : undefined}
                aria-pressed={word.selected}
                aria-label={word.revealed ? `${word.text} · ${session.zh ? '展示答案' : 'Shown answer'}` : word.correct ? `${word.text} · ${session.zh ? '正确' : 'Correct'}` : undefined}
                onClick={() => session.tapWord(word.index)}
              >
                {word.text}
              </button>
            ))}
          </p>
        </>
      ) : null}
      {activity.build ? (
        <>
          <ActivityHeading title={activity.ask} speaker={speaker} />
          {activity.build.revealed ? (
            <p className="course-revealed" lang="en">
              {activity.build.revealed}
            </p>
          ) : (
            <p className="course-bench" lang="en" data-testid="build-bench" data-ordered={activity.build.ordered ? 'true' : undefined}>
              {activity.build.bench ? <span data-testid="bench-text">{activity.build.bench}</span> : null}
              {activity.build.ordered
                ? Array.from({ length: activity.build.remaining ?? 0 }, (_, index) => (
                    <span key={index} className="course-bench__blank" data-testid="bench-blank" />
                  ))
                : activity.build.bench
                  ? null
                  : '…'}
            </p>
          )}
          {activity.build.revealed || activity.build.ordered ? null : (
            <BAButton variant="ghost" locale={session.locale} onPress={() => session.startAgain()}>
              {session.zh ? '重新开始' : 'Start again'}
            </BAButton>
          )}
        </>
      ) : null}
      {activity.frame ? (
        <>
          <ActivityHeading title={activity.ask} speaker={speaker} />
          <p className="course-frame" lang="en" data-testid="frame">
            {activity.frame.parts.map((part, index) => (
              <span key={`${part}-${index}`}>
                {part}
                {index < activity.frame!.blanks.length ? (
                  <input
                    aria-label={activity.frame!.blanks[index].label || (session.zh ? `空 ${index + 1}` : `Blank ${index + 1}`)}
                    value={activity.frame!.blanks[index].value}
                    readOnly={session.currentTaskClosed()}
                    onFocus={(event) => { session.focusBlank(index); rememberCaret(event.currentTarget); }}
                    onSelect={(event) => rememberCaret(event.currentTarget)}
                    onChange={(event) => session.setBlank(index, event.target.value)}
                  />
                ) : null}
              </span>
            ))}
          </p>
        </>
      ) : null}
      {activity.canvas && activity.check?.phase !== 'results' ? (
        <>
          <ActivityHeading title={activity.ask} speaker={speaker} />
          <label className="course-canvas">
            <span className="course-sr">{activity.canvas.label}</span>
            <textarea
              lang="en"
              data-testid="writing-canvas"
              value={activity.canvas.text}
              readOnly={activity.check?.phase === 'graded'}
              onFocus={(event) => rememberCaret(event.currentTarget)}
              onSelect={(event) => rememberCaret(event.currentTarget)}
              onPaste={() => session.markPaste()}
              onChange={(event) => session.setCanvas(event.target.value)}
            />
          </label>
          {activity.kind !== 'apply' && activity.canvas.tip ? <p>{activity.canvas.tip}</p> : null}
        </>
      ) : null}
      {activity.wordGrid ? (
        <WordGrid
          groups={activity.wordGrid.groups.map(group => ({ ...group, words: group.words.map(word => ({ ...word, selection: word.used ? 'selected' as const : 'default' as const, disabled: session.currentTaskClosed(), evaluation: word.hint ? 'hint' as const : undefined })) }))}
          activeGroup={activity.wordGrid.active}
          locale={session.locale}
          onGroupChange={(key) => session.selectGrid(key)}
          onWordAction={(word) => insert(word.text, word.id)}
        />
      ) : null}
      {activity.check?.phase === 'results' && activity.check.tryNew && session.canNext(session.inspect().screen) ? (
        <BAButton variant="secondary" locale={session.locale} onPress={() => session.retryCheck()}>{session.zh ? '再做一组' : 'Try a new set'}</BAButton>
      ) : null}
      {activity.applyMoveOn ? (
        <BAButton variant="secondary" locale={session.locale} onPress={() => session.moveOn()}>
          <span data-testid="move-on">{session.zh ? '先继续' : 'Move on for now'}</span>
        </BAButton>
      ) : null}
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

function PracticeBurst({ session, lowMotion = false }: { session: CourseSession; lowMotion?: boolean }) {
  const reduced = lowMotion || prefersReducedMotion();
  const lesson = !!session.practiceBurst?.lesson;
  useEffect(() => { const timeout = window.setTimeout(() => session.dismissPractice(), 2400); return () => window.clearTimeout(timeout); }, [session, session.practiceBurst?.id]);
  const label = lesson
    ? session.zh
      ? '这一课完成了。'
      : 'Lesson complete.'
    : session.zh
      ? '做对了。'
      : 'Correct.';
  useEffect(() => {
    if (reduced) return;
    let handle: { destroy: () => void } | undefined;
    let cancel = false;
    void import('../celebration/particleRuntime')
      .then((runtime) => runtime.startPracticeCelebration(lesson))
      .then((next) => {
        if (cancel) next.destroy();
        else handle = next;
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
      handle?.destroy();
    };
  }, [lesson, reduced]);
  return (
    <div
      className="course-practice"
      role="status"
      data-testid="practice-burst"
      data-lesson={lesson ? 'true' : 'false'}
      data-preset={reduced ? 'off' : 'ribbons-explosions'}
    >
      <span>{label}</span>
      <button type="button" onClick={() => session.dismissPractice()}>
        {session.zh ? '知道了' : 'OK'}
      </button>
    </div>
  );
}

function Celebration({ session, lowMotion = false }: { session: CourseSession; lowMotion?: boolean }) {
  const reduced = lowMotion || prefersReducedMotion();
  const title = session.celebration?.title ?? '';
  const unitId = session.celebration?.unitId ?? '';
  useEffect(() => {
    if (reduced || !unitId) return;
    const flag = document.querySelector<HTMLElement>(`[data-unit="${unitId}"] [data-testid="milestone"]`);
    const rect = flag?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    let handle: { destroy: () => void } | undefined;
    let cancel = false;
    void import('../celebration/particleRuntime')
      .then((runtime) => runtime.startMilestoneConfetti(x, y))
      .then((next) => {
        if (cancel) next.destroy();
        else handle = next;
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
      handle?.destroy();
    };
  }, [reduced, unitId]);
  return (
    <div
      className="course-celebration"
      role="dialog"
      aria-modal="false"
      aria-label={title}
      data-testid="celebration"
      data-preset={reduced ? 'off' : 'confetti'}
      data-start-count={reduced ? undefined : '50'}
      data-rate-quantity={reduced ? undefined : '0'}
      data-life-count={reduced ? undefined : '1'}
    >
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

/** Review surface for the six candidate choice states. Not a lesson screen. */
function ChoiceGallery({ zh }: { zh: boolean }) {
  const rows = [
    { id: '0', letter: 'A', text: 'Gardens have plants.', state: 'default' as const },
    { id: '1', letter: 'B', text: 'Our school should have a garden for two big reasons.', state: 'selected' as const },
    { id: '2', letter: 'C', text: 'I like flowers.', state: 'wrong' as const },
    { id: '3', letter: 'D', text: 'Our school should have a garden for two big reasons.', state: 'correct' as const },
    { id: '4', letter: 'E', text: 'Our school should have a garden for two big reasons.', state: 'correctUnselected' as const },
    { id: '5', letter: 'F', text: 'A garden is nice.', state: 'dim' as const },
  ];
  return (
    <main className="course-preview" data-testid="choice-gallery">
      <h1 className="course-title">{zh ? '选项六态（候选）' : 'Choice states (candidate)'}</h1>
      <BAChoice choiceMode="multiple" aria-label="Choice states" options={rows} selectedKeys={['1']} />
    </main>
  );
}

