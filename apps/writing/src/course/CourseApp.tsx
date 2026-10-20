import { useEffect, useState, type CSSProperties } from 'react';
import { StaircaseScene, type StaircaseVariant } from './StaircaseScene';
import { useSyncExternalStore } from 'react';
import { BAButton, BATabs, BATabList, BATabPanel, localeTag } from '@big-academy/design-system';
import { LessonTopBar } from '../components/writing/LessonTopBar';
import { LessonWorkspace } from '../components/writing/LessonWorkspace';
import { StairLessonCard, type StairLessonState } from '../components/writing/StairLessonCard';
import { UnitMilestone } from '../components/writing/UnitMilestone';
import alexHtml from '../../source/alex-original.html?raw';
import { CourseSession } from '../product/courseSession';
import { LessonStage } from './LessonStage';
import { startLessonCelebration } from '../celebration/particleRuntime';
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
      {session.lessonBurst ? <LessonBurst session={session} /> : null}
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
            <p className="course-kicker">{zh ? '写作路径' : 'Writing path'}</p>
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
        <div className="course-ab-controls" role="group" aria-label={zh ? '路径形态 A/B' : 'Path shape A/B'}>
          <button type="button" className="course-ab-button" aria-pressed={variant === 'A'} onClick={() => onVariantChange('A')}>
            {zh ? 'A · 分立阶梯台面' : 'A · Separate platforms'}
          </button>
          <button type="button" className="course-ab-button" aria-pressed={variant === 'B'} onClick={() => onVariantChange('B')}>
            {zh ? 'B · 连续斜坡 + 锚点' : 'B · Continuous slope + anchors'}
          </button>
          <span className="course-ab-hint">{zh ? '探索方案，均未获得视觉批准' : 'Visual exploration only — not approved'}</span>
        </div>
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
                      <ul>
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
        <p className="course-candidate">
          {zh
            ? 'E-01 A/B 使用相同的卡片底边锚点算法、课程数据和权限；A 为分立台面，B 为连续斜坡与锚点。卡片内容增加时只向上生长。页面视觉仍待设计审核。'
            : 'E-01 A/B share the exact same bottom-anchor algorithm and Alex permissions. A has separated platforms; B has a continuous slope with local anchors. Card height grows upward, not into the anchor. Visual approval pending.'}
        </p>
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
        activity={<LessonStage session={session} activity={activity} />}
        coach={
          <div>
            {activity.coach.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {activity.hints.map((hint) => (
              <p key={hint} data-testid="hint">
                {hint}
              </p>
            ))}
            {activity.coachMore ? (
              <BAButton variant="ghost" locale={session.locale} onPress={() => session.showAnother()}>
                {session.zh ? '再看一个' : 'Show me another'}
              </BAButton>
            ) : null}
            {hintLabel ? (
              <BAButton variant="ghost" locale={session.locale} onPress={() => session.openHint()}>
                {hintLabel}
              </BAButton>
            ) : null}
            {activity.feedback ? (
              <p className="course-feedback" role="status" data-testid="feedback">
                {activity.feedback}
              </p>
            ) : null}
          </div>
        }
        navigation={
          <>
            <BAButton variant="secondary" locale={session.locale} onPress={() => session.pressBack()}>
              <span data-testid={footer.backTestId}>{footer.backLabel}</span>
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

function LessonBurst({ session }: { session: CourseSession }) {
  const reduced = window.matchMedia(REDUCED_MOTION).matches;
  useEffect(() => {
    if (reduced) return undefined;
    let cancel = false;
    let handle: { destroy: () => void } | undefined;
    const timer = window.setTimeout(() => handle?.destroy(), 15000);
    void startLessonCelebration('writing-lesson-complete').then((next) => {
      if (cancel) next.destroy();
      else handle = next;
    });
    return () => {
      cancel = true;
      window.clearTimeout(timer);
      handle?.destroy();
    };
  }, [reduced]);
  return (
    <div className="course-lesson-burst" role="status" data-testid="lesson-celebration" data-reduced={reduced ? 'true' : 'false'}>
      <p>
        {reduced
          ? session.zh
            ? '这一课完成了。减少动效时不播放彩带。'
            : 'Lesson complete. Ribbons stay off when motion is reduced.'
          : session.zh
            ? '这一课完成了。'
            : 'Lesson complete.'}
      </p>
      <BAButton variant="primary" locale={session.locale} onPress={() => session.dismissLessonBurst()}>
        {session.zh ? '好' : 'OK'}
      </BAButton>
    </div>
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
