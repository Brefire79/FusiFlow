import { create } from 'zustand';
import type { AppUser } from './data/types';
import { ENV } from './env';
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth as fbAuth } from './firebase';

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  setUser: (u: AppUser | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

/* ── Mock auth ── */
const MOCK_USER: AppUser = {
  uid: 'admin',
  name: 'Breno (Admin)',
  email: 'admin@fusiflow.app',
  role: 'admin',
  active: true,
  createdAt: new Date().toISOString(),
};

export async function login(email: string, password: string): Promise<AppUser> {
  if (!ENV.useFirebase) {
    // Mock: qualquer credencial funciona
    const u = { ...MOCK_USER, email };
    useAuthStore.getState().setUser(u);
    localStorage.setItem('ff_user', JSON.stringify(u));
    return u;
  }

  // Firebase real
  if (!fbAuth) throw new Error('Firebase Auth não inicializado');
  const cred = await signInWithEmailAndPassword(fbAuth, email, password);
  const appUser: AppUser = {
    uid: cred.user.uid,
    name: cred.user.displayName ?? email.split('@')[0],
    email: cred.user.email ?? email,
    role: 'member',
    active: true,
    createdAt: new Date().toISOString(),
  };
  useAuthStore.getState().setUser(appUser);
  return appUser;
}

export async function logout(): Promise<void> {
  if (ENV.useFirebase && fbAuth) {
    await fbSignOut(fbAuth);
  }
  useAuthStore.getState().setUser(null);
  localStorage.removeItem('ff_user');
}

export function initAuth(): void {
  const { setUser, setLoading } = useAuthStore.getState();

  if (!ENV.useFirebase) {
    // Mock: restore from localStorage
    const saved = localStorage.getItem('ff_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
    return;
  }

  if (!fbAuth) {
    setLoading(false);
    return;
  }

  onAuthStateChanged(fbAuth, (fbUser) => {
    if (fbUser) {
      setUser({
        uid: fbUser.uid,
        name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
        email: fbUser.email ?? '',
        role: 'member',
        active: true,
        createdAt: new Date().toISOString(),
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  });
}
