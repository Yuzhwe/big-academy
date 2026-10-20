import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { StaircaseScene, type StaircaseVariant } from './StaircaseScene';
import { useSyncExternalStore } from 'react';
import { Checkbox, Radio, RadioGroup } from 'react-aria-components';
import { BAButton, BATabs, BATabList, BATabPanel, localeTag } from '@big-academy/design-system';
import { LessonTopBar } from '../components/writing/LessonTopBar';
import { LessonWorkspace } from '../components/writing/LessonWorkspace';
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

function Prompt({ activity }: { activity: ActivityModel }) {
  const heading = activity.englishLine || activity.ask || activity.title;
  return (
    <>
      <h1 className="course-title">{heading}</h1>
      {activity.chineseLine ? (
        <p className="course-zh-line" lang="zh-CN">
          {activity.chineseLine}
        </p>
      ) : null}
    </>
  );
}

function ChoiceList({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  const pick = activity.pick;
  if (!pick) return null;
  const choices = pick.options.map((option) => (
    <span className="course-choice__body" key={option.index}>
      <span className="course-choice__letter">{option.letter}</span>
      <span className="course-choice__text">{option.text}</span>
      {option.stateLabel ? <span className="course-choice__state">{option.stateLabel}</span> : null}
    </span>
  ));
  if (pick.multi) {
    return (
      <div className="course-choices" role="group" aria-label={activity.ask || activity.title}>
        {pick.options.map((option, index) => (
          <Checkbox
            key={option.index}
            className="course-choice"
            data-mark={option.mark}
            data-wrong={option.wrong ? 'true' : undefined}
            isSelected={option.selected}
            isDisabled={pick.closed}
            onChange={() => session.pick(option.index)}
          >
            {choices[index]}
          </Checkbox>
        ))}
      </div>
    );
  }
  return (
    <RadioGroup
      className="course-choices"
      aria-label={activity.ask || activity.title}
      value={pick.options.find((option) => option.selected)?.index.toString() ?? ''}
      isDisabled={pick.closed}
      onChange={(value) => session.pick(Number(value))}
    >
      {pick.options.map((option) => (
        <Radio
          key={option.index}
          className="course-choice"
          data-mark={option.mark}
          data-wrong={option.wrong ? 'true' : undefined}
          value={String(option.index)}
        >
          <span className="course-choice__letter">{option.letter}</span>
          <span className="course-choice__text">{option.text}</span>
          {option.stateLabel ? <span className="course-choice__state">{option.stateLabel}</span> : null}
        </Radio>
      ))}
    </RadioGroup>
  );
}

function ActivityBody({ session, activity }: { session: CourseSession; activity: ActivityModel }) {
  return (
    <>
      {activity.learn ? (
        <>
          <h1 className="course-title">{activity.learn.heading || activity.englishLine || activity.title}</h1>
          {activity.chineseLine ? (
            <p className="course-zh-line" lang="zh-CN">
              {activity.chineseLine}
            </p>
          ) : null}
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
      {activity.pick ? (
        <>
          <Prompt activity={activity} />
          {activity.pick.hint ? <p>{activity.pick.hint}</p> : null}
          <ChoiceList session={session} activity={activity} />
        </>
      ) : null}
      {activity.tapword ? (
        <>
          <Prompt activity={activity} />
          <p className="course-words">
            {activity.tapword.words.map((word) => (
              <button
                key={word.index}
                type="button"
                className="course-word"
                data-mark={word.mark}
                data-selected={word.selected ? 'true' : undefined}
                data-wrong={word.wrong ? 'true' : undefined}
                disabled={word.mark === 'correct' || word.mark === 'revealed'}
                onClick={() => session.tapWord(word.index)}
              >
                {word.text}
                {word.stateLabel ? <span className="course-word__state">{word.stateLabel}</span> : null}
              </button>
            ))}
          </p>
        </>
      ) : null}
      {activity.build ? (
        <>
          <Prompt activity={activity} />
          <p className="course-build-line" data-testid="build-line">
            {activity.build.line || (session.zh ? '把词卡放到这里。' : 'Place the cards here.')}
          </p>
          {activity.build.revealed ? (
            <p data-testid="revealed-line">{activity.build.revealed}</p>
          ) : null}
          <div className="course-cards">
            {activity.build.cards.map((card, index) => (
              <button
                key={`${card.text}-${index}`}
                type="button"
                className="course-card"
                data-testid="word-card"
                data-used={card.used ? 'true' : undefined}
                data-pulse={card.pulse ? 'true' : undefined}
                data-shake={card.shake ? 'true' : undefined}
                disabled={card.used || activity.build?.closed}
                onClick={() => session.placeCard(card.text)}
              >
                {card.text}
              </button>
            ))}
          </div>
          {activity.build.closed ? null : (
            <BAButton variant="ghost" locale={session.locale} onPress={() => session.resetBuild()}>
              {session.zh ? '重新开始' : 'Start again'}
            </BAButton>
          )}
        </>
      ) : null}
      {activity.frame ? (
        <>
          <Prompt activity={activity} />
          <label className="course-field">
            <span>{activity.frame.frame}</span>
            <textarea
              data-testid="frame-draft"
              value={activity.frame.value}
              readOnly={activity.frame.closed}
              rows={3}
              onChange={(event) => session.setDraft(event.target.value)}
            />
          </label>
          {activity.frame.revealed ? <p data-testid="revealed-line">{activity.frame.revealed}</p> : null}
        </>
      ) : null}
      {activity.apply ? (
        <>
          <Prompt activity={activity} />
          {activity.apply.tip ? <p>{activity.apply.tip}</p> : null}
          <label className="course-field">
            <span>{session.zh ? '你的句子' : 'Your sentences'}</span>
            <textarea
              data-testid="apply-draft"
              value={activity.apply.value}
              readOnly={activity.apply.passed || activity.apply.movedOn}
              rows={6}
              onChange={(event) => session.setDraft(event.target.value)}
            />
          </label>
          {activity.apply.checks.length ? (
            <ul className="course-checks" data-testid="apply-checks">
              {activity.apply.checks.map((item) => (
                <li key={item.label} data-met={item.met ? 'true' : 'false'}>
                  {item.label}
                </li>
              ))}
            </ul>
          ) : null}
          {activity.apply.passed ? (
            <p data-testid="apply-passed">{session.zh ? '这次写作通过了。' : 'This writing passed.'}</p>
          ) : null}
          {activity.apply.movedOn ? (
            <p data-testid="apply-moved">{session.zh ? '先继续。这次没有通过印记。' : 'Moving on. No pass stamp.'}</p>
          ) : null}
          {activity.apply.canMoveOn ? (
            <BAButton variant="secondary" locale={session.locale} onPress={() => session.moveOnApply()}>
              <span data-testid="move-on">{session.zh ? '先继续' : 'Move on for now'}</span>
            </BAButton>
          ) : null}
        </>
      ) : null}
      {activity.writing && !activity.frame ? (
        <label className="course-field">
          <span>{activity.writing.prompt}</span>
          <textarea
            data-testid="writing-draft"
            value={activity.writing.value}
            readOnly={activity.writing.closed}
            rows={4}
            onChange={(event) => session.setDraft(event.target.value)}
          />
        </label>
      ) : null}
      {activity.check ? (
        <div className="course-check" data-stage={activity.check.stage}>
          {activity.check.stage !== 'results' ? null : <h1 className="course-title">{activity.title}</h1>}
          <p>{activity.check.note}</p>
          {activity.check.dots.length ? (
            <div className="course-dots" role="group" aria-label={session.zh ? '检查题目' : 'Check questions'}>
              {activity.check.dots.map((dot) => (
                <button
                  key={dot.index}
                  type="button"
                  className="course-dot"
                  aria-current={dot.current ? 'true' : undefined}
                  data-answered={dot.answered ? 'true' : 'false'}
                  onClick={() => session.gotoQuestion(dot.index)}
                >
                  {dot.index + 1}
                </button>
              ))}
            </div>
          ) : null}
          {activity.check.blankWarning ? (
            <p role="status" data-testid="blank-warning">
              {activity.check.blankWarning}
            </p>
          ) : null}
          {activity.check.scoreLine ? <p data-testid="check-score">{activity.check.scoreLine}</p> : null}
          {activity.check.rows?.map((row) => (
            <button key={row.index} type="button" className="course-result" data-correct={row.correct ? 'true' : 'false'} onClick={() => session.openResult(row.index)}>
              <span>{row.index + 1}. {row.ask}</span>
              <span>{row.correct ? (session.zh ? '对' : 'Right') : session.zh ? '再看' : 'Look again'}</span>
            </button>
          ))}
          {activity.check.canRetry ? (
            <BAButton variant="secondary" locale={session.locale} onPress={() => session.retryCheck()}>
              {session.zh ? '再做一套' : 'Try a new set'}
            </BAButton>
          ) : null}
        </div>
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
    </>
  );
}

function LessonView({ session }: { session: CourseSession }) {
  const bar = session.topBar();
  const activity = session.activity();
  const footer = session.footer();
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable);
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      const current = session.activity();
      if (!current?.pick || current.pick.closed) {
        if (event.key === 'Enter' && session.footer().primaryTestId === 'check') {
          event.preventDefault();
          session.pressPrimary();
        }
        return;
      }
      const letter = event.key.toUpperCase();
      let index = -1;
      if (/^[1-9]$/.test(event.key)) index = Number(event.key) - 1;
      else if (/^[A-I]$/.test(letter)) index = letter.charCodeAt(0) - 65;
      if (index >= 0 && index < current.pick.options.length) {
        event.preventDefault();
        session.pick(index);
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        session.pressPrimary();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session]);
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
  const screenId = session.view === 'lessonEnd' ? 'lesson-end' : session.screens[session.inspect().screen]?.screen.id;
  const endActions: ReactNode =
    session.view === 'lessonEnd' ? (
      <>
        <BAButton variant="secondary" locale={session.locale} onPress={() => session.backToPathFromBreak()}>
          {session.zh ? '回到我的路径' : 'Back to my path'}
        </BAButton>
        <BAButton variant="ghost" locale={session.locale} onPress={() => session.stopForToday()}>
          {session.zh ? '今天先停' : 'Stop for today'}
        </BAButton>
      </>
    ) : null;

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
          <article
            className="course-activity"
            data-template={activity.template}
            data-kind={activity.kind}
            data-screen={screenId}
            data-outcome={activity.lessonOutcome || undefined}
          >
            <ActivityBody session={session} activity={activity} />
          </article>
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
            {endActions}
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
