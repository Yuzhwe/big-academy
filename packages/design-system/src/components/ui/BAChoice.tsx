import { useEffect, type ReactNode } from 'react';
import { Checkbox, CheckboxGroup, Radio, RadioGroup } from 'react-aria-components';
import type { BALocale } from '../../types/task';
import './BAChoice.css';

/**
 * Visual state for one option.
 * `shown` is a revealed answer, not a successful choice.
 * `dim` is a non-selected option after a correct grade (~40% opacity), not a wrong mark.
 * This component never grades.
 */
export type ChoiceVisualState = 'idle' | 'selected' | 'correct' | 'wrong' | 'shown' | 'dim' | 'disabled';

export interface ChoiceOption {
  id: string;
  letter: string;
  label: string;
  /** Caller-owned visual state. Omitted options follow selection only. */
  state?: ChoiceVisualState;
}

export interface ChoiceFeedback {
  /** Optional per-id override. Still not a grader — the caller already decided. */
  byId?: Record<string, ChoiceVisualState>;
  /** Correct rows use a filled success surface, or an outline only. */
  correctAppearance?: 'filled' | 'outlined';
}

export interface BAChoiceProps {
  choiceMode: 'single' | 'multiple';
  options: readonly ChoiceOption[];
  selectedKeys: readonly string[];
  feedback?: ChoiceFeedback;
  onChange?: (keys: string[]) => void;
  /** Chrome language for status words. Option labels stay as the caller authored them. */
  locale?: BALocale;
  'aria-label': string;
  /** Closes the group after a grade. Does not decide which row is correct. */
  disabled?: boolean;
  className?: string;
}

function resolveState(option: ChoiceOption, selected: boolean, feedback?: ChoiceFeedback): ChoiceVisualState {
  return feedback?.byId?.[option.id] ?? option.state ?? (selected ? 'selected' : 'idle');
}

function statusCopy(state: ChoiceVisualState, locale: BALocale): string | null {
  const zh = locale === 'zh';
  if (state === 'correct') return zh ? '你的答案 · 正确' : 'Your answer · right';
  if (state === 'shown') return zh ? '正确答案' : 'Right answer';
  if (state === 'wrong') return zh ? '不正确' : 'Wrong';
  if (state === 'selected') return zh ? '已选' : 'Selected';
  if (state === 'dim') return zh ? '未选' : 'Not selected';
  if (state === 'disabled') return zh ? '不可选' : 'Unavailable';
  return null;
}

function optionIndexFromKey(key: string, count: number): number {
  if (/^[1-9]$/.test(key)) {
    const index = Number(key) - 1;
    return index < count ? index : -1;
  }
  if (/^[a-i]$/i.test(key) && key.length === 1) {
    const index = key.toUpperCase().charCodeAt(0) - 65;
    return index < count ? index : -1;
  }
  return -1;
}

/**
 * BA-UI-003 · single or multiple choice.
 * Selection calls `onChange` only. Check, tries, and reveal stay in the product session.
 */
export function BAChoice({
  choiceMode,
  options,
  selectedKeys,
  feedback,
  onChange,
  locale = 'en',
  'aria-label': ariaLabel,
  disabled = false,
  className,
}: BAChoiceProps) {
  const appearance = feedback?.correctAppearance ?? 'filled';
  const selected = new Set(selectedKeys);

  useEffect(() => {
    if (disabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input, textarea, [contenteditable="true"]')) return;
      const index = optionIndexFromKey(event.key, options.length);
      if (index < 0) return;
      const option = options[index];
      const state = resolveState(option, selected.has(option.id), feedback);
      if (state === 'disabled') return;
      event.preventDefault();
      if (choiceMode === 'single') onChange?.([option.id]);
      else if (selected.has(option.id)) onChange?.(selectedKeys.filter((key) => key !== option.id));
      else onChange?.([...selectedKeys, option.id]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choiceMode, disabled, feedback, onChange, options, selected, selectedKeys]);

  const renderOption = (option: ChoiceOption, control: ReactNode) => {
    const state = resolveState(option, selected.has(option.id), feedback);
    const status = statusCopy(state, locale);
    return (
      <div
        key={option.id}
        className="ba-choice__option"
        data-state={state}
        data-correct-appearance={state === 'correct' ? appearance : undefined}
      >
        {control}
        <span className="ba-choice__letter" aria-hidden="true">
          {option.letter}
        </span>
        <span className="ba-choice__text" lang="en">
          {option.label}
        </span>
        {status ? <span className="ba-choice__status">{status}</span> : null}
      </div>
    );
  };

  const groupClass = ['ba-choice', className].filter(Boolean).join(' ');

  if (choiceMode === 'multiple') {
    return (
      <CheckboxGroup
        className={groupClass}
        data-component="BA-UI-003"
        data-choice-mode="multiple"
        aria-label={ariaLabel}
        isDisabled={disabled}
        value={[...selectedKeys]}
        onChange={(keys) => onChange?.(keys.map(String))}
      >
        {options.map((option) => {
          const state = resolveState(option, selected.has(option.id), feedback);
          return (
            <Checkbox
              key={option.id}
              value={option.id}
              className="ba-choice__control"
              isDisabled={disabled || state === 'disabled'}
              aria-label={[option.letter, option.label, statusCopy(state, locale)].filter(Boolean).join('. ')}
            >
              {renderOption(option, <span className="ba-choice__mark" data-mark="multiple" aria-hidden="true" />)}
            </Checkbox>
          );
        })}
      </CheckboxGroup>
    );
  }

  return (
    <RadioGroup
      className={groupClass}
      data-component="BA-UI-003"
      data-choice-mode="single"
      aria-label={ariaLabel}
      isDisabled={disabled}
      value={selectedKeys[0] ?? ''}
      onChange={(value) => onChange?.([String(value)])}
    >
      {options.map((option) => {
        const state = resolveState(option, selected.has(option.id), feedback);
        return (
          <Radio
            key={option.id}
            value={option.id}
            className="ba-choice__control"
            isDisabled={disabled || state === 'disabled'}
            aria-label={[option.letter, option.label, statusCopy(state, locale)].filter(Boolean).join('. ')}
          >
            {renderOption(option, <span className="ba-choice__mark" data-mark="single" aria-hidden="true" />)}
          </Radio>
        );
      })}
    </RadioGroup>
  );
}
