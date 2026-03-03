import React from 'react';

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const baseCard =
  'rounded-3xl border border-border/50 bg-surface/60 backdrop-blur-md shadow-card p-6 transition-all duration-200';

export default function Card({ children, hover, className = '', onClick }: CardProps) {
  return (
    <div
      className={`${baseCard} ${hover ? 'cursor-pointer hover:border-accent/30 hover:shadow-glow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
