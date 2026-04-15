import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const inputClass =
  'w-full rounded-2xl border border-border/60 bg-bg-2/80 px-4 h-11 text-base text-text placeholder:text-text-2 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all duration-150';

export default function Input({ label, className = '', ...rest }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-text-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input className={`${inputClass} ${className}`} {...rest} />
    </div>
  );
}

export { inputClass };
