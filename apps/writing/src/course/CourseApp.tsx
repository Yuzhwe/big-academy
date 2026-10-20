import { useEffect, useState, type CSSProperties } from 'react';
import { StaircaseScene, type StaircaseVariant } from './StaircaseScene';
import { useSyncExternalStore } from 'react';
import { Button } from 'react-aria-components';
import {
  BAButton,
  BAIcon,
  BANumber,
  BATabs,
  BATabList,
  BATabPanel,
  localeTag,
} from '@big-academy/design-system';
import { LessonTopBar } from '../components/writing/LessonTopBar';
import { StairUnitCard } from '../components/writing/StairUnitCard';
import { LessonActivity } from '../components/writing/LessonActivity';
import { LessonWorkspace } from '../components/writing/LessonWorkspace';
import { StairLessonCard, type StairLessonState } from '../components/writing/StairLessonCard';
import { UnitMilestone } from '../components/writing/UnitMilestone';
import alexHtml from '../../source/alex-original.html?raw';
import { CourseSession } from '../product/courseSession';
import './course.css';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function cardState(courseState: string, action: string): StairLessonState {
  if (courseState === 'skipped') return 'skipped';
  if (action === 'start' || action === 'continue' || action === 'review' || action === 'locked')
    return action;
  return 'locked';
}

export function CourseApp({ session: provided }: { session?: CourseSession }) {
  const [session] = useState(
    () => provided ?? new CourseSession({ html: alexHtml, search: window.location.search }),
  );
  const revision = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  // Visual A/B state is a review-only control, not saved to Alex's learning state.
  const [staircaseVariant] = useState<StaircaseVariant>('A');
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
      document.querySelector<HTMLElement>(`[data-lesson-focus="${focus.unitId}:${focus.number}"]`)?.focus();
      if (session.returnFocus?.unitId === focus.unitId && session.returnFocus.number === focus.number) {
        session.returnFocus = null;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [session, revision]);

  return (
    <div
      className="course-app"
      lang={localeTag(locale)}
      data-revision={revision}
      data-view={session.view}
      data-ab-variant={staircaseVariant}
      data-ba-product="writing"
    >
      <a className="course-skip" href="#course-main">
        {zh ? '跳到主要内容' : 'Skip to content'}
      </a>
      {session.view === 'path' ? <PathView session={session} variant={staircaseVariant} /> : null}
      {session.view === 'lesson' || session.view === 'lessonEnd' ? <LessonView session={session} /> : null}
      {session.view === 'stopped' ? <StoppedView session={session} /> : null}
      {session.view === 'preview' ? <PreviewView session={session} /> : null}
      {session.celebration ? <Celebration session={session} /> : null}
    </div>
  );
}

