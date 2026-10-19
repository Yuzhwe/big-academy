import { useEffect, useState, type CSSProperties } from 'react';
import { StaircaseScene, type StaircaseVariant } from './StaircaseScene';
import { useSyncExternalStore } from 'react';
import { Checkbox, Radio, RadioGroup } from 'react-aria-components';
import { BAButton, localeTag } from '@big-academy/design-system';
import { HamburgerLayer } from '../components/writing/HamburgerLayer';
import { LessonTopBar } from '../components/writing/LessonTopBar';
import { LessonWorkspace } from '../components/writing/LessonWorkspace';
import { StairLessonCard, type StairLessonState } from '../components/writing/StairLessonCard';
import { UnitMilestone } from '../components/writing/UnitMilestone';
import { WordGrid } from '../components/writing/WordGrid';
import alexHtml from '../../source/alex-original.html?raw';
import { CourseSession } from '../product/courseSession';
import './course.css';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const TABLET_OVERLAY = '(max-width: 1112px)';

function useTabletOverlay() {
  const [tablet, setTablet] = useState(() =>
    typeof window.matchMedia === 'function' ? window.matchMedia(TABLET_OVERLAY).matches : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(TABLET_OVERLAY);
    const onChange = () => setTablet(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return tablet;
}

function cardState(courseState: string, action: string): StairLessonState {
  if (courseState === 'skipped') return 'skipped';
  if (action === 'start' || action === 'continue' || action === 'review' || action === 'locked') return action;
  return 'locked';
}

export function CourseApp({ session: provided }: { session?: CourseSession }) {
  const [session] = useState(() => provided ?? new CourseSession({ html: alexHtml, search: window.location.search }));
  const revision = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  // Visual A/B state is a review-only control, not saved to Alex's learning state.
  const [staircaseVariant, setStaircaseVariant] = useState<StaircaseVariant>('B');
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
    <div className="course-app" lang={localeTag(locale)} data-revision={revision} data-view={session.view} data-ab-variant={staircaseVariant}>
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
      <header className="course-path__bar">
        <div>
          <p className="course-kicker">{zh ? '写作路径' : 'Writing path'}</p>
          <h1 className="course-title">
            {zh ? `第 ${level.id.slice(1)} 级` : `Level ${level.id.slice(1)}`} {session.text(level.name)}
          </h1>
        </div>
        <BAButton variant="secondary" locale={session.locale} onPress={() => session.toggleLocale()}>
          {zh ? 'English' : '中文'}
        </BAButton>
      </header>
      <nav className="course-levels" aria-label={zh ? '级别' : 'Levels'}>
        {session.levelPath.levels.map((item) => (
          <BAButton
            key={item.id}
            variant={item.id === session.levelId ? 'primary' : 'secondary'}
            locale={session.locale}
            aria-label={session.text(item.name)}
            onPress={() => session.switchLevel(item.id)}
          >
            {item.id}
          </BAButton>
        ))}
      </nav>
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
        <div className="course-ab-controls" role="group" aria-label={zh ? '阶梯视觉方案' : 'Staircase visual variants'}>
          <button type="button" className="course-ab-button" aria-pressed={variant === 'A'} onClick={() => onVariantChange('A')}>
            {zh ? 'A · 立体台面 + 光柱' : 'A · Platform + light beam'}
          </button>
          <button type="button" className="course-ab-button" aria-pressed={variant === 'B'} onClick={() => onVariantChange('B')}>
            {zh ? 'B · 暖色框架 + 白色卡片' : 'B · Warm frame + white cards'}
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
            ? 'E-01 A/B 方案对比：两版共享相同的课程数据、斜向浏览和解锁逻辑。A 为历史立体视觉探索；B 为 Warm Frame 候选。均未视觉签核。'
            : 'E-01 visual A/B test: same Alex course data and diagonal navigation in both. A explores the historical platform/beam treatment; B explores Warm Frame. Neither is visually approved.'}
        </p>
      </main>
    </div>
  );
}

