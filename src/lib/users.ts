import { ENV } from './env';

const USERS: Record<string, string> = {
  admin: 'Breno (Admin)',
  joao: 'João Albuquerque',
  lucas: 'Lucas Silva',
  'breno-m': 'Breno Marques',
  ana: 'Ana Costa',
  rafael: 'Rafael Mendes',
};

export function resolveUserName(uid: string): string {
  return USERS[uid] ?? uid;
}

export interface UserListItem {
  uid: string;
  name: string;
  email: string;
}

export async function listUsers(): Promise<UserListItem[]> {
  if (!ENV.useFirebase) {
    // Mock: seed + usuários registrados em runtime
    const defaults: UserListItem[] = [
      { uid: 'joao',    name: 'João Albuquerque', email: 'joao@fusiflow.app' },
      { uid: 'lucas',   name: 'Lucas Silva',      email: 'lucas@fusiflow.app' },
      { uid: 'breno-m', name: 'Breno Marques',    email: 'breno-m@fusiflow.app' },
      { uid: 'ana',     name: 'Ana Costa',         email: 'ana@fusiflow.app' },
      { uid: 'rafael',  name: 'Rafael Mendes',     email: 'rafael@fusiflow.app' },
      { uid: 'admin',   name: 'Breno (Admin)',     email: 'admin@fusiflow.app' },
    ];
    const runtime = JSON.parse(localStorage.getItem('ff_known_users') ?? '[]') as UserListItem[];
    const allUids = new Set(defaults.map((u) => u.uid));
    for (const u of runtime) {
      if (!allUids.has(u.uid)) defaults.push(u);
    }
    return defaults;
  }

  // Firebase real: busca coleção users
  const { db } = await import('./firebase');
  const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'users'), orderBy('displayName')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.displayName ?? data.email ?? d.id,
      email: data.email ?? '',
    };
  });
}
