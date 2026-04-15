import React, { useState } from 'react';

export interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 rounded-full bg-bg-2/60 p-1 border border-border/30 overflow-x-auto">
      <div className="flex gap-1 min-w-max">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium
            transition-all duration-200
            ${
              active === t.key
                ? 'bg-surface text-accent shadow-sm'
                : 'text-text-2 hover:text-text hover:bg-white/5'
            }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
      </div>
    </div>
  );
}