function LessonView({ session }: { session: CourseSession }) {
  const bar = session.topBar();
  const activity = session.activity();
  const footer = session.footer();
  const grid = session.gridView();
  const tablet = useTabletOverlay();
  const screenId = session.screens[session.inspect().screen]?.screen.id ?? '';
  const [gridOverlayOpen, setGridOverlayOpen] = useState(false);
  useEffect(() => {
    setGridOverlayOpen(false);
  }, [screenId]);
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
          <div className="course-sheet">
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
                {activity.learn.nextUp ? <p>{activity.learn.nextUp}</p> : null}
              </>
            ) : null}
            {activity.topics ? (
              <>
                <h1 className="course-title">{activity.ask}</h1>
                <RadioGroup
                  className="course-choices"
                  aria-label={activity.ask}
                  value={activity.topics.find((topic) => topic.selected)?.id ?? ''}
                  onChange={(value) => session.selectTopic(value)}
                >
                  {activity.topics.map((topic) => (
                    <Radio key={topic.id} className="course-choice" value={topic.id}>
                      <span className="course-choice__letter">{topic.letter}</span>
                      <span>
                        {topic.text}
                        {topic.note ? <span className="course-topic-note"> {topic.note}</span> : null}
                      </span>
                    </Radio>
                  ))}
                </RadioGroup>
              </>
            ) : null}
            {activity.layers ? (
              <div data-testid="burger">
                {activity.ask ? <h1 className="course-title">{activity.ask}</h1> : null}
                <div className="course-layers">
                  {activity.layers.map((layer) => (
                    <HamburgerLayer
                      key={layer.field}
                      layerId={layer.field}
                      label={layer.label}
                      value={layer.value}
                      editable={layer.editable}
                      part={layer.part}
                      placeholder={layer.placeholder}
                      caret={layer.caret}
                      locale={session.locale}
                      onChange={(value, caret) => session.setPlanField(layer.field, value, caret)}
                      onFocusField={(field, caret) => session.focusPlanField(field, caret)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            {activity.pick ? (
              <>
                <h1 className="course-title">{activity.ask}</h1>
                {activity.pick.hint ? <p>{activity.pick.hint}</p> : null}
                {activity.pick.multi ? (
                  <div className="course-choices" role="group" aria-label={activity.ask}>
                    {activity.pick.options.map((option) => (
                      <Checkbox
                        key={option.index}
                        className="course-choice"
                        data-wrong={option.wrong ? 'true' : undefined}
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
                      onClick={() => session.tapWord(word.index)}
                    >
                      {word.text}
                    </button>
                  ))}
                </p>
              </>
            ) : null}
            {!activity.supported && !activity.learn && !activity.layers && !activity.topics ? (
              <>
                <h1 className="course-title">{activity.ask || activity.title}</h1>
                <p className="course-message" data-testid="unsupported-template">
                  {activity.unsupportedReason}
                </p>
              </>
            ) : null}
            {!activity.supported && activity.layers ? (
              <p className="course-message" data-testid="unsupported-template">
                {activity.unsupportedReason}
              </p>
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
          {grid ? (
            <WordGrid
              groups={grid.groups}
              activeGroup={grid.activeGroup}
              presentation={tablet && grid.mode === 'expanded' ? 'overlay' : 'docked'}
              mode={grid.mode}
              open={gridOverlayOpen}
              locale={session.locale}
              messages={{
                locked: grid.lockedMessage,
                collapsed: grid.collapsedMessage,
                empty: grid.emptyMessage,
                open: grid.openLabel,
                fold: grid.foldLabel,
              }}
              onGroupChange={(key) => session.setGridTab(key)}
              onInsert={(word) => session.insertGridWord(word)}
              onOpenChange={(next) => {
                if (grid.mode === 'collapsed') {
                  if (next) session.toggleGrid();
                  return;
                }
                if (tablet && grid.mode === 'expanded') {
                  setGridOverlayOpen(next);
                  return;
                }
                if (!next) session.toggleGrid();
              }}
            />
          ) : null}
          </div>
        }
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
