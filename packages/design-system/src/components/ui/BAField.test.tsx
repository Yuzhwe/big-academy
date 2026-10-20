import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { BAField } from './BAField';

function Harness() {
  const [value, setValue] = useState('');
  return <BAField label="Your sentence" multiline value={value} onChange={setValue} />;
}

describe('BAField', () => {
  it('keeps typed text and exposes its label', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const field = screen.getByRole('textbox', { name: 'Your sentence' });
    await user.type(field, 'I think recess should be longer.');
    expect(field).toHaveValue('I think recess should be longer.');
    expect(field.closest('[data-component="BA-UI-004"]')).toHaveAttribute('data-populated', 'true');
  });

  it('does not edit a read-only field', () => {
    render(<BAField label="Answer" value="Shown answer" readOnly onChange={() => undefined} />);
    expect(screen.getByRole('textbox', { name: 'Answer' })).toHaveAttribute('readonly');
  });
});
