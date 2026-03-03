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
