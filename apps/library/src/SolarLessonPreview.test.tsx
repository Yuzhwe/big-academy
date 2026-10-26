import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StairLessonCard } from '../../writing/src/components/writing/StairLessonCard';
import { SolarLessonPreview, SOLAR_DEFAULTS } from './SolarLessonPreview';
import { defaultScene, readScene, sceneSearch } from './catalog';

describe('Review 04 · library-only Current Solar trial', () => {
  it('keeps exact StairLessonCard children and CTA when motion is reduced', () => {
    const { container } = render(
      <SolarLessonPreview motionEnabled={false}>
        <StairLessonCard lessonId="trial" number={2} state="start"
          title="Topic sentences" minutes={10} current />
      </SolarLessonPreview>
    );
    const wrapper = container.querySelector('.solar-lesson-preview');
    expect(wrapper).toHaveAttribute('data-solar-status', 'fallback');
    expect(wrapper).toHaveAttribute('data-shine', 'off');
    expect(screen.getByRole('button', { name: 'Enter' })).toBeEnabled();
    expect(container.querySelector('.stair-lesson-card__seal')).toHaveTextContent('2');
    expect(container.querySelector('.stair-lesson-card__title')).toHaveTextContent('Topic sentences');
    expect(container.querySelector('.solar-border-canvas')).toHaveAttribute('aria-hidden', 'true');
  });

  it('retains the supplied Solar defaults in reproducible designer scene links', () => {
    const scene = readScene(sceneSearch({ ...defaultScene,
      component:'lesson', mode:'state', state:'current',
      solarRayIntensity:SOLAR_DEFAULTS.rayIntensity,
      solarRayLength:SOLAR_DEFAULTS.rayLength,
      solarRayCount:SOLAR_DEFAULTS.rayCount,
      solarBokeh:SOLAR_DEFAULTS.bokeh,
      solarRimBoost:SOLAR_DEFAULTS.rimBoost,
    }));
    expect(scene.state).toBe('current');
    expect(scene.solarRayIntensity).toBe(0.6);
    expect(scene.solarRayLength).toBe(0.45);
    expect(scene.solarRayCount).toBe(64);
    expect(scene.solarBokeh).toBe(0.16);
    expect(scene.solarRimBoost).toBe(1.66);
  });
});
