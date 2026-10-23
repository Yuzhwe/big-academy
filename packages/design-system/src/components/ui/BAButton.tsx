import type { ComponentProps, ReactNode } from 'react';
import { Button, ProgressBar } from 'react-aria-components';
import type { BALocale } from '../../types/task';
import { taskChrome } from '../../i18n/chrome';
import './BAButton.css';

type ButtonPressEvent = Parameters<NonNullable<ComponentProps<typeof Button>['onPress']>>[0];
export type BAButtonSize = 36 | 50 | 70 | 90;
export type BAButtonRadius = 'full' | 'standard';
export type BAButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
export interface BAButtonProps {
  /** "ghost" is backwards-compatible alias for Figma tertiary. */
  variant?: BAButtonVariant;
  /** Figma named sizes — default 50. */
  size?: BAButtonSize;
  radius?: BAButtonRadius;
  intent?: 'default' | 'destructive';
  /** Accent applies to tertiary only with default intent. */
  tone?: 'default' | 'accent';
  iconOnly?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  disabled?: boolean;
  busy?: boolean;
  children?: ReactNode;
  onPress?: (event: ButtonPressEvent) => void;
  busyLabel?: string;
  'aria-label'?: string;
  locale?: BALocale;
  className?: string;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  /** Pass data attributes through without reimplementing the button. */
  dataAttributes?: { [key: `data-${string}`]: string | number | undefined };
}

/** BA-UI-001: Figma Button V2 presentation on React Aria's Button.
 * The outer hit target does NOT transform. Only the visible assembly scales.
 */
export function BAButton({
  variant = 'secondary',
  size = 50,
  radius = 'full',
  intent = 'default',
  tone = 'default',
  iconOnly = false,
  leadingIcon,
  trailingIcon,
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
  dataAttributes,
}: BAButtonProps) {
  const pendingLabel = busyLabel ?? taskChrome(locale).busy;
  const visualVariant = variant === 'ghost' ? 'tertiary' : variant;
  const cls = ['ba-button', className].filter(Boolean).join(' ');

  return (
    <Button
      id={id}
      type={type}
      className={cls}
      data-component="BA-UI-001"
      {...dataAttributes}
      data-variant={variant}
      data-kind={visualVariant}
      data-size={size}
      data-radius={radius}
      data-intent={intent}
      data-tone={tone}
      data-icon-only={iconOnly}
      isDisabled={disabled}
      isPending={busy}
      onPress={disabled || busy ? undefined : onPress}
      aria-label={ariaLabel}
    >
      <span className="ba-button__assembly" aria-hidden={undefined}>
        {busy ? (
          <ProgressBar aria-label={pendingLabel} isIndeterminate className="ba-button__pending"/>
        ) : (
          <>
            {leadingIcon ? <span className="ba-button__icon">{leadingIcon}</span> : null}
            {children != null ? <span className="ba-button__label">{children}</span> : null}
            {trailingIcon ? <span className="ba-button__icon">{trailingIcon}</span> : null}
          </>
        )}
      </span>
      {busy ? <span className="ba-button__accessible-content">{children}</span> : null}
    </Button>
  );
}

