import type { ComponentProps, ReactNode } from 'react';
import { Button, ProgressBar } from 'react-aria-components';
import type { BALocale } from '../../types/task';
import { taskChrome } from '../../i18n/chrome';
import './BAButton.css';

type ButtonPressEvent = Parameters<NonNullable<ComponentProps<typeof Button>['onPress']>>[0];

export interface BAButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  /** Pending state. Maps only to React Aria `isPending`, never to a second `aria-busy`. */
  busy?: boolean;
  children?: ReactNode;
  onPress?: (event: ButtonPressEvent) => void;
  /** Screen-reader name for the pending indicator. Defaults from `locale`. */
  busyLabel?: string;
  /** Accessible name when the visible children are not the full name (icon button). */
  'aria-label'?: string;
  locale?: BALocale;
  className?: string;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * BA-UI-001 · shared button.
 * React Aria owns keyboard, pointer, and pending announcement.
 * `busy` is not also passed as `aria-busy`: React Aria's pending button
 * associates an inner progressbar, and a second aria-busy declaration
 * was the known pilot type error.
 */
export function BAButton({
  variant = 'secondary',
  disabled = false,
  busy = false,
  children,
  onPress,
  busyLabel,
  'aria-label': ariaLabel,
  locale = 'en',
  className,
  id,
  type = 'button',
}: BAButtonProps) {
  const pendingLabel = busyLabel ?? taskChrome(locale).busy;
  const classes = ['ba-button', className].filter(Boolean).join(' ');

  return (
    <Button
      id={id}
      type={type}
      className={classes}
      data-component="BA-UI-001"
      data-variant={variant}
      isDisabled={disabled}
      isPending={busy}
      onPress={disabled || busy ? undefined : onPress}
      aria-label={ariaLabel}
    >
      {busy ? (
        <ProgressBar
          aria-label={pendingLabel}
          isIndeterminate
          className="ba-button__pending"
        />
      ) : null}
      {children}
    </Button>
  );
}
