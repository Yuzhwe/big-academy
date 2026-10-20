import { Checkbox, CheckboxGroup, Radio, RadioGroup } from 'react-aria-components';
import './BAChoice.css';
export type ChoiceState = 'idle' | 'selected' | 'correct' | 'wrong' | 'revealed' | 'dim';
export interface BAChoiceProps {
  label: string;
  choiceMode: 'single' | 'multiple';
  options: { id: string; text: string; state?: ChoiceState; stateLabel?: string }[];
  selectedKeys: string[];
  disabled?: boolean;
  onChange: (keys: string[]) => void;
}
/** BA-UI-003 · product injects checked/revealed states, this component only selects. */
export function BAChoice({ label, choiceMode, options, selectedKeys, disabled, onChange }: BAChoiceProps) {
  const content = (option: BAChoiceProps['options'][number], i: number) => (
    <>
      <span className="ba-choice__letter">{String.fromCharCode(65 + i)}</span>
      <span className="ba-choice__text">
        {option.text}
        {option.stateLabel ? <span className="ba-choice__state">{option.stateLabel}</span> : null}
      </span>
      <span aria-hidden="true" className="ba-choice__symbol">
        {option.state === 'correct' || option.state === 'revealed'
          ? '✓'
          : option.state === 'wrong'
            ? '×'
            : selectedKeys.includes(option.id)
              ? '●'
              : ''}
      </span>
    </>
  );
  return choiceMode === 'single' ? (
    <RadioGroup
      data-component="BA-UI-003"
      className="ba-choices"
      aria-label={label}
      value={selectedKeys[0] ?? ''}
      isDisabled={disabled}
      onChange={(x) => onChange([x])}
    >
      {options.map((o, i) => (
        <Radio key={o.id} value={o.id} className="ba-choice course-choice" data-feedback={o.state}>
          {content(o, i)}
        </Radio>
      ))}
    </RadioGroup>
  ) : (
    <CheckboxGroup
      data-component="BA-UI-003"
      className="ba-choices"
      aria-label={label}
      value={selectedKeys}
      isDisabled={disabled}
      onChange={onChange}
    >
      {options.map((o, i) => (
        <Checkbox key={o.id} value={o.id} className="ba-choice course-choice" data-feedback={o.state}>
          {content(o, i)}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}
