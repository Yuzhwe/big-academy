import { useEffect, useRef, useState } from 'react';
import { BAButton, BANumber, BAText } from '@big-academy/design-system';
import { CelebrationController, type PreviewStatus } from './celebrationController';
import { presets, type PresetId } from './presets';
import './celebration-effects.css';

const copy = {
  en: {
    title: 'Celebration effects', intro: 'Choose an effect and see it in motion.',
    review: 'Preview only · Milestone integration follows review.', count: 'effects',
    choose: 'Choose an effect', play: 'Play again', stop: 'Stop',
    stage: 'Effect preview', empty: 'A little celebration, ready when you are.',
    backdrop: 'Preview background', paper: 'Paper', night: 'Night',
    reduced: 'Your device requests reduced motion. Animated previews are off.',
    ready: 'Ready to preview', loading: 'Loading effect…', playing: 'Preview is playing',
    stopped: 'Preview stopped', error: 'The effect could not load. Choose Play again to retry.',
    back: 'Back to Writing', language: '中文',
  },
  zh: {
    title: '庆祝效果预览', intro: '选择一种效果，看看它的实际表现。',
    review: '仅供预览 · 验收后再接入 Milestone。', count: '种效果',
    choose: '选择效果', play: '重播效果', stop: '停止',
    stage: '效果预览区域', empty: '选好效果，开始一场小小的庆祝。',
    backdrop: '预览背景', paper: '白纸', night: '夜色',
    reduced: '系统已开启“减少动态效果”，动画预览已关闭。',
    ready: '准备就绪', loading: '正在加载效果…', playing: '正在播放预览',
    stopped: '预览已停止', error: '效果加载失败，请点击“重播效果”重试。',
    back: '返回 Writing', language: 'English',
  },
};

export default function CelebrationEffectsDemo() {
  const locale = new URLSearchParams(window.location.search).get('locale') === 'zh' ? 'zh' : 'en';
  const t = copy[locale];
  const [selected, setSelected] = useState<PresetId>('ribbons');
  const [status, setStatus] = useState<PreviewStatus>('ready');
  const [reduced, setReduced] = useState(false);
  const [background, setBackground] = useState('paper');
  const controller = useRef<CelebrationController | null>(null);
  const preset = presets.find(item => item.id === selected)!;

  useEffect(() => {
    const instance = new CelebrationController(setStatus);
    controller.current = instance;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const motionChange = () => { setReduced(media.matches); instance.stop(media.matches ? 'reduced' : 'ready'); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') instance.stop(); };
    const hidden = () => { if (document.hidden) instance.stop(); };
    const pageHide = () => instance.stop();
    media.addEventListener('change', motionChange);
    window.addEventListener('keydown', escape);
    window.addEventListener('pagehide', pageHide);
    document.addEventListener('visibilitychange', hidden);
    const oldTitle = document.title;
    document.title = `${t.title} · Writing`;
    return () => {
      instance.dispose();
      controller.current = null;
      media.removeEventListener('change', motionChange);
      window.removeEventListener('keydown', escape);
      window.removeEventListener('pagehide', pageHide);
      document.removeEventListener('visibilitychange', hidden);
      document.title = oldTitle;
    };
  }, [t.title]);

  const select = (id: PresetId) => {
    setSelected(id);
    setBackground(['fire', 'firefly', 'fireworks'].includes(id) ? 'night' : 'paper');
    void controller.current?.play(id);
  };

  return <main className="writing-celebration" data-ba-product="writing" lang={locale === 'zh' ? 'zh-CN' : 'en'}>
    <nav className="writing-celebration__nav" aria-label={locale === 'zh' ? '预览导航' : 'Preview navigation'}>
      <a href={`/?locale=${locale}`}>{t.back}</a>
      <a href={`/?demo=celebration-effects&locale=${locale === 'zh' ? 'en' : 'zh'}`}>{t.language}</a>
    </nav>
    <header className="writing-celebration__header">
      <div><BAText as="h1" textRole="display">{t.title}</BAText><BAText as="p">{t.intro}</BAText></div>
      <p className="writing-celebration__review"><BANumber>{presets.length}</BANumber> {t.count}<br />{t.review}</p>
    </header>
    <div className="writing-celebration__layout">
      <section className="writing-celebration__preview" aria-label={t.stage}>
        <div className="writing-celebration__toolbar">
          <div className="writing-celebration__actions">
            <BAButton variant="primary" radius="standard" onPress={() => { void controller.current?.play(selected); }} disabled={reduced}>{t.play}</BAButton>
            <BAButton variant="secondary" radius="standard" onPress={() => controller.current?.stop()} disabled={status !== 'loading' && status !== 'playing'}>{t.stop}</BAButton>
          </div>
          <label className="writing-celebration__background">{t.backdrop}<select value={background} onChange={event => setBackground(event.target.value)}><option value="paper">{t.paper}</option><option value="night">{t.night}</option></select></label>
        </div>
        <div className="writing-celebration__stage" data-background={background}>
          <BAText as="h2" textRole="heading">{locale === 'zh' ? preset.zh : preset.name}</BAText>
          <BAText as="p">{locale === 'zh' ? preset.descriptionZh : preset.description}</BAText>
          {status === 'ready' && <BAText as="p" textRole="supporting">{t.empty}</BAText>}
        </div>
        <div className="writing-celebration__feedback">
          <p role={status === 'error' ? 'alert' : 'status'} data-preview-status={reduced ? 'reduced' : status}>{reduced ? t.reduced : t[status]}</p>
          <p>{locale === 'zh' ? <>每次预览最多播放 <BANumber>15</BANumber> 秒，也可按 Esc 提前停止。</> : <>Previews stop after <BANumber>15</BANumber> seconds. Press Esc to stop sooner.</>}</p>
        </div>
      </section>
      <fieldset className="writing-celebration__choices"><legend>{t.choose}</legend>
        {presets.map(item => <label className="writing-celebration__choice" key={item.id}>
          <input type="radio" name="celebration-effect" value={item.id} checked={selected === item.id} onChange={() => select(item.id)} />
          <span>{locale === 'zh' ? item.zh : item.name}</span>
        </label>)}
      </fieldset>
    </div>
    <footer className="writing-celebration__attribution"><a href="/licenses/tsparticles-MIT.txt">tsParticles · MIT</a></footer>
  </main>;
}
