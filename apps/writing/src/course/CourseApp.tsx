import { useEffect, useState, type CSSProperties } from 'react';
import { useSyncExternalStore } from 'react';
import { BAButton, BAChoice, BAIcon, BATabs, BATabList, BATabPanel, localeTag } from '@big-academy/design-system';
import { LessonTopBar } from '../components/writing/LessonTopBar';
import { LessonWorkspace } from '../components/writing/LessonWorkspace';
import { StairLessonCard, type StairLessonState } from '../components/writing/StairLessonCard';
import { UnitMilestone } from '../components/writing/UnitMilestone';
import { HamburgerLayer } from '../components/writing/HamburgerLayer';
import { WordGrid } from '../components/writing/WordGrid';
import { StaircaseScene } from './StaircaseScene';
import { unitFoldPaths } from './unitFold';
import alexHtml from '../../source/alex-original.html?raw';
import { CourseSession, type ActivityModel } from '../product/courseSession';
import './course.css';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION).matches;
}

function cardState(courseState: string, action: string): StairLessonState {
  if (courseState === 'skipped') return 'skipped';
  if (action === 'start' || action === 'continue' || action === 'review' || action === 'locked') return action;
  return 'locked';
}

export function CourseApp({ session: provided }: { session?: CourseSession }) {
  const [session] = useState(() => provided ?? new CourseSession({ html: alexHtml, search: window.location.search }));
  const revision = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const locale = session.locale;
  const zh = locale === 'zh';
  const gallery = new URLSearchParams(window.location.search).get('gallery') === 'choice';

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

  if (gallery) return <ChoiceGallery zh={zh} />;

  return (
    <div className="course-app" lang={localeTag(locale)} data-revision={revision} data-view={session.view} data-ba-product="writing">
      <a className="course-skip" href="#course-main">
        {zh ? '跳到主要内容' : 'Skip to content'}
      </a>
      {session.view === 'path' ? <PathView session={session} /> : null}
      {session.view === 'lesson' || session.view === 'lessonEnd' ? <LessonView session={session} /> : null}
      {session.view === 'preview' ? <PreviewView session={session} /> : null}
      {session.celebration ? <Celebration session={session} /> : null}
      {session.practiceBurst ? <PracticeBurst session={session} /> : null}
    </div>
  );
}

function UnitFold({ id }: { id: string }) {
  const face = `course-unit-fold-face-${id}`;
  const paths = unitFoldPaths();
  return (
    <svg className="course-unit__fold" viewBox="0 0 32 32" data-testid="unit-fold" aria-hidden="true">
      <defs>
        <linearGradient id={face} x1="32" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--ba-writing-unit-fold-face-light, #fffdf9)" />
          <stop offset="100%" stopColor="var(--ba-writing-unit-fold-face-dark, #e7d6c9)" />
        </linearGradient>
      </defs>
      <path className="course-unit__fold-under" d={paths.under} />
      <path
        className="course-unit__fold-edge"
        d={paths.edge}
        fill="none"
        stroke="var(--ba-writing-unit-paper-border, #dcc3ab)"
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
      />
      <path className="course-unit__fold-flap" d={paths.flap} fill={`url(#${face})`} />
    </svg>
  );
}

function PathView({ session }: { session: CourseSession }) {
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
        {session.stoppedForToday ? (
          <p className="course-message" role="status" data-testid="saved-on-device">
            {zh ? '进度保存在这台设备上。' : 'Your work is saved on this device.'}
          </p>
        ) : null}
        <StaircaseScene key={level.id} locale={session.locale} count={nodes.length} focusIndex={focusIndex}>
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
                    <UnitFold id={node.unit.id} />
                    <p className="course-kicker">
                      {zh ? `第 ${node.unit.index} 单元` : `Unit ${node.unit.index}`} · {node.unit.typeLabel}
                    </p>
                    <h2>{node.unit.title}</h2>
                    <p className="course-unit__meta">{node.unit.meta}</p>
                    {node.unit.goals.length ? (
                      <div className="course-unit__goals">
                        {node.unit.goals.map((goal) => (
                          <p key={goal} className="course-unit__goal">{goal}</p>
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
                    minutes={lesson.minutes}
                    state={cardState(lesson.courseState, lesson.action)}
                    detail={lesson.detail}
                    locale={session.locale}
                    onEnter={() => session.openLesson(lesson.unitId, lesson.number)}
                    onBlocked={() => session.openLesson(lesson.unitId, lesson.number)}
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
            ? 'E-01 使用 v2-terraces。天空是 135° 渐变。'
            : 'E-01 uses v2-terraces. The sky is the 135° gradient.'}
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
        activity={<ActivityBody session={session} activity={activity} />}
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
              <p className="course-feedback" role="status" data-testid="feedback" data-outcome={activity.feedbackTone}>
                {activity.feedback}
              </p>
            ) : null}
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
              <BAButton size={70} variant="primary" locale={session.locale} onPress={() => session.pressPrimary()}>
                <span data-testid={footer.primaryTestId}>{footer.primaryLabel}</span>
              </BAButton>
            </>
          ) : (
            <>
              <BAButton size={70} variant="secondary" locale={session.locale} disabled={footer.backDisabled} onPress={() => session.pressBack()}>
                {footer.backLabel}
              </BAButton>
              <BAButton size={70} variant="primary" locale={session.locale} onPress={() => session.pressPrimary()}>
                <span data-testid={footer.primaryTestId}>{footer.primaryLabel}</span>
              </BAButton>
            </>
          )
        }
      />
    </div>
  );
}

