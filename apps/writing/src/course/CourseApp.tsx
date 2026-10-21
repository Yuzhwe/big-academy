import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LandscapeBackdrop } from './LandscapeBackdrop';
import { StaircaseScene } from './StaircaseScene';
import { useSyncExternalStore } from 'react';
import { BAButton, BAChoice, BATabs, BATabList, BATabPanel, localeTag } from '@big-academy/design-system';
import { LessonTopBar } from '../components/writing/LessonTopBar';
import { LessonWorkspace } from '../components/writing/LessonWorkspace';
import { WordGrid } from '../components/writing/WordGrid';
import { StairLessonCard, type StairLessonState } from '../components/writing/StairLessonCard';
import { UnitMilestone } from '../components/writing/UnitMilestone';
import alexHtml from '../../source/alex-original.html?raw';
import { CourseSession, type ActivityModel } from '../product/courseSession';
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
  const locale = session.locale;
  const zh = locale === 'zh';

  useEffect(() => {
    document.documentElement.lang = localeTag(locale);
  }, [locale]);

  useEffect(() => {
    const flush = () => session.flush();
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
    };
  }, [session]);

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
    <div className="course-app" lang={localeTag(locale)} data-revision={revision} data-view={session.view} data-ba-product="writing">
      <a className="course-skip" href="#course-main">
        {zh ? '跳到主要内容' : 'Skip to content'}
      </a>
      {session.view === 'path' ? <PathView session={session} /> : null}
      {session.view === 'lesson' || session.view === 'lessonEnd' ? <LessonView session={session} /> : null}
      {session.view === 'preview' ? <PreviewView session={session} /> : null}
      {session.celebration ? <Celebration session={session} /> : null}
      {session.lessonCelebration ? <LessonCelebration session={session} /> : null}
    </div>
  );
}

function PathView({ session }: { session: CourseSession }) {
  const zh = session.zh;
  const [cameraX, setCameraX] = useState(0);
  const onCameraX = useCallback((x: number) => {
    setCameraX((prev) => (prev === x ? prev : x));
  }, []);
  const level = session.level();
  const nodes = session.pathNodes();
  const freshMilestone = session.celebration && !session.celebration.replay ? session.celebration.unitId : null;
  const focusIndex = Math.max(0, nodes.findIndex((node) => node.kind === 'lesson' && node.lesson && (node.lesson.action === 'start' || node.lesson.action === 'continue')));

  return (
    <div className="course-path" data-path="terraces">
      <LandscapeBackdrop cameraX={cameraX} />
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
        <div className="course-path__tools">
          <BAButton variant="secondary" onPress={() => session.openLayoutReview('L2-04.apply')}>
            {zh ? '第一阶段 · 应用写作词格' : 'Phase 1 · Apply word grid'}
          </BAButton>
          <p className="course-path__tools-note">
            {zh
              ? '版式预览，不解锁后面的屏幕，也不评分。'
              : 'Layout review only. It does not unlock later screens or grade the draft.'}
          </p>
        </div>
        <StaircaseScene key={level.id} locale={session.locale} count={nodes.length} focusIndex={focusIndex} onCameraX={onCameraX}>
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
                      <p data-example="weak" lang="en">
                        <span>{activity.learn.weakLabel}</span> {activity.learn.weak}
                      </p>
                    ) : null}
                    {activity.learn.strong ? (
                      <p data-example="strong" lang="en">
                        <span>{activity.learn.strongLabel}</span> {activity.learn.strong}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {activity.learn.nextUp ? <p>{activity.learn.nextUp}</p> : null}
              </>
            ) : null}
            {activity.check ? <CheckSurface session={session} check={activity.check} /> : null}
            {activity.pick ? <ChoiceBlock session={session} ask={activity.ask} pick={activity.pick} hint={activity.pick.hint} /> : null}
            {activity.apply ? <ApplySurface session={session} /> : null}
            {activity.build ? <BuildSurface session={session} ask={activity.ask} build={activity.build} /> : null}
            {activity.write ? <WriteSurface session={session} ask={activity.ask} write={activity.write} /> : null}
            {activity.tapword ? <TapBlock session={session} ask={activity.ask} tapword={activity.tapword} /> : null}
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
          <div className="course-coach">
            <div className="course-coach__locale">
              <BAButton variant="secondary" locale={session.locale} onPress={() => session.toggleLocale()}>
                {session.zh ? 'English' : '中文'}
              </BAButton>
            </div>
            {activity.coach.map((line) => (
              <p key={line} className="course-coach-card" data-tone="orientation">
                {line}
              </p>
            ))}
            {activity.hints.map((hint) => (
              <p key={hint} className="course-coach-card" data-tone="hint" data-testid="hint">
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
              <p className="course-coach-card" role="status" data-tone={activity.feedbackTone} data-testid="feedback">
                {activity.feedback}
              </p>
            ) : null}
          </div>
        }
        navigation={
          <>
            <BAButton
              variant="secondary"
              size={70}
              locale={session.locale}
              disabled={footer.previousDisabled}
              onPress={() => session.pressBack()}
            >
              {footer.backLabel}
            </BAButton>
            <BAButton variant="primary" size={70} locale={session.locale} onPress={() => session.pressPrimary()}>
              <span data-testid={footer.primaryTestId}>{footer.primaryLabel}</span>
            </BAButton>
          </>
        }
      />
    </div>
  );
}

