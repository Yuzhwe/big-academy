import { useId } from 'react';
import './BAField.css';

export interface BAFieldProps {
  value: string;
  label: string;
  multiline?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

/**
 * BA-UI-004 · text field.
 * Owns the label and focus treatment. The product adapter owns grading.
 * Visual status is provisional and not designer-approved.
 */
export function BAField({
  value,
  label,
  multiline = false,
  readOnly = false,
  disabled = false,
  placeholder,
  onChange,
}: BAFieldProps) {
  const id = useId();
  const shared = {
    id,
    className: 'ba-field__control',
    value,
    readOnly,
    disabled,
    placeholder,
    'aria-invalid': undefined,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
  };
  return (
    <label className="ba-field" data-component="BA-UI-004" data-populated={value.trim() ? 'true' : 'false'} data-readonly={readOnly ? 'true' : undefined}>
      <span className="ba-field__label">{label}</span>
      {multiline ? <textarea {...shared} rows={4} /> : <input {...shared} type="text" />}
    </label>
  );
}
