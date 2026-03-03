import React from 'react';

type Variant = 'primary' | 'accent' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 h-11 font-medium text-sm transition-all duration-200 ease-out select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/40';

const variants: Record<Variant, string> = {
  primary: `${base} bg-primary text-white hover:bg-primary-hover active:scale-[0.97]`,
  accent: `${base} bg-accent text-bg-2 font-semibold hover:opacity-90 active:scale-[0.97]`,
  ghost: `${base} bg-transparent text-text hover:bg-white/5 active:scale-[0.97]`,
  danger: `${base} bg-red-600/80 text-white hover:bg-red-500 active:scale-[0.97]`,
};

export default function Button({
  variant = 'primary',
  loading,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