function ChoiceBlock({
  session,
  ask,
  pick,
  hint,
}: {
  session: CourseSession;
  ask: string;
  pick: NonNullable<ActivityModel['pick']>;
  hint?: string;
}) {
  return (
    <>
      {ask ? <h1 className="course-title">{ask}</h1> : null}
      {hint ? <p>{hint}</p> : null}
      <BAChoice
        choiceMode={pick.multi ? 'multiple' : 'single'}
        aria-label={ask}
        locale={session.locale}
        disabled={pick.closed}
        selectedKeys={pick.options.filter((option) => option.selected).map((option) => String(option.index))}
        options={pick.options.map((option) => ({
          id: String(option.index),
          letter: option.letter,
          label: option.text,
          state: option.state,
        }))}
        onChange={(keys) => {
          if (pick.closed) return;
          if (pick.multi) {
            const next = new Set(keys);
            const current = new Set(pick.options.filter((option) => option.selected).map((option) => String(option.index)));
            for (const key of keys) if (!current.has(key)) session.pick(Number(key));
            for (const key of current) if (!next.has(key)) session.pick(Number(key));
            return;
          }
          if (keys[0] != null) session.pick(Number(keys[0]));
        }}
      />
    </>
  );
}

function TapBlock({
  session,
  ask,
  tapword,
}: {
  session: CourseSession;
  ask: string;
  tapword: NonNullable<ActivityModel['tapword']>;
}) {
  return (
    <>
      {ask ? <h1 className="course-title">{ask}</h1> : null}
      <p className="course-words" lang="en">
        {tapword.words.map((word) => (
          <button
            key={word.index}
            type="button"
            className="course-word"
            lang="en"
            data-selected={word.selected ? 'true' : undefined}
            data-wrong={word.wrong ? 'true' : undefined}
            onClick={() => session.tapWord(word.index)}
          >
            {word.text}
          </button>
        ))}
      </p>
    </>
  );
}

function CheckSurface({ session, check }: { session: CourseSession; check: NonNullable<ActivityModel['check']> }) {
  const zh = session.zh;
  return (
    <div data-testid="check-shell" data-stage={check.stage} data-mastery={check.mastered ? 'yes' : 'no'}>
      {check.stage !== 'results' ? (
        <p className="course-numeral" data-testid="question-numeral">
          {check.numeral}
        </p>
      ) : null}
      {check.dots.length ? (
        <div className="course-dots" role="group" aria-label={zh ? '题目' : 'Questions'}>
          {check.dots.map((dot) => (
            <button
              key={dot.index}
              type="button"
              className="course-dot"
              data-current={dot.index === check.index ? 'true' : undefined}
              data-answered={dot.answered ? 'true' : undefined}
              aria-current={dot.index === check.index ? 'true' : undefined}
              aria-label={String(dot.index + 1)}
              onClick={() => session.selectCheckQuestion(dot.index)}
            />
          ))}
        </div>
      ) : null}
      {check.note && check.stage === 'answering' ? <p className="course-tip">{check.note}</p> : null}
      {check.stage === 'results' ? (
        <>
          <p data-testid="check-result" data-mastery={check.mastered ? 'yes' : 'no'}>
            {check.summary}
          </p>
          <ol className="course-results">
            {check.rows.map((row) => (
              <li key={row.index}>
                <button type="button" data-testid="result-row" data-correct={row.correct ? 'true' : 'false'} onClick={() => session.openCheckResult(row.index)}>
                  <span>{row.index + 1}</span>
                  <span>{row.ask}</span>
                  <span data-testid="result-why">{row.detail}</span>
                </button>
              </li>
            ))}
          </ol>
          {check.retry && check.screenComplete ? (
            <BAButton variant="secondary" locale={session.locale} onPress={() => session.retryCheck()}>
              <span data-testid="retry-check-page">{zh ? '再做一组' : 'Try a new set'}</span>
            </BAButton>
          ) : null}
        </>
      ) : (
        <>
          {check.stage === 'graded' ? <p data-testid="graded-status">{check.summary}</p> : null}
          {check.pick ? <ChoiceBlock session={session} ask={check.prompt} pick={check.pick} /> : null}
          {check.tapword ? <TapBlock session={session} ask={check.prompt} tapword={check.tapword} /> : null}
          {check.draft != null ? (
            <label className="course-writing__label">
              <span className="visually-hidden">{zh ? '你的答案' : 'Your answer'}</span>
              <textarea
                data-testid="check-writing"
                lang="en"
                rows={4}
                readOnly={check.draftClosed}
                value={check.draft}
                onChange={(event) => session.setWritingText(event.target.value)}
              />
            </label>
          ) : null}
        </>
      )}
    </div>
  );
}

