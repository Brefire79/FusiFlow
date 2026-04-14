# FusiFlow — Guia de Deploy

Passo a passo completo para publicar o FusiFlow com Firebase real no Netlify.

---

## 1. Configurar Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um projeto ou selecione um existente
3. Ative os serviços:
   - **Authentication** → Email/Senha
   - **Firestore Database** → Modo produção
   - **Storage** → Modo produção
   - **Functions** → Plano Blaze (necessário para Cloud Functions)

---

## 2. Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto (nunca versionar):

```env
VITE_USE_FIREBASE=true

VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Encontre esses valores em: Firebase Console → Configurações do Projeto → Apps → Web.

---

## 3. Firestore Rules + Storage Rules

Publique as regras de segurança:

```bash
# Instalar Firebase CLI (se necessário)
npm install -g firebase-tools

# Login
firebase login

# Selecionar projeto
firebase use seu-projeto-id

# Publicar regras
firebase deploy --only firestore:rules
firebase deploy --only storage
```

As regras estão em:
- `firestore.rules` — validação de campos, roles e imutabilidade do histórico
- `storage.rules` — acesso a exports e uploads de usuários

---

## 4. Deploy das Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

As Functions estão configuradas para a região `southamerica-east1` (São Paulo).

> **Atenção:** PDF e DOCX só funcionam após o deploy das Functions com o plano Blaze.  
> Export JSON funciona sem Firebase.

---

## 5. Seed inicial

Crie o arquivo de credenciais (para scripts Node.js):

1. Firebase Console → Configurações do Projeto → Contas de serviço
2. Clique em **Gerar nova chave privada**
3. Salve como `scripts/serviceAccountKey.json` (está no `.gitignore`)

Execute o seed:

```bash
npm run seed
```

Resultado esperado:
```
✅ Seed concluído com sucesso!
   1 usuário · 12 projetos · 12 documentos
```

---

## 6. Deploy no Netlify

### Via painel Netlify

| Campo | Valor |
|---|---|
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |
| **Node version** | `20` |

### Variáveis de ambiente no Netlify

Em **Site Settings → Environment Variables**, adicione todas as variáveis do passo 2.

### Redirects

O arquivo `public/_redirects` já contém:
```
/* /index.html 200
```
Isso garante que as rotas do React funcionem corretamente.

---

## 7. Limpar dados de teste

Quando quiser apagar os dados de seed antes de cadastrar projetos reais:

**Via interface (modo mock):**
> Configurações → Zona de Perigo → "Limpar dados de teste"

**Via script (Firestore):**
```bash
npm run clear-seed
# Confirme digitando: CONFIRMAR
```

> O script remove projetos, documentos, histórico e exports.  
> **Os usuários (/users) são preservados.**

---

## 8. Cadastrar projetos reais

Após limpar os dados de teste:

1. Acesse o FusiFlow em produção com sua conta admin
2. Clique em **Novo Projeto** (Topbar ou botão flutuante mobile)
3. Preencha título, descrição, status, fase e tags
4. Convide membros pela aba **Membros** de cada projeto
5. Crie documentos pela aba **Documentos**

---

## Checklist final

- [ ] `.env.local` configurado e **não versionado**
- [ ] `scripts/serviceAccountKey.json` presente e **não versionado**
- [ ] Firestore Rules publicadas
- [ ] Storage Rules publicadas
- [ ] Functions deployadas (região: southamerica-east1)
- [ ] Seed executado (`npm run seed`)
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Deploy bem-sucedido (`npm run build` sem erros)
- [ ] Login testado com conta real
- [ ] Dados de teste limpos (`npm run clear-seed`)
- [ ] Projetos reais cadastrados
