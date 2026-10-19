import { useMemo, useState } from 'react';
import { LessonTopBar } from './components/writing/LessonTopBar';
import { getFixture } from './fixtures/topbarFixtures';
import type { BALocale } from '@big-academy/design-system';

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const fixture = params.get('fixture') ?? 'mixed';
  const locale: BALocale = params.get('locale') === 'zh' ? 'zh' : 'en';
  return { fixture, locale };
}

/**
 * Mock preview. Clicks record a UI event and do not change lesson progress.
 * `canOpen` comes from the fixture, not from Alex `Pages`.
 */
export function App() {
  const { fixture: fixtureId, locale } = readParams();
  const fixture = useMemo(() => getFixture(fixtureId, locale), [fixtureId, locale]);
  const [events, setEvents] = useState<string[]>([]);

  return (
    <div className="pilot-app">
      <LessonTopBar
        lessonTitle={fixture.lessonTitle}
        lessonNumber={fixture.lessonNumber}
        tasks={fixture.tasks}
        current={fixture.current}
        canOpen={fixture.canOpen}
        tags={fixture.tags}
        locale={fixture.locale}
        onBack={() => setEvents((prev) => ['back', ...prev])}
        onNavigate={(index) => setEvents((prev) => [`navigate:${index}`, ...prev])}
      />
      <main className="pilot-main">
        <p className="pilot-banner" role="note">
          Temporary foundation theme. Not visually approved. Task rows are a fixture, not Alex
          Pages.canOpen, Pages.done, or Skip.skipped. Back does not reset answers because this
          preview has no answer store.
        </p>
        <nav className="pilot-switcher" aria-label="Preview fixtures">
          <a href="?fixture=mixed&locale=en">EN mixed</a>
          <a href="?fixture=long&locale=en">EN long title</a>
          <a href="?fixture=long&locale=zh">中文长标题</a>
          <a href="?fixture=mixed&locale=zh">中文混合状态</a>
          <a href="?fixture=many&locale=en">EN 18 tasks</a>
          <a href="?fixture=many&locale=zh">中文 18 个任务</a>
        </nav>
        <p data-testid="event-log" aria-live="polite">
          {events.length === 0 ? 'No events yet.' : events.join(' · ')}
        </p>
      </main>
    </div>
  );
}