function PathView({ session, variant }: { session: CourseSession; variant: StaircaseVariant }) {
  const zh = session.zh;
  const level = session.level();
  const nodes = session.pathNodes();
  const freshMilestone =
    session.celebration && !session.celebration.replay ? session.celebration.unitId : null;
  const focusIndex = Math.max(
    0,
    nodes.findIndex(
      (node) =>
        node.kind === 'lesson' &&
        node.lesson &&
        (node.lesson.action === 'start' || node.lesson.action === 'continue'),
    ),
  );

  return (
    <div className="course-path">
      <BATabs
        className="course-level-tabs"
        selectedKey={session.levelId}
        onSelectionChange={(key) => session.switchLevel(key)}
      >
        <header className="course-path__bar course-path__header">
          <div className="course-path__header-title">
            <p className="course-kicker">{zh ? '写作路径' : 'Writing path'}</p>
            <h1 className="course-title" title={session.text(level.name)}>
              {zh ? '第 ' + level.id.slice(1) + ' 级' : 'Level ' + level.id.slice(1)}{' '}
              {session.text(level.name)}
            </h1>
          </div>
          <BATabList
            className="course-level-tablist"
            size={36}
            radius="full"
            emphasis="strong"
            distribution="hug"
            selectedKey={session.levelId}
            aria-label={zh ? '切换级别' : 'Choose level'}
            options={session.levelPath.levels.map((item) => ({
              id: item.id,
              label: item.id,
              accessibleLabel: session.text(item.name),
            }))}
          />
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
            <div className="path-orientation">
              <span>{zh ? '一步一步，写出你的想法。' : 'Small steps. Stronger writing.'}</span>
              <span>
                {zh ? '拖动或用方向键探索路径' : 'Drag or use arrow keys to explore your path'}{' '}
                <span aria-hidden="true">↗</span>
              </span>
            </div>
            <StaircaseScene
              key={level.id}
              variant={variant}
              locale={session.locale}
              count={nodes.length}
              focusIndex={focusIndex}
            >
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
                        <StairUnitCard
                          id={node.unit.id}
                          number={node.unit.index}
                          typeLabel={node.unit.typeLabel}
                          title={node.unit.title}
                          meta={node.unit.meta}
                          goals={node.unit.goals}
                          state={
                            session.unitDone(node.unit.id)
                              ? 'done'
                              : node.unit.id === 'G2-O'
                                ? 'current'
                                : 'locked'
                          }
                          locale={session.locale}
                        />
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
  const bar = session.topBar(),
    activity = session.activity(),
    footer = session.footer();
  useEffect(() => {
    const flush = () => session.flush();
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      session.flush();
    };
  }, [session]);
  if (!bar || !activity) return null;
  if (session.view === 'lessonEnd') return <LessonEnd session={session} />;
  const sc = session.currentScreen(),
    apply = sc.kind === 'apply',
    check = sc.kind === 'check';
  const task = session.currentTask();
  const a = apply ? session.applyState() : null;
  const hints = apply
    ? (task?.coach?.hints ?? []).slice(0, a?.hintLv ?? 0).map((h) => session.text(h))
    : activity.hints;
  const hintAction = apply
    ? (a?.hintLv ?? 0) < (task?.coach?.hints?.length ?? 0) && !a?.passed
    : activity.hintAction;
  const feedback =
    session.feedback || (!check && !apply && task ? session.practiceState().feedback : '') || '';
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
        activity={<LessonActivity session={session} />}
        coach={
          <div className="coach-content">
            <div className="coach-heading">
              <span className="coach-avatar">
                <BAIcon name="book" size={24} />
              </span>
              <div>
                <h2>Coach</h2>
                <span>{session.zh ? '和你一起，一步一步来' : 'One step at a time'}</span>
              </div>
              <Button
                className="coach-language"
                aria-label={session.zh ? 'Hide Chinese support' : 'Show Chinese support'}
                aria-pressed={session.zh}
                onPress={() => session.toggleLocale()}
              >
                中文
              </Button>
            </div>
            <div className="coach-teaching">
              {activity.coach.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {activity.coachMore ? (
              <BAButton variant="tertiary" onPress={() => session.showAnother()}>
                Show me another
              </BAButton>
            ) : null}
            {hints.map((hint, i) => (
              <p className="coach-hint" key={i}>
                <BAIcon name="info-circle" size={18} /> {hint}
              </p>
            ))}
            {hintAction ? (
              <BAButton variant="tertiary" onPress={() => (apply ? session.applyHint() : session.openHint())}>
                {apply
                  ? a?.hintLv
                    ? 'Another hint'
                    : 'Need a hint?'
                  : activity.hintAction === 'hint'
                    ? 'Need a hint?'
                    : activity.hintAction === 'another'
                      ? 'Another hint'
                      : 'Show me the answer'}
              </BAButton>
            ) : null}
            {feedback ? (
              <p className="course-feedback" role="status" data-testid="feedback">
                {feedback}
              </p>
            ) : null}
            {a?.result ? (
              <>
                <p className="course-feedback" role="status" data-testid="apply-feedback">
                  {session.zh ? a.result.zh : a.result.feedback}
                </p>
                {a.result.checks.filter((r) => !r.met)[1] ? (
                  <p className="coach-hint">Also: {a.result.checks.filter((r) => !r.met)[1].tip}</p>
                ) : null}
                {a.result.glow ? <p className="coach-glow">{a.result.glow}</p> : null}
              </>
            ) : null}
            <div className="coach-save">
              <BAIcon name="check" size={16} />{' '}
              {session.zh ? '进度自动保存' : 'Your progress saves automatically'}
            </div>
          </div>
        }
        navigation={
          <>
            <BAButton
              size={36}
              variant="secondary"
              locale={session.locale}
              onPress={() => session.pressBack()}
            >
              {footer.backLabel}
            </BAButton>
            <BAButton
              size={36}
              variant="primary"
              locale={session.locale}
              disabled={session.reading}
              onPress={() => session.pressPrimary()}
            >
              <span data-testid={footer.primaryTestId}>{footer.primaryLabel}</span>
            </BAButton>
          </>
        }
      />
    </div>
  );
}
function LessonEnd({ session: s }: { session: CourseSession }) {
  const passed = s.checkState().passed;
  return (
    <main
      id="course-main"
      className="lesson-end"
      data-testid="lesson-end"
      data-mastery={passed ? 'passed' : 'not-mastered'}
    >
      <p className="activity-eyebrow">
        LESSON <BANumber>1</BANumber> · TOPIC SENTENCES
      </p>
      <div className="lesson-end__mark">
        <BAIcon name={passed ? 'check' : 'book'} size={44} />
      </div>
      <h1>{passed ? 'You’ve got a strong start.' : 'A good place to pause.'}</h1>
      <p>
        You finished <BANumber>8</BANumber> of <BANumber>8</BANumber> activity screens.
      </p>
      <p className="lesson-end__mastery">
        {passed
          ? '✓ You passed the topic sentence check.'
          : 'Not mastered yet. We’ll practise topic sentences again together.'}
      </p>
      <div className="lesson-end__next">
        <span>
          UP NEXT · ABOUT <BANumber>{s.playUnit().lessons[1].min ?? 20}</BANumber> MIN
        </span>
        <h2>Reasons & closing</h2>
        <p>The next lesson is outside this eight-screen preview.</p>
      </div>
      <div className="lesson-end__actions">
        <BAButton variant="primary" onPress={() => s.continueNextLesson()}>
          Keep going
        </BAButton>
        <BAButton variant="secondary" onPress={() => s.endToPath()}>
          Back to my path
        </BAButton>
        <BAButton variant="secondary" onPress={() => s.endToPath(true)}>
          Stop for today
        </BAButton>
      </div>
      <BAButton variant="tertiary" onPress={() => s.pressBack()}>
        Review my check
      </BAButton>
    </main>
  );
}

function StoppedView({ session: s }: { session: CourseSession }) {
  return (
    <main id="course-main" className="lesson-end">
      <p className="activity-eyebrow">SAVED FOR TODAY</p>
      <h1>Your work is saved.</h1>
      <p>Your answers and progress are saved on this device.</p>
      <div className="lesson-end__actions">
        <BAButton variant="primary" onPress={() => s.backToPath()}>
          Back to my path
        </BAButton>
        <BAButton variant="secondary" onPress={() => s.continueNextLesson()}>
          Start Lesson 2
        </BAButton>
      </div>
    </main>
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
    <div
      className="course-celebration"
      role="dialog"
      aria-modal="false"
      aria-label={title}
      data-testid="celebration"
    >
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
