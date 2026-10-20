import { forwardRef } from 'react';
import { Label, TextArea, TextField } from 'react-aria-components';
export interface BAFieldProps {
  value: string;
  label: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
  onPaste?: () => void;
  onSelect?: () => void;
}
/** BA-UI-004 · native textarea keeps IME, caret, browser undo and zoom behavior. */
export const BAField = forwardRef<HTMLTextAreaElement, BAFieldProps>(function BAField(
  { value, label, readOnly, onChange, onPaste, onSelect },
  ref,
) {
  return (
    <TextField
      className="writing-field"
      data-component="BA-UI-004"
      value={value}
      onChange={onChange}
      isReadOnly={readOnly}
    >
      <Label>{label}</Label>
      <TextArea ref={ref} onPaste={onPaste} onSelect={onSelect} spellCheck={false} />
    </TextField>
  );
});
