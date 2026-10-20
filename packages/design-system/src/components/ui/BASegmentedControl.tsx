import { useRef, useState, type ReactNode } from 'react';
import { useBASelectionSurface } from './useBASelectionSurface';
import { Radio, RadioGroup } from 'react-aria-components';
import './BASegmentedControl.css';

export type BASegmentSize = 36 | 50 | 70 | 90;
export type BASegmentOption = {
  id: string;
  label?: string;
  /** Icon-only controls require accessibleLabel. */
  accessibleLabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
};
export interface BASegmentedControlProps {
  options: BASegmentOption[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  'aria-label': string;
  size?: BASegmentSize;
  emphasis?: 'strong' | 'subtle';
  radius?: 'full' | 'standard';
  distribution?: 'equal' | 'hug';
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Optional width to override the equal distribution default of 480px. */
  width?: number | string;
}

/** BA-UI-011 · local single choice, never a TabPanel or router.
 * React Aria RadioGroup provides single selection, keyboard arrows and disabled states.
 * Figma's single selected surface slides 200ms and is measured for equal AND hug.
 */
export function BASegmentedControl({
  options,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  'aria-label': label,
  size = 50,
  emphasis = 'strong',
  radius = 'full',
  distribution = 'hug',
  disabled = false,
  className,
  id,
  width,
}: BASegmentedControlProps) {
  const isControlled = selectedKey !== undefined;
  const [internal, setInternal] = useState(defaultSelectedKey ?? options[0]?.id ?? '');
  const active = isControlled ? selectedKey : internal;
  const root = useRef<HTMLDivElement>(null);
  const selectionRect = useBASelectionSurface(root, active, size, distribution, options.map(o => o.id).join('|'));

  const onChange = (next:string) => {
    if (!isControlled) setInternal(next);
    onSelectionChange?.(next);
  };
  if (options.length < 2 || options.length > 4) {
    throw new Error('BASegmentedControl expects 2–4 options, per Figma specification.');
  }
  return (
    <div ref={root} id={id}
      className={['ba-segmented', className].filter(Boolean).join(' ')}
      data-component="BA-UI-011" data-size={size} data-emphasis={emphasis}
      data-radius={radius} data-distribution={distribution}
      style={width != null ? { width } : undefined}>
      <RadioGroup
        orientation="horizontal"
        aria-label={label}
        className="ba-segmented__track"
        value={active}
        onChange={onChange}
        isDisabled={disabled}
      >
        <span className="ba-segmented__surface" aria-hidden="true"
          style={selectionRect ? { left:selectionRect.x, width:selectionRect.width } : { opacity:0 }}/>
        {options.map(o => {
          const a11y = o.accessibleLabel ?? o.label;
          if (!a11y) throw new Error('Every segmented item requires a label or accessibleLabel.');
          return <Radio key={o.id} value={o.id} isDisabled={o.disabled}
            aria-label={a11y} data-key={o.id} className="ba-segmented__option">
            <span className="ba-segmented__content">
              {o.icon ? <span className="ba-segmented__icon" aria-hidden="true">{o.icon}</span> : null}
              {o.label ? <span className="ba-segmented__label">{o.label}</span> : null}
            </span>
          </Radio>;
        })}
      </RadioGroup>
    </div>
  );
}
