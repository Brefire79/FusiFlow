import { create } from 'zustand';
import type { AppUser } from './data/types';
import { ENV } from './env';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth as fbAuth } from './firebase';
import { db as fbDb } from './firebase';

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

export async function ensureUserDoc(
  uid: string,
  email?: string | null,
  displayName?: string | null,
): Promise<void> {
  if (!ENV.useFirebase || !fbDb) return;

  const userRef = doc(fbDb, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return;

  const normalizedEmail = email ?? '';
  const normalizedDisplayName = displayName ?? normalizedEmail.split('@')[0] ?? 'User';

  await setDoc(userRef, {
    email: normalizedEmail,
    displayName: normalizedDisplayName,
    role: 'member',
    createdAt: serverTimestamp(),
  });
}

/* ── Mapeamento de erros do Firebase Auth para PT-BR ── */
export function mapFirebaseAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':         'Usuário não encontrado.',
    'auth/wrong-password':         'Senha incorreta.',
    'auth/invalid-credential':     'Email ou senha inválidos.',
    'auth/too-many-requests':      'Muitas tentativas. Tente mais tarde.',
    'auth/user-disabled':          'Conta desativada. Contate o admin.',
    'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
  };
  return map[code] ?? 'Erro ao fazer login. Tente novamente.';
}

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
  try {
    const cred = await signInWithEmailAndPassword(fbAuth, email, password);
    await ensureUserDoc(cred.user.uid, cred.user.email, cred.user.displayName);
    // Ler role real do Firestore (não assumir 'member')
    let role: AppUser['role'] = 'member';
    if (fbDb) {
      const userSnap = await getDoc(doc(fbDb, 'users', cred.user.uid));
      if (userSnap.exists() && userSnap.data().role === 'admin') role = 'admin';
    }
    const appUser: AppUser = {
      uid: cred.user.uid,
      name: cred.user.displayName ?? email.split('@')[0],
      email: cred.user.email ?? email,
      role,
      active: true,
      createdAt: new Date().toISOString(),
    };
    useAuthStore.getState().setUser(appUser);
    return appUser;
  } catch (err: unknown) {
    // Traduzir o código de erro para mensagem amigável em PT-BR
    const code = (err as { code?: string }).code ?? '';
    throw new Error(mapFirebaseAuthError(code));
  }
}

export async function register(name: string, email: string, password: string): Promise<AppUser> {
  if (!ENV.useFirebase) {
    // Mock: cria usuário no localStorage e loga
    const uid = `user-${Date.now()}`;
    const u: AppUser = { uid, name, email, role: 'member', active: true, createdAt: new Date().toISOString() };
    useAuthStore.getState().setUser(u);
    localStorage.setItem('ff_user', JSON.stringify(u));
    // Salva na lista de usuários do mock
    const existing = JSON.parse(localStorage.getItem('ff_known_users') ?? '[]') as { uid: string; name: string; email: string }[];
    existing.push({ uid, name, email });
    localStorage.setItem('ff_known_users', JSON.stringify(existing));
    return u;
  }

  if (!fbAuth) throw new Error('Firebase Auth não inicializado');
  try {
    const cred = await createUserWithEmailAndPassword(fbAuth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await ensureUserDoc(cred.user.uid, email, name);
    const appUser: AppUser = {
      uid: cred.user.uid,
      name,
      email,
      role: 'member',
      active: true,
      createdAt: new Date().toISOString(),
    };
    useAuthStore.getState().setUser(appUser);
    return appUser;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'Este email já está cadastrado.',
      'auth/weak-password': 'Senha muito fraca. Use ao menos 6 caracteres.',
      'auth/invalid-email': 'Email inválido.',
    };
    throw new Error(map[code] ?? 'Erro ao criar conta. Tente novamente.');
  }
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

  onAuthStateChanged(fbAuth, async (fbUser) => {
    try {
      if (fbUser) {
        await ensureUserDoc(fbUser.uid, fbUser.email, fbUser.displayName);
        // Ler role real do Firestore
        let role: 'admin' | 'member' = 'member';
        if (fbDb) {
          const userSnap = await getDoc(doc(fbDb, 'users', fbUser.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.role === 'admin') role = 'admin';
          }
        }
        setUser({
          uid: fbUser.uid,
          name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'User',
          email: fbUser.email ?? '',
          role,
          active: true,
          createdAt: new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  });
}
