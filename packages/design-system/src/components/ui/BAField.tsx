import { TextField, Input, TextArea, Label, Text, FieldError } from 'react-aria-components';
import './BAField.css';
export interface BAFieldProps {
  label: string;
  value: string;
  onChange: (value:string)=>void;
  description?: string;
  multiline?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  className?: string;
  rows?: number;
}
export function BAField({label,value,onChange,description,multiline=false,disabled=false,readOnly=false,invalid=false,errorMessage,className,rows=4}: BAFieldProps) {
  return <TextField data-component="BA-UI-004" className={['ba-field',className].filter(Boolean).join(' ')} value={value} onChange={onChange} isDisabled={disabled} isReadOnly={readOnly} isInvalid={invalid}>
    <Label className="ba-field__label">{label}</Label>
    {multiline ? <TextArea className="ba-field__input" rows={rows}/> : <Input className="ba-field__input"/>}
    {description ? <Text slot="description" className="ba-field__description">{description}</Text> : null}
    <FieldError className="ba-field__error">{errorMessage}</FieldError>
  </TextField>;
}
