import { PREVIEW_DURATION_MS, type PresetId } from './presets';

export type PreviewStatus = 'ready' | 'loading' | 'playing' | 'stopped' | 'reduced' | 'error';
export type EffectHandle = { destroy: () => void };
type EffectLoader = (preset: PresetId, id: string) => Promise<EffectHandle>;
let instanceSequence = 0;

/** Presentation lifecycle only. No course-session imports, storage or receipts.
 * Each instance owns its canvas; late async results are destroyed after Stop,
 * a newer selection, unmount or a reduced-motion preference change.
 */
export class CelebrationController {
  private sequence = 0;
  private disposed = false;
  private active?: EffectHandle;
  private timer?: ReturnType<typeof setTimeout>;
  private readonly idPrefix = `writing-celebration-demo-${++instanceSequence}`;

  constructor(
    private readonly publish: (status: PreviewStatus) => void,
    private readonly load: EffectLoader = async (preset, id) => (await import('./particleRuntime')).startEffect(preset, id),
    private readonly reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ) {}

  stop(status: PreviewStatus = 'stopped') {
    ++this.sequence;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.active?.destroy();
    this.active = undefined;
    if (!this.disposed) this.publish(status);
  }

  async play(preset: PresetId) {
    if (this.disposed) return;
    this.stop('ready');
    if (this.reducedMotion()) {
      this.publish('reduced');
      return;
    }
    const request = this.sequence;
    this.publish('loading');
    try {
      const handle = await this.load(preset, `${this.idPrefix}-${request}`);
      if (this.disposed || request !== this.sequence || this.reducedMotion()) {
        handle.destroy();
        if (!this.disposed && request === this.sequence) this.publish('reduced');
        return;
      }
      this.active = handle;
      this.publish('playing');
      this.timer = setTimeout(() => this.stop(), PREVIEW_DURATION_MS);
    } catch (error) {
      if (!this.disposed && request === this.sequence) {
        console.warn('Celebration preview failed to load:', error);
        this.publish('error');
      }
    }
  }

  dispose() {
    this.disposed = true;
    this.stop();
  }
}
