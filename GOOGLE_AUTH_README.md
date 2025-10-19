# Login com Google - Configuração (@react-oauth/google)

## Frontend (Next.js)

O frontend agora suporta login com Google usando a biblioteca `@react-oauth/google`:

### 1. Dependências Instaladas

```bash
npm install @react-oauth/google
```

### 2. Configuração Global

- **Layout** (`/app/layout.tsx`): Configurado `GoogleOAuthProvider` com Client ID
- **Login** (`/app/login/page.tsx`): Adicionado componente `GoogleLogin`
- **Signup** (`/app/signup/page.tsx`): Adicionado componente `GoogleLogin`

### 3. Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=SEU_CLIENT_ID.apps.googleusercontent.com
```

### 4. Fluxo de Autenticação

1. Usuário clica no botão Google Login (componente oficial)
2. Google OAuth popup é aberto automaticamente
3. Usuário faz login no Google e autoriza a aplicação
4. Google retorna um `credential` (JWT token) para o frontend
5. Frontend envia o `googleToken` para `POST /api/auth/google`
6. Backend valida o token e retorna JWT da aplicação
7. Token é armazenado e usuário é redirecionado para dashboard

### 5. Backend Requirements

O backend deve implementar apenas um endpoint:

```
POST /auth/google
- Recebe: { googleToken: string, planId: number }
- Retorna: { token: string, user?: object }
- Valida o Google token e retorna JWT da aplicação
```

### 6. Configuração do Google OAuth

No Google Cloud Console:
1. Criar projeto OAuth 2.0
2. Configurar URLs autorizadas:
   - **Origens autorizadas**: `http://localhost:3000`, `https://seudominio.com`
   - **Domínios autorizados**: `localhost`, `seudominio.com`

### 7. Funcionalidades Implementadas

- ✅ Botão oficial do Google nas páginas de login e cadastro
- ✅ Popup OAuth automático (sem redirecionamentos)
- ✅ Integração com sistema de auth existente
- ✅ Tratamento de erros e loading states
- ✅ Checkbox obrigatório para aceitar termos no cadastro
- ✅ Separador visual elegante

### 8. Código de Exemplo

```typescript
// handleGoogleSuccess no frontend
const handleGoogleSuccess = async (credentialResponse: any) => {
  const googleToken = credentialResponse.credential;
  
  const response = await api.post('/auth/google', {
    googleToken,
    planId: 1
  });
  
  localStorage.setItem('authToken', response.data.token);
  router.push('/dashboard');
};
```

### 9. Vantagens desta Implementação

- **Simples**: Apenas um endpoint no backend
- **Seguro**: Google tokens são validados pelo backend
- **UX**: Popup OAuth (sem sair da página)
- **Oficial**: Usa componente oficial do Google
- **Responsivo**: Botão se adapta ao tamanho da tela