function BuildSurface({
  session,
  ask,
  build,
}: {
  session: CourseSession;
  ask: string;
  build: NonNullable<ActivityModel['build']>;
}) {
  const narrow = useNarrow();
  const [gridOpen, setGridOpen] = useState(true);
  const overlay = narrow && gridOpen;
  return (
    <>
      <h1 className="course-title">{ask}</h1>
      <p className="course-bench" lang="en" data-testid="build-bench">
        {build.bench}
      </p>
      {build.revealed ? (
        <p className="course-answer" lang="en" data-testid="revealed">
          {build.revealed}
        </p>
      ) : null}
      {!build.closed ? (
        <BAButton variant="ghost" locale={session.locale} onPress={() => session.restartBuild()}>
          {session.zh ? '重新开始' : 'Start again'}
        </BAButton>
      ) : null}
      <div className="course-writing" data-grid-presentation={overlay ? 'overlay' : 'docked'}>
        {narrow ? (
          <BAButton variant="secondary" locale={session.locale} onPress={() => setGridOpen((open) => !open)}>
            {gridOpen ? (session.zh ? '收起词格' : 'Hide word grid') : session.zh ? '词格' : 'Word grid'}
          </BAButton>
        ) : null}
        {!narrow || gridOpen ? (
          <WordGrid
            groups={build.groups}
            activeGroup={build.activeGroup}
            presentation={overlay ? 'overlay' : 'docked'}
            locale={session.locale}
            onGroupChange={(key) => session.setWordGroup(key)}
            onInsert={(word) => session.buildTap(word.text)}
          />
        ) : null}
      </div>
    </>
  );
}

function WriteSurface({
  session,
  ask,
  write,
}: {
  session: CourseSession;
  ask: string;
  write: NonNullable<ActivityModel['write']>;
}) {
  return (
    <>
      <h1 className="course-title">{ask}</h1>
      <DraftGrid
        session={session}
        draft={write.draft}
        groups={write.groups}
        activeGroup={write.activeGroup}
        testId="write-canvas"
        readOnly={write.closed}
      />
      {write.revealed ? (
        <p className="course-answer" data-testid="revealed">
          {write.revealed}
        </p>
      ) : null}
      {!write.closed ? (
        <BAButton variant="ghost" locale={session.locale} onPress={() => session.restartBuild()}>
          {session.zh ? '重新开始' : 'Start again'}
        </BAButton>
      ) : null}
    </>
  );
}

