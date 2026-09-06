# Task 10 Brief: App Routing, Final Wiring, PWA, and README

Wire all pages together with React Router, add route guards, and finalize the app.

## Global Constraints
- **Colors**: Primary `#4F46E5`. **All UI text in Portuguese (pt-BR)**.
- Working directory: `/home/gabriel/project`

## Dependencies
All pages and components from Tasks 1-9 are implemented:
- `src/pages/Login.tsx`
- `src/pages/Home.tsx`
- `src/pages/NewHomework.tsx`
- `src/pages/CompleteHomework.tsx`
- `src/pages/History.tsx`
- `src/contexts/AuthContext.tsx` — `useAuth()` → `{ user, loading }`
- `src/components/common/FirebaseConfigAlert.tsx`
- `src/config/firebase.ts` — `isFirebaseConfigured`

---

## 1. Update `src/App.tsx` — Full Routing

Replace the placeholder App.tsx with the complete routing setup:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { HomeworkProvider } from './contexts/HomeworkContext'
import { isFirebaseConfigured } from './config/firebase'
import FirebaseConfigAlert from './components/common/FirebaseConfigAlert'
import Login from './pages/Login'
import Home from './pages/Home'
import NewHomework from './pages/NewHomework'
import CompleteHomework from './pages/CompleteHomework'
import History from './pages/History'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><HomeworkProvider><Home /></HomeworkProvider></ProtectedRoute>} />
      <Route path="/new" element={<ProtectedRoute><HomeworkProvider><NewHomework /></HomeworkProvider></ProtectedRoute>} />
      <Route path="/homework/:id/complete" element={<ProtectedRoute><HomeworkProvider><CompleteHomework /></HomeworkProvider></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HomeworkProvider><History /></HomeworkProvider></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseConfigAlert />
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
```

**Important notes:**
- `HomeworkProvider` wraps each protected route that needs homework data. This ensures the Firestore subscription only happens when the user is authenticated.
- If the current HomeworkProvider implementation requires being inside AuthProvider (to get `user.uid`), make sure the nesting is correct.
- Alternatively, if HomeworkProvider is light enough, you can wrap it around all protected routes once instead of per-route.

## 2. Verify PWA Configuration

The PWA was configured in Task 1 via `vite-plugin-pwa`. Verify:
- `npm run build` generates the service worker and manifest
- The `dist/manifest.webmanifest` contains the correct name, theme_color, and icons
- The service worker caches the app shell for offline support

## 3. Create `README.md`

```markdown
# Homework Organizer 📚

Organizador de deveres escolares para estudantes, com comprovação por foto.

## Funcionalidades

- ✅ Login com e-mail/senha ou Google
- 📝 Criar deveres com matéria, prazo e prioridade
- 📸 Comprovação por foto para conclusão de deveres
- 🏆 Sistema de XP e streak diário
- 📊 Histórico de desempenho

## Configuração

### 1. Instalar dependências

\`\`\`bash
npm install
\`\`\`

### 2. Configurar Firebase

Crie um projeto no [Firebase Console](https://console.firebase.google.com) e ative:
- **Authentication** (Email/Password + Google)
- **Cloud Firestore**

Copie as credenciais para o arquivo `.env`:

\`\`\`bash
cp .env.example .env
\`\`\`

Preencha as variáveis:
\`\`\`
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
\`\`\`

### 3. Configurar Firestore Security Rules

No Firebase Console, vá em Firestore > Rules e cole o conteúdo de `firestore.rules`.

### 4. Rodar em desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

### 5. Build para produção

\`\`\`bash
npm run build
\`\`\`

## Deploy

### Vercel

\`\`\`bash
npx vercel --prod
\`\`\`

### Firebase Hosting

\`\`\`bash
npx firebase deploy --only hosting
\`\`\`

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Firebase Auth + Firestore
- PWA (installable, offline shell)
- Plus Jakarta Sans

## Licença

MIT
```

## 4. Final Verification

Run these commands and verify they pass:
```bash
npx vitest run        # All unit tests pass
npx tsc --noEmit      # No TypeScript errors  
npm run build         # Production build succeeds
```

Commit all changes:
```bash
git add -A
git commit -m "feat: wire all routes, add README, finalize PWA"
```

---

## After Implementation
- All three verification commands must pass
- The app should be fully functional (pending Firebase credentials)
