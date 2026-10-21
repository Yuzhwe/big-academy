import { Checkbox, Radio, RadioGroup } from 'react-aria-components';
import './BAChoice.css';

export type BAChoiceState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'revealed' | 'dimmed';
export interface BAChoiceOption {
  key: string;
  label: string;
  prefix?: string;
  state?: BAChoiceState;
  disabled?: boolean;
}
export interface BAChoiceProps {
  mode: 'single' | 'multiple';
  options: BAChoiceOption[];
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}
const stateIcon: Partial<Record<BAChoiceState, string>> = {
  correct: '✓', incorrect: '×', revealed: '✓',
};
function ChoiceInner({option}: {option: BAChoiceOption}) {
  const state = option.state ?? 'idle';
  return <><span className="ba-choice__marker" aria-hidden="true">{stateIcon[state] ?? option.prefix ?? ''}</span><span className="ba-choice__copy">{option.label}</span></>;
}
/** BA-UI-003. Selection only; grading, retries and correctness belong to PRODUCT. */
export function BAChoice({mode,options,selectedKeys,onChange,label,disabled=false,className}: BAChoiceProps) {
  const classes = ['ba-choice-list',className].filter(Boolean).join(' ');
  if(mode === 'single') return <RadioGroup className={classes} aria-label={label} value={selectedKeys[0] ?? ''} onChange={key=>onChange([key])} isDisabled={disabled} data-component="BA-UI-003">
    {options.map(option=><Radio key={option.key} className="ba-choice" value={option.key} data-feedback={option.state ?? 'idle'} isDisabled={option.disabled} aria-label={option.prefix ? `${option.prefix}. ${option.label}` : option.label}><ChoiceInner option={option}/></Radio>)}
  </RadioGroup>;
  return <div className={classes} role="group" aria-label={label} data-component="BA-UI-003">
    {options.map(option=><Checkbox key={option.key} className="ba-choice" isSelected={selectedKeys.includes(option.key)} onChange={checked=>onChange(checked ? [...selectedKeys,option.key] : selectedKeys.filter(key=>key!==option.key))} isDisabled={disabled||option.disabled} data-feedback={option.state ?? 'idle'} aria-label={option.prefix ? `${option.prefix}. ${option.label}` : option.label}><ChoiceInner option={option}/></Checkbox>)}
  </div>;
}