function ActivityBody({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const pickLocked =
    !!activity.pick?.locked ||
    !!activity.pick?.options.some((option) => option.state === 'correct' || option.state === 'correctUnselected' || option.state === 'dim');
  return (
    <article className="course-activity" data-template={activity.template} data-kind={activity.kind}>
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
          <h1 className="course-title">{activity.learn.heading || activity.title}</h1>
          {activity.learn.teach ? <p className="course-teach">{activity.learn.teach}</p> : null}
          {activity.learn.weak || activity.learn.strong ? (
            <div className="course-examples">
              {activity.learn.weak ? (
                <p lang="en">
                  <span>{activity.learn.weakLabel}</span> {activity.learn.weak}
                </p>
              ) : null}
              {activity.learn.strong ? (
                <p className="course-examples__better" lang="en" data-testid="better-panel" data-cue="pedagogical">
                  <BAIcon name="check" />
                  <span>
                    <span>{activity.learn.strongLabel}</span> {activity.learn.strong}
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}
          {activity.learn.nextUp ? <p>{activity.learn.nextUp}</p> : null}
        </>
      ) : null}
      {activity.layers?.length ? (
        <div className="hamburger-stack" data-testid="hamburger">
          {activity.layers.map((layer) => (
            <HamburgerLayer key={layer.id} layerId={layer.id} label={layer.label} value={layer.value} emphasis={layer.emphasis} />
          ))}
        </div>
      ) : null}
      {activity.pick && activity.check?.phase !== 'results' ? (
        <>
          <h1 className="course-title">{activity.ask}</h1>
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
          <h1 className="course-title">{activity.ask}</h1>
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
          <h1 className="course-title">{activity.ask}</h1>
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
          <h1 className="course-title">{activity.ask}</h1>
          <p className="course-frame" lang="en" data-testid="frame">
            {activity.frame.parts.map((part, index) => (
              <span key={`${part}-${index}`}>
                {part}
                {index < activity.frame!.blanks.length ? (
                  <input
                    aria-label={activity.frame!.blanks[index].label || (session.zh ? `空 ${index + 1}` : `Blank ${index + 1}`)}
                    value={activity.frame!.blanks[index].value}
                    onFocus={() => session.focusBlank(index)}
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
          {activity.check ? null : <h1 className="course-title">{activity.ask}</h1>}
          <label className="course-canvas">
            <span>{activity.canvas.label}</span>
            <textarea
              lang="en"
              data-testid="writing-canvas"
              value={activity.canvas.text}
              readOnly={activity.check?.phase === 'graded'}
              onChange={(event) => session.setCanvas(event.target.value)}
            />
          </label>
          {activity.canvas.tip ? <p>{activity.canvas.tip}</p> : null}
        </>
      ) : null}
      {activity.wordGrid ? (
        <WordGrid
          groups={activity.wordGrid.groups.map(group => ({ ...group, words: group.words.map(word => ({ ...word, disabled: word.used })) }))}
          activeGroup={activity.wordGrid.active}
          locale={session.locale}
          onGroupChange={(key) => session.selectGrid(key)}
          onInsert={(word) => session.placeCard(word)}
        />
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

function PracticeBurst({ session }: { session: CourseSession }) {
  const reduced = prefersReducedMotion();
  const lesson = !!session.practiceBurst?.lesson;
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

function Celebration({ session }: { session: CourseSession }) {
  const reduced = prefersReducedMotion();
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