function useNarrow(query = '(max-width: 1024px)') {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const onChange = () => setNarrow(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return narrow;
}

function DraftGrid({
  session,
  draft,
  groups,
  activeGroup,
  testId,
  readOnly = false,
}: {
  session: CourseSession;
  draft: string;
  groups: NonNullable<ActivityModel['apply']>['groups'];
  activeGroup: string;
  testId: string;
  readOnly?: boolean;
}) {
  const narrow = useNarrow();
  const [gridOpen, setGridOpen] = useState(true);
  const field = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<{ start: number; end: number } | null>(null);
  const overlay = narrow && gridOpen;
  return (
    <div className="course-writing" data-grid-presentation={overlay ? 'overlay' : 'docked'}>
      <label className="course-writing__label">
        <span className="visually-hidden">{session.zh ? '你的写作' : 'Your writing'}</span>
        <textarea
          ref={field}
          data-testid={testId}
          lang="en"
          rows={6}
          readOnly={readOnly}
          value={draft}
          onChange={(event) => session.setWritingText(event.target.value)}
          onSelect={(event) => {
            const node = event.currentTarget;
            caret.current = { start: node.selectionStart ?? 0, end: node.selectionEnd ?? 0 };
          }}
        />
      </label>
      {narrow ? (
        <BAButton variant="secondary" locale={session.locale} onPress={() => setGridOpen((open) => !open)}>
          {gridOpen ? (session.zh ? '收起词格' : 'Hide word grid') : session.zh ? '词格' : 'Word grid'}
        </BAButton>
      ) : null}
      {!narrow || gridOpen ? (
        <WordGrid
          groups={groups}
          activeGroup={activeGroup}
          presentation={overlay ? 'overlay' : 'docked'}
          locale={session.locale}
          onGroupChange={(key) => session.setWordGroup(key)}
          onInsert={(word) => {
            if (readOnly) return;
            const element = field.current;
            const live = element && document.activeElement === element;
            const start = live ? element.selectionStart ?? draft.length : caret.current?.start ?? draft.length;
            const end = live ? element.selectionEnd ?? start : caret.current?.end ?? start;
            const next = session.insertWord(word.text, start, end);
            caret.current = { start: next, end: next };
            window.requestAnimationFrame(() => {
              const node = field.current;
              node?.focus();
              node?.setSelectionRange(next, next);
            });
          }}
        />
      ) : null}
    </div>
  );
}

function ApplySurface({ session }: { session: CourseSession }) {
  const activity = session.activity();
  const apply = activity?.apply;
  if (!activity || !apply) return null;
  return (
    <>
      {apply.lockedPreview ? (
        <p className="course-review-banner" data-testid="layout-review">
          {session.zh
            ? '版式预览 · 应用写作。前面的屏幕仍然锁定。检查不会评分，也不会解锁。'
            : 'Layout review · Apply. Earlier screens stay locked. Check does not grade or unlock.'}
        </p>
      ) : null}
      <p className="course-kicker">{activity.title}</p>
      <h1 className="course-title">{apply.ask}</h1>
      {apply.tip ? <p className="course-tip">{apply.tip}</p> : null}
      {apply.nudge ? (
        <p className="course-tip" data-testid="live-nudge" data-scoring="false">
          {apply.nudge}
        </p>
      ) : null}
      {apply.praise ? (
        <p className="course-tip" data-testid="live-praise" data-scoring="false">
          {apply.praise}
        </p>
      ) : null}
      <DraftGrid
        session={session}
        draft={apply.draft}
        groups={apply.groups}
        activeGroup={apply.activeGroup}
        testId="apply-canvas"
        readOnly={false}
      />
      {apply.checks.length ? (
        <ul className="course-checks" data-testid="apply-checks">
          {apply.checks.map((item) => (
            <li key={item.label} data-met={item.met ? 'true' : 'false'}>
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
      {apply.moveOn ? (
        <BAButton variant="ghost" locale={session.locale} onPress={() => session.moveOn()}>
          <span data-testid="move-on">{session.zh ? '暂时继续' : 'Move on for now'}</span>
        </BAButton>
      ) : null}
    </>
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

function LessonCelebration({ session }: { session: CourseSession }) {
  const event = session.lessonCelebration;
  const reduced = window.matchMedia(REDUCED_MOTION).matches;
  const [played, setPlayed] = useState(reduced);

  useEffect(() => {
    if (!event || reduced) return;
    const live = { cancelled: false, handle: undefined as { destroy: () => void } | undefined };
    void import('../celebration/particleRuntime')
      .then((runtime) => runtime.startLessonSuccess('writing-lesson-success'))
      .then((handle) => {
        live.handle = handle;
        if (live.cancelled) handle.destroy();
        else setPlayed(true);
      })
      .catch((error) => {
        console.warn('Lesson celebration did not start:', error);
      });
    return () => {
      live.cancelled = true;
      live.handle?.destroy();
    };
  }, [event, reduced]);

  if (!event) return null;
  return (
    <div
      className="course-celebration"
      role="dialog"
      aria-modal="false"
      aria-label={event.title}
      data-testid="lesson-celebration"
      data-effects={reduced ? 'static' : 'ribbons:30 explosions:3'}
      data-played={played ? 'true' : 'false'}
    >
      <div className="course-celebration__card">
        <p>{session.zh ? '这一课' : 'This lesson'}</p>
        <h2>{event.title}</h2>
        <p>
          {reduced
            ? session.zh
              ? '你通过了这一课。已减少动效，庆祝保持静止。进度没有改变。'
              : 'You passed this lesson. Motion is reduced, so the celebration stays still. Progress is unchanged.'
            : session.zh
              ? '你通过了这一课。彩带和三次绽放只是庆祝，不改变进度。'
              : 'You passed this lesson. Ribbons and three bursts are only a celebration. Progress is unchanged.'}
        </p>
        <BAButton variant="primary" locale={session.locale} onPress={() => session.settleLessonCelebration(played)}>
          {session.zh ? '好' : 'OK'}
        </BAButton>
      </div>
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
