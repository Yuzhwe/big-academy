import { useEffect, useId, useRef, useState } from 'react';
import type { BALocale } from '@big-academy/design-system';
import './HamburgerLayer.css';

export interface HamburgerLayerProps {
  layerId: string;
  label: string;
  value: string;
  editable: boolean;
  /** Additive. top / fill / bottom are the plan parts. */
  part?: 'top' | 'fill' | 'bottom';
  placeholder?: string;
  caret?: number;
  locale?: BALocale;
  onChange?: (value: string, caret?: number) => void;
  onFocusField?: (layerId: string, caret?: number) => void;
}

/**
 * BA-WR-004 · one hamburger layer.
 * The label and the writing sit on the same colored surface.
 * Focus changes the whole layer and underlines the entry. No nested white card.
 * Candidate Warm Frame tints. Not validated.
 */
export function HamburgerLayer({
  layerId,
  label,
  value,
  editable,
  part = 'fill',
  placeholder = '',
  caret,
  locale = 'en',
  onChange,
  onFocusField,
}: HamburgerLayerProps) {
  const inputId = useId();
  const entry = useRef<HTMLTextAreaElement>(null);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!composing) setDraft(value);
  }, [composing, value]);

  useEffect(() => {
    const node = entry.current;
    if (!node || caret == null || document.activeElement !== node) return;
    if (node.selectionStart === caret && node.selectionEnd === caret) return;
    node.setSelectionRange(caret, caret);
  }, [caret, value]);

  return (
    <div
      className="hamburger-layer"
      data-component="BA-WR-004"
      data-field={layerId}
      data-part={part}
      data-editable={editable ? 'true' : 'false'}
      data-focused={focused ? 'true' : 'false'}
      data-filled={value.trim() ? 'true' : 'false'}
      lang={locale === 'zh' ? 'zh-CN' : 'en'}
    >
      <label className="hamburger-layer__label" htmlFor={editable ? inputId : undefined}>
        {label}
      </label>
      {editable ? (
        <textarea
          ref={entry}
          id={inputId}
          className="hamburger-layer__entry"
          rows={1}
          value={composing ? draft : value}
          placeholder={placeholder}
          aria-label={label}
          onFocus={(event) => {
            setFocused(true);
            onFocusField?.(layerId, event.currentTarget.selectionStart ?? value.length);
            event.currentTarget.closest('.hamburger-layer')?.scrollIntoView({ block: 'nearest' });
          }}
          onBlur={() => setFocused(false)}
          onSelect={(event) => {
            if (composing) return;
            onFocusField?.(layerId, event.currentTarget.selectionStart ?? 0);
          }}
          onCompositionStart={() => {
            setComposing(true);
            setDraft(value);
          }}
          onCompositionEnd={(event) => {
            const next = event.currentTarget.value;
            setComposing(false);
            setDraft(next);
            onChange?.(next, event.currentTarget.selectionStart ?? next.length);
          }}
          onChange={(event) => {
            const next = event.currentTarget.value;
            const nextCaret = event.currentTarget.selectionStart ?? next.length;
            if (composing) {
              setDraft(next);
              return;
            }
            onChange?.(next, nextCaret);
          }}
        />
      ) : (
        <p className="hamburger-layer__read">{value}</p>
      )}
    </div>
  );
}
