import { create } from 'zustand';

/* ── Presets ── */

export interface AccentPreset {
  id: string;
  name: string;
  primary: string;       // CTA buttons / warm accent
  primaryHover: string;
  primarySoft: string;
  accent: string;        // active states, links, rings
  accent2: string;       // subtle fills
  glow: string;          // shadow-glow rgba
}

export interface BgPreset {
  id: string;
  name: string;
  bg: string;
  bg2: string;
  surface: string;
  border: string;
}

export const accentPresets: AccentPreset[] = [
  {
    id: 'cosmos',
    name: 'Cosmos',
    primary: '#D07D5F', primaryHover: '#DF8C69', primarySoft: '#E5B799',
    accent: '#2ABEDD', accent2: '#145596',
    glow: 'rgba(42,190,221,0.15)',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    primary: '#34d399', primaryHover: '#4ade80', primarySoft: '#86efac',
    accent: '#818cf8', accent2: '#3730a3',
    glow: 'rgba(129,140,248,0.18)',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    primary: '#f472b6', primaryHover: '#fb7185', primarySoft: '#fda4af',
    accent: '#fb923c', accent2: '#9a3412',
    glow: 'rgba(251,146,60,0.18)',
  },
  {
    id: 'galaxy',
    name: 'Galáxia',
    primary: '#c084fc', primaryHover: '#d8b4fe', primarySoft: '#e9d5ff',
    accent: '#38bdf8', accent2: '#0369a1',
    glow: 'rgba(56,189,248,0.18)',
  },
  {
    id: 'neon',
    name: 'Neon',
    primary: '#a3e635', primaryHover: '#bef264', primarySoft: '#d9f99d',
    accent: '#f0abfc', accent2: '#7e22ce',
    glow: 'rgba(240,171,252,0.18)',
  },
];

export const bgPresets: BgPreset[] = [
  {
    id: 'cosmos',
    name: 'Cosmos',
    bg: '#011938', bg2: '#081228', surface: '#032D4E', border: '#443E44',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    bg: '#09090b', bg2: '#0f0f12', surface: '#18181b', border: '#27272a',
  },
  {
    id: 'forest',
    name: 'Floresta',
    bg: '#052e16', bg2: '#031a0d', surface: '#064e3b', border: '#14532d',
  },
  {
    id: 'galaxy',
    name: 'Galáxia',
    bg: '#1e1b4b', bg2: '#0f0a2d', surface: '#2e1065', border: '#3b2f8e',
  },
];

const LS_KEY = 'ff_theme_v1';

/* ── Apply to DOM ── */

export function applyTheme(accentId: string, bgId: string): void {
  const accent = accentPresets.find((p) => p.id === accentId) ?? accentPresets[0];
  const bg = bgPresets.find((p) => p.id === bgId) ?? bgPresets[0];
  const root = document.documentElement;

  root.style.setProperty('--color-primary', accent.primary);
  root.style.setProperty('--color-primary-hover', accent.primaryHover);
  root.style.setProperty('--color-primary-soft', accent.primarySoft);
  root.style.setProperty('--color-accent', accent.accent);
  root.style.setProperty('--color-accent-2', accent.accent2);
  root.style.setProperty('--shadow-glow', `0 0 20px ${accent.glow}`);

  root.style.setProperty('--color-bg', bg.bg);
  root.style.setProperty('--color-bg-2', bg.bg2);
  root.style.setProperty('--color-surface', bg.surface);
  root.style.setProperty('--color-border', bg.border);
  root.removeAttribute('data-theme');
}

/* ── Light mode ── */
const LIGHT_VARS: Record<string, string> = {
  '--color-bg': '#F0EDE7',
  '--color-bg-2': '#E5E0D8',
  '--color-surface': '#FAFAF8',
  '--color-text': '#1A1614',
  '--color-text-2': '#6B5E5E',
  '--color-border': '#C4BDB6',
  '--shadow-card': '0 4px 20px rgba(0,0,0,0.08)',
};

function applyLightOverrides(accentId: string): void {
  const accent = accentPresets.find((p) => p.id === accentId) ?? accentPresets[0];
  const root = document.documentElement;
  Object.entries(LIGHT_VARS).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.setProperty('--color-primary', accent.primary);
  root.style.setProperty('--color-primary-hover', accent.primaryHover);
  root.style.setProperty('--color-primary-soft', accent.primarySoft);
  root.style.setProperty('--color-accent', accent.accent);
  root.style.setProperty('--color-accent-2', accent.accent2);
  root.style.setProperty('--shadow-glow', `0 0 20px ${accent.glow}`);
  root.setAttribute('data-theme', 'light');
}

/* ── Init (call before React mounts) ── */

export function initTheme(): { accentId: string; bgId: string; mode: 'dark' | 'light' } {
  let accentId = 'cosmos';
  let bgId = 'cosmos';
  let mode: 'dark' | 'light' = 'dark';
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      if (p.accentId) accentId = p.accentId;
      if (p.bgId) bgId = p.bgId;
      if (p.mode === 'light') mode = 'light';
    }
  } catch { /* ignore */ }
  if (mode === 'light') applyLightOverrides(accentId);
  else applyTheme(accentId, bgId);
  return { accentId, bgId, mode };
}

function saveTheme(accentId: string, bgId: string, mode: 'dark' | 'light' = 'dark'): void {
  localStorage.setItem(LS_KEY, JSON.stringify({ accentId, bgId, mode }));
}

/* ── Zustand store ── */

interface ThemeState {
  accentId: string;
  bgId: string;
  mode: 'dark' | 'light';
  setAccent: (id: string) => void;
  setBg: (id: string) => void;
  toggleMode: () => void;
}

const initial = initTheme();

export const useThemeStore = create<ThemeState>((set, get) => ({
  accentId: initial.accentId,
  bgId: initial.bgId,
  mode: initial.mode,

  setAccent: (id) => {
    const { bgId, mode } = get();
    if (mode === 'light') applyLightOverrides(id);
    else applyTheme(id, bgId);
    saveTheme(id, bgId, mode);
    set({ accentId: id });
  },

  setBg: (id) => {
    const { accentId, mode } = get();
    if (mode === 'dark') applyTheme(accentId, id);
    saveTheme(accentId, id, mode);
    set({ bgId: id });
  },

  toggleMode: () => {
    const { accentId, bgId, mode } = get();
    const newMode = mode === 'dark' ? 'light' : 'dark';
    if (newMode === 'light') applyLightOverrides(accentId);
    else applyTheme(accentId, bgId);
    saveTheme(accentId, bgId, newMode);
    set({ mode: newMode });
  },
}));
