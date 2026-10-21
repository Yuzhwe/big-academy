import { tsParticles, type Container, type ISourceOptions } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { loadConfettiPreset } from '@tsparticles/preset-confetti';
import { loadConfettiCannonPreset } from '@tsparticles/preset-confetti-cannon';
import { loadConfettiExplosionsPreset } from '@tsparticles/preset-confetti-explosions';
import { loadConfettiFallingPreset } from '@tsparticles/preset-confetti-falling';
import { loadConfettiParadePreset } from '@tsparticles/preset-confetti-parade';
import { loadPartyPreset } from '@tsparticles/preset-party';
import { loadFirePreset } from '@tsparticles/preset-fire';
import { loadFireflyPreset } from '@tsparticles/preset-firefly';
import { loadFireworksPreset } from '@tsparticles/preset-fireworks';
import { ribbons } from '@tsparticles/ribbons';
import { RIBBON_COLORS, type PresetId } from './presets';

let enginePromise: Promise<void> | undefined;
const runtimePresets: Record<Exclude<PresetId, 'ribbons'>, string> = {
  confetti: 'confetti', cannon: 'confettiCannon', explosions: 'confettiExplosions',
  falling: 'confettiFalling', parade: 'confettiParade', party: 'party',
  fire: 'fire', firefly: 'firefly', fireworks: 'fireworks',
};

function prepareEngine() {
  enginePromise ??= Promise.all([
    loadSlim, loadConfettiPreset, loadConfettiCannonPreset, loadConfettiExplosionsPreset,
    loadConfettiFallingPreset, loadConfettiParadePreset, loadPartyPreset, loadFirePreset,
    loadFireflyPreset, loadFireworksPreset,
    // v4 locks plugin registration after its first load. Register Ribbons here,
    // so it also works when the reviewer plays another preset first.
    () => ribbons.init(),
  ].map(load => load(tsParticles))).then(() => undefined).catch(error => {
    enginePromise = undefined;
    throw error;
  });
  return enginePromise;
}

export async function startEffect(preset: PresetId, id: string): Promise<Container> {
  await prepareEngine();
  let container: Container | undefined;
  if (preset === 'ribbons') {
    container = await ribbons(id, { count: 30, colors: RIBBON_COLORS, disableForReducedMotion: true, zIndex: 10 });
  } else {
    const options: ISourceOptions = {
      preset: runtimePresets[preset], fullScreen: { enable: true, zIndex: 10 },
      fpsLimit: 60, background: { color: { value: 'transparent' } },
      // Keep the original pointer interactions without intercepting page controls.
      interactivity: { detectsOn: 'window' },
      motion: { disable: true },
    };
    if (preset === 'fireworks') options.sounds = { enable: false };
    container = await tsParticles.load({ id, options });
  }
  if (!container) throw new Error('The particle runtime did not create a preview.');
  decorateCanvas(container);
  return container;
}

/**
 * PRODUCT §17 full-lesson success: Ribbons count 30 and three explosion bursts.
 * Burst length and particle quantity stay on the existing explosions preset.
 * Composition intensity and duration are still waiting on visual review.
 */
export async function startLessonSuccess(id: string): Promise<{ destroy: () => void }> {
  await prepareEngine();
  const ribbon = await ribbons(`${id}-ribbons`, {
    count: 30,
    colors: RIBBON_COLORS,
    disableForReducedMotion: true,
    zIndex: 15,
  });
  const explosions = await tsParticles.load({
    id: `${id}-explosions`,
    options: {
      preset: 'confettiExplosions',
      fullScreen: { enable: true, zIndex: 15 },
      fpsLimit: 60,
      background: { color: { value: 'transparent' } },
      interactivity: { detectsOn: 'window' },
      motion: { disable: true },
      emitters: {
        name: 'confetti',
        size: { width: 0, height: 0 },
        rate: { delay: 0, quantity: 50 },
        life: { count: 3, duration: 0.1, delay: 0.4 },
      },
    },
  });
  if (!ribbon || !explosions) {
    ribbon?.destroy();
    explosions?.destroy();
    throw new Error('The lesson celebration did not start.');
  }
  decorateCanvas(ribbon);
  decorateCanvas(explosions);
  return {
    destroy() {
      ribbon.destroy();
      explosions.destroy();
    },
  };
}

function decorateCanvas(container: Container) {
  const canvas = container.canvas?.domElement;
  if (!canvas) return;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('data-celebration-canvas', '');
  canvas.style.pointerEvents = 'none';
}
