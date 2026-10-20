/** Source: Project 2, src/demos/celebration/particle-presets, tsParticles 4.4.0.
 * Effect colors are decorative source parameters, not new design-system tokens.
 */
export const presets = [
  { id: 'ribbons', name: 'Ribbons', zh: '彩带', description: 'Long, curling ribbons falling from above.', descriptionZh: '细长的弯曲彩带从上方飘落。' },
  { id: 'confetti', name: 'Confetti', zh: '彩纸', description: 'A light burst of scattered confetti.', descriptionZh: '一组轻盈的彩纸散落。' },
  { id: 'cannon', name: 'Confetti Cannon', zh: '彩纸礼炮', description: 'Drag and release across the preview to launch a confetti cannon.', descriptionZh: '在预览区域拖动后松开，发射彩纸礼炮。' },
  { id: 'explosions', name: 'Confetti Explosions', zh: '彩纸爆炸', description: 'Multiple bursts of celebratory confetti.', descriptionZh: '多点绽放的庆祝彩纸。' },
  { id: 'falling', name: 'Confetti Falling', zh: '彩纸雨', description: 'A continuous shower of falling confetti.', descriptionZh: '持续从上方落下的彩纸。' },
  { id: 'parade', name: 'Confetti Parade', zh: '彩纸巡游', description: 'A stream of confetti across the screen.', descriptionZh: '横向穿过画面的彩纸队列。' },
  { id: 'party', name: 'Party', zh: '派对', description: 'A dense, energetic party celebration.', descriptionZh: '高密度、多方向的派对庆祝。' },
  { id: 'fire', name: 'Fire', zh: '火焰', description: 'Warm particles rising like a flame.', descriptionZh: '像火焰一样向上升腾的暖色粒子。' },
  { id: 'firefly', name: 'Firefly', zh: '萤火', description: 'Move across the preview to leave a trail of fireflies.', descriptionZh: '在预览区域移动指针，留下萤火轨迹。' },
  { id: 'fireworks', name: 'Fireworks', zh: '烟花', description: 'Fireworks blooming in the air, with sound off.', descriptionZh: '多束烟花在空中绽放，声音已关闭。' },
] as const;

export type PresetId = typeof presets[number]['id'];
export const PREVIEW_DURATION_MS = 15000;
export const RIBBON_COLORS = ['#ff5e7e', '#ffbd2e', '#56c7ff', '#8f78ff', '#58d68d'];
