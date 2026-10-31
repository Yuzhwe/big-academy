import {
  StartPoint,
  defaultStartPointText,
  START_POINT_LEVEL_COMBO_TILT_DEG,
  type StartPointLocale,
} from './StartPoint';
import { StairLevelIntroCard } from './StairLevelIntroCard';
import './StartPointLevelCombo.css';

export interface StartPointLevelComboProps {
  intro: string;
  /** Product Level title string (level.name); rendered on Level intro card. */
  title?: string;
  locale?: StartPointLocale;
  className?: string;
  /** Optional override; defaults to localized Start Point label. */
  startPointText?: string;
}

/**
 * BA-WR-015 × BA-WR-008 — Start Point over Level intro card.
 * Same assembly as Library `?component=level&composition=combo`.
 */
export function StartPointLevelCombo({
  intro,
  title,
  locale = 'en',
  className,
  startPointText,
}: StartPointLevelComboProps) {
  const label = startPointText ?? defaultStartPointText(locale);
  const tilt = START_POINT_LEVEL_COMBO_TILT_DEG;

  return (
    <div
      className={['start-point-level-combo', className].filter(Boolean).join(' ')}
      data-ba-product="writing"
      data-testid="start-point-level-combo"
      style={{ ['--sp-combo-tilt' as string]: `${tilt}deg` }}
    >
      <div className="start-point-level-combo__sp" data-tilt-deg={tilt}>
        <StartPoint locale={locale} text={label} />
      </div>
      <div className="start-point-level-combo__level">
        <StairLevelIntroCard locale={locale} title={title} intro={intro} />
      </div>
    </div>
  );
}
