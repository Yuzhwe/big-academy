import type { ReactNode, MouseEvent } from 'react';
import './WordChip.css';

/** Shared evaluation chrome for word pills (WordGrid + Tapword / Library). */
export type WordEvaluation = 'neutral' | 'correct' | 'correctUnselected' | 'incorrect' | 'hint' | 'shown';

export type WordChipKind = 'word' | 'punctuation' | 'emoji' | 'sentence';

export type WordChipProps = {
  children: ReactNode;
  selected?: boolean;
  used?: boolean;
  disabled?: boolean;
  /** One-shot shake: ±5px translate + rotate(±2deg). */
  shake?: boolean;
  evaluation?: WordEvaluation;
  onClick?: () => void;
  className?: string;
  /** WordGrid sentence / punctuation / emoji layout hints. */
  kind?: WordChipKind;
  lang?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  /** Preserve caret in Writing editors that host WordGrid. */
  preventMouseDownDefault?: boolean;
  tabIndex?: number;
  'aria-hidden'?: boolean | 'true' | 'false';
};

function selectionAttr(selected?: boolean, used?: boolean): 'selected' | 'used' | 'default' {
  if (selected) return 'selected';
  if (used) return 'used';
  return 'default';
}

export function WordChip({
  children,
  selected = false,
  used = false,
  disabled = false,
  shake = false,
  evaluation,
  onClick,
  className,
  kind = 'word',
  lang,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  preventMouseDownDefault = true,
  tabIndex,
  'aria-hidden': ariaHidden,
}: WordChipProps) {
  const evalValue: WordEvaluation = evaluation ?? 'neutral';
  const selection = selectionAttr(selected, used);
  const classes = ['word-chip', shake ? 'shake' : '', className ?? ''].filter(Boolean).join(' ');

  const onMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    if (preventMouseDownDefault) event.preventDefault();
  };

  return (
    <button
      type="button"
      className={classes}
      lang={lang}
      disabled={disabled}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      data-kind={kind}
      data-selection={selection}
      data-selected={selected ? 'true' : undefined}
      data-used={used ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-evaluation={evalValue}
      data-hint={evalValue === 'hint' ? 'true' : undefined}
      data-shake={shake ? 'true' : undefined}
      onMouseDown={onMouseDown}
      onClick={() => {
        if (!disabled) onClick?.();
      }}
    >
      <span className="word-chip__text">{children}</span>
    </button>
  );
}
