import { Checkbox, CheckboxGroup, Radio, RadioGroup } from 'react-aria-components';
import { BAIcon } from './BAIcon';
import './BAChoice.css';

/** Visible row state. The session decides when a row becomes correct, correctUnselected, wrong, or dim. */
export type ChoiceVisualState = 'default' | 'selected' | 'correct' | 'correctUnselected' | 'wrong' | 'dim' | 'disabled';

/** `shown` is the docs alias for `correctUnselected`. `idle` is the alias for `default`. `shown` is never selected. */
export type ChoiceStateInput = ChoiceVisualState | 'shown' | 'idle';

export function canonicalChoiceState(state: ChoiceStateInput | undefined): ChoiceVisualState | undefined {
  if (state == null) return undefined;
  if (state === 'shown') return 'correctUnselected';
  if (state === 'idle') return 'default';
  return state;
}

export interface ChoiceOption {
  id: string;
  letter: string;
  text: string;
  /**
   * Explicit chrome from the session after Check.
   * Omitted rows use selectedKeys: chosen = selected, otherwise default.
   */
  state?: ChoiceStateInput;
}

/** Accepted for the contract. The row does not paint this copy. */
export interface ChoiceFeedback {
  message?: string;
}

export interface BAChoiceProps {
  choiceMode: 'single' | 'multiple';
  options: ChoiceOption[];
  selectedKeys: string[];
  feedback?: ChoiceFeedback;
  onChange?: (keys: string[]) => void;
  disabled?: boolean;
  'aria-label': string;
}

const GRADED: ChoiceVisualState[] = ['wrong', 'correct', 'correctUnselected', 'dim', 'disabled'];

export function choiceVisual(option: ChoiceOption, selected: boolean, groupDisabled: boolean): ChoiceVisualState {
  const explicit = canonicalChoiceState(option.state);
  if (explicit && GRADED.includes(explicit)) return explicit;
  if (selected) return 'selected';
  if (groupDisabled && !explicit) return 'disabled';
  return explicit ?? 'default';
}

const STATE_NAME: Record<ChoiceVisualState, string> = {
  default: '',
  selected: 'selected',
  wrong: 'wrong',
  correct: 'correct',
  correctUnselected: 'correct unselected',
  dim: 'dimmed',
  disabled: 'unavailable',
};

function StatusIcon({ state }: { state: ChoiceVisualState }) {
  if (state === 'wrong') {
    return (
      <span className="ba-choice__glyph ba-choice__glyph--disk" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
          <path
            d="M6.76 17.24L12 12m0 0l5.24-5.24M12 12L6.76 6.76M12 12l5.24 5.24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (state === 'correct' || state === 'correctUnselected') {
    return (
      <span className={`ba-choice__glyph ba-choice__glyph--${state}`} aria-hidden="true">
        <BAIcon name="check" size={22} strokeWidth={2.4} />
      </span>
    );
  }
  return <span className={`ba-choice__glyph ba-choice__glyph--${state === 'selected' ? 'ring' : 'empty'}`} aria-hidden="true" />;
}

function OptionBody({ option, state }: { option: ChoiceOption; state: ChoiceVisualState }) {
  const spoken = STATE_NAME[state];
  return (
    <>
      <span className="ba-choice__icon">
        <StatusIcon state={state} />
      </span>
      <span className="ba-choice__text">
        <span className="ba-choice__letter">{option.letter}</span>
        <span className="ba-choice__body">
          {option.text}
        </span>
      </span>
      {spoken ? <span className="ba-choice__sr">{spoken}</span> : null}
    </>
  );
}

/**
 * BA-UI-003 Writing choice row.
 * Six-state mapping, 1px border, and the 1.02 / 0.95 click scale are locked.
 * This component does not grade.
 */
export function BAChoice({
  choiceMode,
  options,
  selectedKeys,
  feedback,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
}: BAChoiceProps) {
  const selected = new Set(selectedKeys);
  void feedback;

  if (choiceMode === 'multiple') {
    return (
      <CheckboxGroup
        className="ba-choice"
        data-component="BA-UI-003"
        data-choice-mode="multiple"
        data-visual="locked"
        aria-label={ariaLabel}
        value={selectedKeys}
        isDisabled={disabled}
        onChange={(keys) => onChange?.(keys.map(String))}
      >
        {options.map((option) => {
          const state = choiceVisual(option, selected.has(option.id), disabled);
          return (
            <Checkbox
              key={option.id}
              value={option.id}
              className="ba-choice__option course-choice"
              data-state={state}
              isDisabled={disabled || state === 'disabled'}
            >
              <OptionBody option={option} state={state} />
            </Checkbox>
          );
        })}
      </CheckboxGroup>
    );
  }

  return (
    <RadioGroup
      className="ba-choice"
      data-component="BA-UI-003"
      data-choice-mode="single"
      data-visual="locked"
      aria-label={ariaLabel}
      value={selectedKeys[0] ?? ''}
      isDisabled={disabled}
      onChange={(value) => onChange?.([String(value)])}
    >
      {options.map((option) => {
        const state = choiceVisual(option, selected.has(option.id), disabled);
        return (
          <Radio
            key={option.id}
            value={option.id}
            className="ba-choice__option course-choice"
            data-state={state}
            isDisabled={disabled || state === 'disabled'}
          >
            <OptionBody option={option} state={state} />
          </Radio>
        );
      })}
    </RadioGroup>
  );
}

