import type { ReactNode } from 'react';
import { Checkbox, CheckboxGroup, Radio, RadioGroup } from 'react-aria-components';
import { BAIcon } from './BAIcon';
import './BAChoice.css';

/** Injected by the product adapter. This component never decides correctness. */
export type BAChoiceVisual = 'default' | 'selected' | 'correct' | 'incorrect' | 'shown' | 'dim';

export interface BAChoiceOption {
  id: string;
  text: string;
  /** Leading marker, usually a letter or a check for multi-select. */
  marker?: string;
  visual?: BAChoiceVisual;
  /** Text status, so the state is not color alone. */
  mark?: string;
}

export interface BAChoiceProps {
  mode: 'single' | 'multiple';
  label: string;
  options: readonly BAChoiceOption[];
  selectedIds: readonly string[];
  disabled?: boolean;
  onChange: (selectedIds: string[]) => void;
}

/**
 * BA-UI-003 · answer choice.
 * React Aria radio or checkbox semantics. Minimum 50 CSS px, grows with wrapping.
 * Visual status is provisional and not designer-approved.
 */
export function BAChoice({ mode, label, options, selectedIds, disabled = false, onChange }: BAChoiceProps) {
  if (mode === 'multiple') {
    return (
      <CheckboxGroup
        className="ba-choice"
        data-component="BA-UI-003"
        data-mode="multiple"
        aria-label={label}
        isDisabled={disabled}
        value={[...selectedIds]}
        onChange={(value) => onChange(value.map(String))}
      >
        {options.map((option) => (
          <ChoiceRow key={option.id} option={option} mode="multiple" disabled={disabled} />
        ))}
      </CheckboxGroup>
    );
  }

  return (
    <RadioGroup
      className="ba-choice"
      data-component="BA-UI-003"
      data-mode="single"
      aria-label={label}
      isDisabled={disabled}
      value={selectedIds[0] ?? null}
      onChange={(value) => onChange([String(value)])}
    >
      {options.map((option) => (
        <ChoiceRow key={option.id} option={option} mode="single" disabled={disabled} />
      ))}
    </RadioGroup>
  );
}

function ChoiceRow({
  option,
  mode,
  disabled,
}: {
  option: BAChoiceOption;
  mode: 'single' | 'multiple';
  disabled: boolean;
}) {
  const visual = option.visual ?? 'default';
  const locked = disabled || visual === 'dim' || visual === 'correct' || visual === 'shown';
  const Control = mode === 'multiple' ? Checkbox : Radio;
  return (
    <Control
      className="ba-choice__option course-choice"
      value={option.id}
      isDisabled={locked}
      data-visual={visual}
      aria-label={option.mark ? `${option.marker ? `${option.marker}. ` : ''}${option.text}. ${option.mark}` : undefined}
    >
      <span className="ba-choice__line">
        <span className="ba-choice__marker" aria-hidden="true">
          {visual === 'correct' || visual === 'shown' || (mode === 'multiple' && visual === 'selected') ? (
            <BAIcon name="check" size={18} />
          ) : (
            option.marker
          )}
        </span>
        <span className="ba-choice__text">{option.text}</span>
        {option.mark ? <ChoiceMark visual={visual}>{option.mark}</ChoiceMark> : null}
      </span>
    </Control>
  );
}

function ChoiceMark({ visual, children }: { visual: BAChoiceVisual; children: ReactNode }) {
  const negative = visual === 'incorrect';
  return (
    <span className={negative ? 'ba-choice__mark ba-choice__mark--no' : 'ba-choice__mark'}>
      {negative ? <BAIcon name="warning-circle" size={16} /> : <BAIcon name="check" size={16} />}
      <span>{children}</span>
    </span>
  );
}
