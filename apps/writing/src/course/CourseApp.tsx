import { useEffect, useState, type CSSProperties } from 'react';
import { StaircaseScene } from './StaircaseScene';
import { staircaseThemeFromSearch } from './staircaseTheme';
import { useSyncExternalStore } from 'react';
import { BAButton, BATabs, BATabList, BATabPanel, localeTag } from '@big-academy/design-system';
import { LessonTopBar } from '../components/writing/LessonTopBar';
import { LessonWorkspace } from '../components/writing/LessonWorkspace';
import { StairLessonCard, type StairLessonLocation, type StairLessonState } from '../components/writing/StairLessonCard';
import { UnitMilestone } from '../components/writing/UnitMilestone';
import alexHtml from '../../source/alex-original.html?raw';
import { CourseSession } from '../product/courseSession';
import { CoachColumn, LessonStage } from './LessonStage';
import { LessonParticles } from './LessonParticles';
import './course.css';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function cardState(courseState: string, action: string): StairLessonState {
  if (courseState === 'skipped') return 'skipped';
  if (action === 'start' || action === 'continue' || action === 'review' || action === 'locked') return action;
  return 'locked';
}

function cardLocation(courseState: string): StairLessonLocation {
  if (courseState === 'current') return 'current';
  if (courseState === 'done') return 'completed';
  if (courseState === 'locked' || courseState === 'view') return 'locked';
  if (courseState === 'skipped') return 'skipped';
  return 'available';
}

export function CourseApp({ session: provided }: { session?: CourseSession }) {
  const [session] = useState(() => provided ?? new CourseSession({ html: alexHtml, search: window.location.search }));
  const revision = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
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
    <div className="course-app" lang={localeTag(locale)} data-revision={revision} data-view={session.view} data-ab-variant="A" data-ba-product="writing">
      <a className="course-skip" href="#course-main">
        {zh ? '跳到主要内容' : 'Skip to content'}
      </a>
      {session.view === 'path' ? <PathView session={session} /> : null}
      {session.view === 'lesson' || session.view === 'lessonEnd' ? <LessonView session={session} /> : null}
      {session.view === 'preview' ? <PreviewView session={session} /> : null}
      {session.celebration ? <Celebration session={session} /> : null}
      <LessonParticles session={session} />
    </div>
  );
}

function PathView({ session }: { session: CourseSession }) {
  const zh = session.zh;
  const staircaseTheme = staircaseThemeFromSearch(window.location.search);
  const level = session.level();
  const nodes = session.pathNodes();
  const freshMilestone = session.celebration && !session.celebration.replay ? session.celebration.unitId : null;
  const focusIndex = Math.max(0, nodes.findIndex((node) => node.kind === 'lesson' && node.lesson && (node.lesson.action === 'start' || node.lesson.action === 'continue')));

  return (
    <div className="course-path" data-staircase={staircaseTheme}>
      <BATabs className="course-level-tabs" selectedKey={session.levelId} onSelectionChange={(key) => session.switchLevel(key)}>
        <header className="course-path__bar course-path__header">
          <div className="course-path__header-title">
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
        <StaircaseScene key={level.id} variant="A" theme={staircaseTheme} locale={session.locale} count={nodes.length} focusIndex={focusIndex}>
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
                      <div className="course-goals">
                        {node.unit.goals.map((goal) => (
                          <p key={goal}>{goal}</p>
                        ))}
                      </div>
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
                    location={cardLocation(lesson.courseState)}
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
        activity={<LessonStage session={session} activity={activity} />}
        coach={<CoachColumn session={session} activity={activity} />}
        navigation={
          <>
            <BAButton variant="secondary" size={70} locale={session.locale} disabled={footer.previousDisabled} onPress={() => session.pressBack()}>
              {footer.backLabel}
            </BAButton>
            <BAButton variant="primary" size={70} locale={session.locale} disabled={footer.primaryDisabled} onPress={() => session.pressPrimary()}>
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
