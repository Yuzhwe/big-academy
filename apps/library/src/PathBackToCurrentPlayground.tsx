import { useEffect, useMemo, useRef, useState } from 'react';
import { BAButton, BAIcon } from '@big-academy/design-system';
import { SolarLessonPreview, SOLAR_DEFAULTS } from './SolarLessonPreview';
import type { Scene } from './catalog';
import './PathBackToCurrentPlayground.css';

type ViewMode = 'auto' | 'off' | 'in';

function label(locale: Scene['locale'], zh: string, en: string) {
  return locale === 'zh' ? zh : en;
}

export function PathBackToCurrentPlayground({ scene, update }: {
  scene: Scene;
  update?: (patch: Partial<Scene>) => void;
}) {
  const viewMode = scene.pathCurrentView;
  const forceFallback = scene.pathSolarFallback || scene.motion === 'reduce';
  const [autoOffscreen, setAutoOffscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const currentRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = viewMode === 'off' ? true : viewMode === 'in' ? false : autoOffscreen;

  useEffect(() => {
    if (viewMode !== 'auto') return;
    const current = currentRef.current;
    const root = scrollRef.current;
    if (!current || !root || typeof IntersectionObserver === 'undefined') {
      setAutoOffscreen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        // Fully off-screen ⇒ show; any intersection with the scrollport ⇒ hide.
        setAutoOffscreen(!entry?.isIntersecting);
      },
      { root, threshold: [0, 0.01, 1] },
    );
    io.observe(current);
    return () => io.disconnect();
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== 'auto') return;
    const scroller = scrollRef.current;
    if (!scroller) return;
    // Start with Current in view so the button begins hidden.
    scroller.scrollLeft = 0;
  }, [viewMode]);

  const solarParams = useMemo(() => ({
    rayIntensity: scene.solarRayIntensity,
    rayLength: scene.solarRayLength,
    rayCount: scene.solarRayCount,
    bokeh: scene.solarBokeh,
    rimBoost: scene.solarRimBoost,
    glowSpread: scene.solarGlowSpread,
    brightness: scene.solarBrightness,
    borderColor: scene.solarBorderColor,
    glowColor: scene.solarGlowColor,
  }), [scene]);

  const setView = (pathCurrentView: ViewMode) => update?.({ pathCurrentView });
  const setFallback = (pathSolarFallback: boolean) => update?.({ pathSolarFallback });

  const scrollCurrentIntoView = () => {
    currentRef.current?.scrollIntoView({ behavior: scene.motion === 'reduce' ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    setNotice(label(scene.locale, '标本：已滚动到 Current（mock center）', 'Specimen: scrolled Current into view (mock center)'));
  };
  const scrollCurrentAway = () => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: scroller.scrollWidth, behavior: scene.motion === 'reduce' ? 'auto' : 'smooth' });
    setNotice(label(scene.locale, '标本：Current 已滚出视口', 'Specimen: Current scrolled fully off-screen'));
  };

  const onBackPress = () => {
    scrollCurrentIntoView();
  };

  return (
    <div className="preview-example preview-example--center path-back-specimen" data-testid="path-back-preview">
      <div className="path-back-stage" ref={stageRef} data-testid="path-back-stage">
        <div className="path-back-stage__scroll" ref={scrollRef} data-testid="path-back-scroll">
          <div className="path-back-stage__track">
            <article className="path-back-card" data-current="true" ref={currentRef} data-testid="path-back-current-card">
              <strong>{label(scene.locale, 'Current · 当前课', 'Current lesson')}</strong>
              <span>{label(scene.locale, '滚出视口以显示按钮', 'Scroll away to reveal the button')}</span>
            </article>
            <article className="path-back-card" aria-hidden="true">
              <strong>{label(scene.locale, '下一课', 'Next lesson')}</strong>
              <span>2</span>
            </article>
            <article className="path-back-card" aria-hidden="true">
              <strong>{label(scene.locale, '更远的课', 'Farther lesson')}</strong>
              <span>3</span>
            </article>
            <article className="path-back-card" aria-hidden="true">
              <strong>{label(scene.locale, '远端课', 'Distant lesson')}</strong>
              <span>4</span>
            </article>
          </div>
        </div>

        <nav
          className="path-controls path-controls--specimen"
          aria-label={label(scene.locale, '浏览学习路径', 'Browse learning path')}
          data-testid="path-back-controls"
        >
          <BAButton
            iconOnly
            size={50}
            variant="secondary"
            aria-label={label(scene.locale, '上一个台阶', 'Previous step')}
            onPress={() => {
              const scroller = scrollRef.current;
              if (!scroller) return;
              scroller.scrollBy({ left: -180, behavior: scene.motion === 'reduce' ? 'auto' : 'smooth' });
            }}
          >
            <BAIcon name="arrow-left" />
          </BAButton>

          <div
            className="path-back-slot"
            data-visible={visible ? 'true' : 'false'}
            data-testid="path-back-slot"
            aria-hidden={!visible}
          >
            <SolarLessonPreview
              fit="control"
              hybridControlGlow
              forceFallback={forceFallback}
              motionEnabled={scene.motion === 'system' && !forceFallback}
              params={solarParams}
            >
              <span data-solar-target className="path-back-to-current">
                <BAButton
                  size={50}
                  variant="secondary"
                  locale={scene.locale}
                  aria-label={label(scene.locale, '回到当前', 'Back to current')}
                  dataAttributes={{ 'data-testid': 'path-back-button' }}
                  onPress={onBackPress}
                >
                  {label(scene.locale, '回到当前', 'Back to current')}
                </BAButton>
              </span>
            </SolarLessonPreview>
          </div>

          <BAButton
            iconOnly
            size={50}
            variant="secondary"
            aria-label={label(scene.locale, '下一个台阶', 'Next step')}
            onPress={() => {
              const scroller = scrollRef.current;
              if (!scroller) return;
              scroller.scrollBy({ left: 180, behavior: scene.motion === 'reduce' ? 'auto' : 'smooth' });
            }}
          >
            <BAIcon name="arrow-left" style={{ transform: 'rotate(180deg)' }} />
          </BAButton>
        </nav>
      </div>

      <div className="path-back-status" data-testid="path-back-status">
        <span>{label(scene.locale, '按钮', 'Button')}: <code>{visible ? 'shown' : 'hidden'}</code></span>
        <span>Solar: <code>{forceFallback ? 'fallback' : 'auto/WebGL'}</code></span>
        <span>View: <code>{viewMode}</code></span>
      </div>

      <div className="path-back-actions" aria-label={label(scene.locale, '标本演示控制', 'Specimen demo controls')}>
        <button type="button" aria-pressed={viewMode === 'auto'} onClick={() => setView('auto')}>
          {label(scene.locale, '自动 · 视口检测', 'Auto · viewport')}
        </button>
        <button type="button" aria-pressed={viewMode === 'off'} onClick={() => setView('off')} data-testid="path-back-force-off">
          {label(scene.locale, '强制：Current 离屏（显示）', 'Force: Current off-screen (show)')}
        </button>
        <button type="button" aria-pressed={viewMode === 'in'} onClick={() => setView('in')} data-testid="path-back-force-in">
          {label(scene.locale, '强制：Current 在视口（隐藏）', 'Force: Current in view (hide)')}
        </button>
        <button type="button" onClick={scrollCurrentAway} data-testid="path-back-scroll-away">
          {label(scene.locale, '滚走 Current', 'Scroll Current away')}
        </button>
        <button type="button" onClick={scrollCurrentIntoView} data-testid="path-back-scroll-in">
          {label(scene.locale, '滚回 Current', 'Scroll Current in')}
        </button>
        <button
          type="button"
          aria-pressed={scene.pathSolarFallback}
          onClick={() => setFallback(!scene.pathSolarFallback)}
          data-testid="path-back-toggle-fallback"
        >
          {label(scene.locale, '切换 Solar 描边回退', 'Toggle Solar stroke fallback')}
        </button>
      </div>

      <p className="path-back-caption">
        {label(
          scene.locale,
          'Library 标本：中间「回到当前」高 50，夹在左右箭头之间。Current 完全离屏才显示，带回视口后隐藏；轻量 scale+fade。Solar 优先复用 WebGL（同课卡 Current），低性能/减少动态/强制回退 = 描边边框。点击仅 mock 居中，不改 Writing StaircaseScene。',
          'Library specimen: 「Back to current」 sits between L/R arrows at height 50. Shows only when Current is fully off-screen; hides when back in view, with a light scale+fade. Solar prefers the same WebGL wrap as lesson-card Current; low-perf / reduced motion / forced fallback = stroke border. Click mock-centers only — Writing StaircaseScene is untouched.',
        )}
      </p>
      <p className="path-back-notice" data-testid="path-back-notice" aria-live="polite">{notice}</p>
      <p className="review04-caption">
        Solar defaults: ray {SOLAR_DEFAULTS.rayIntensity} / border {scene.solarBorderColor}. Lesson-card Current glow path unchanged (fit=&quot;card&quot;).
      </p>
    </div>
  );
}
