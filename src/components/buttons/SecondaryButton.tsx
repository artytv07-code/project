import type { ButtonHTMLAttributes, ReactNode } from 'react';

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function SecondaryButton({
  className = '',
  children,
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn--secondary ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
