import type { ButtonHTMLAttributes, ReactNode } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  children: ReactNode;
};

export function PrimaryButton({
  fullWidth = false,
  className = '',
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn--primary ${fullWidth ? 'btn--full' : ''} ${className}`
        .replace(/\s+/g, ' ')
        .trim()}
      {...props}
    >
      {children}
    </button>
  );
}
