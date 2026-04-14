# FusiFlow — Gestão de Projetos AMB FUSI AÍ

PWA interno para gerenciamento de projetos e documentação com UI premium estilo Apple.

> Segurança de ambiente: `.env` é local e não deve ser versionado. Use `.env.example` como base.

## Stack

- **Front**: React + Vite + TypeScript
- **UI**: TailwindCSS + Lucide Icons
- **State**: TanStack Query + Zustand (auth)
- **Firebase**: Auth + Firestore + Storage + Cloud Functions v2
- **Deploy**: Netlify (PWA)

---

## Rodar no Modo Mock (sem Firebase)

O modo mock usa localStorage como banco de dados e não precisa de nenhum serviço externo.

```bash
# 1) Instalar dependências
npm install

# 2) Garantir que o modo mock está ativo
# O arquivo .env já vem com VITE_USE_FIREBASE=false
# Se não existir, copie o .env.example
cp .env.example .env

# 3) Rodar o dev server
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173). O app abrirá na tela de login.
Use qualquer email/senha — no modo mock toda credencial funciona.

O mock inclui:
- 1 usuário admin padrão (Breno (Admin))
- 3 projetos seed com diferentes status
- 4 documentos de exemplo
- Histórico de criação

---

## Ativar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication (Email/Password)
3. Ative Firestore Database
4. Ative Storage
5. Copie as credenciais para o `.env`:

```env
VITE_USE_FIREBASE=true
VITE_FIREBASE_API_KEY=seu_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxx
```

6. Faça deploy das Firestore Rules:
```bash
firebase deploy --only firestore:rules
```

7. (Opcional) Deploy das Cloud Functions:
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## Deploy no Netlify

### Via CLI

```bash
# Build
npm run build

# Deploy
npx netlify-cli deploy --prod --dir=dist
```

### Via Netlify UI
1. Conecte o repositório no Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Variáveis de ambiente no painel do Netlify (copiar do `.env`)

O arquivo `public/_redirects` já configura o SPA mode.

---

## Variáveis de Ambiente

Crie seu `.env` local a partir do exemplo:

```bash
cp .env.example .env
```

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_USE_FIREBASE` | `true` para Firebase real, `false` para mock | `false` |
| `VITE_FIREBASE_API_KEY` | API Key do Firebase | — |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth Domain | — |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | — |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage Bucket | — |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | — |
| `VITE_FIREBASE_APP_ID` | App ID | — |

Checklist manual de segurança: [docs/SECURITY.md](docs/SECURITY.md)

---

## Cloud Functions

As Cloud Functions ficam em `functions/` e exportam:

- **`exportProject`** (callable): Gera exportação do projeto em JSON, PDF ou DOCX, salva no Storage e registra no Firestore.

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## Funcionalidades

- ✅ Auth (mock + Firebase)
- ✅ Dashboard com contadores por status
- ✅ CRUD de projetos
- ✅ Filtros e busca
- ✅ Editor Markdown com preview (react-markdown + remark-gfm)
- ✅ Lock de edição (lease com renovação)
- ✅ Versionamento otimista (transaction)
- ✅ Audit log (histórico de alterações)
- ✅ Exportações (JSON client-side; PDF/DOCX via Functions)
- ✅ PWA instalável
- ✅ UI Apple-like dark premium

---

## Ícones PWA

Os arquivos `public/icon-192.svg` e `public/icon-512.svg` são placeholders.
Para produção, converta para PNG usando ferramentas como:
- [realfavicongenerator.net](https://realfavicongenerator.net)
- `sharp` (Node.js library)

Renomeie para `icon-192.png` e `icon-512.png`.

---

## Licença

Projeto interno AMB FUSI AÍ.
