# Task 5 Brief: Login and Register Page (`/login`)

Build the Login/Register page for the Homework Organizer app.

## Global Constraints
- **Colors**: Primary `#4F46E5` (hover `#4338CA`), Success `#10B981`, Background `#FFFFFF`, Card surface `#F8FAFC`, Border `#E2E8F0`.
- **Font**: Plus Jakarta Sans. **Shapes**: `rounded-xl` buttons/inputs, `rounded-2xl` cards.
- **All UI text in Portuguese (pt-BR)**.
- **Mobile-first**: 375px-430px.
- Working directory: `/home/gabriel/project`

## Dependencies
- `src/contexts/AuthContext.tsx` — `useAuth()` returning `{ user, userProfile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, logout }`
- `signInWithEmail(email: string, password: string): Promise<void>`
- `signUpWithEmail(nome: string, email: string, password: string): Promise<void>`
- `signInWithGoogle(): Promise<void>`
- Tailwind colors configured. Material Symbols Outlined loaded.

## Reference Design
See `/home/gabriel/project/homework-organizer-assets/stitch_homework_organizer_app_ui/1._login/screen.png` for visual reference and `/home/gabriel/project/homework-organizer-assets/stitch_homework_organizer_app_ui/1._login/code.html` for structure reference.

---

## Create `src/pages/Login.tsx`

### Layout

The page has two modes: "login" and "register", toggled by a link at the bottom.

### Header section (always visible)
- Centered app logo: rounded-2xl indigo-tinted container with book icon (`auto_stories` Material Symbol)
- App name: "HOMEWORK ORGANIZER" in small caps label
- Title: "Bem-vindo de volta" (login) or "Crie sua conta" (register)
- Subtitle: "Organize seus deveres e tarefas escolares"

### Decorative info card (login mode only)
- Rounded card with icon `event_available` and text about organizing the academic week

### Form fields

**Register mode** (additional field):
- Nome completo: text input with `person` icon, placeholder "Seu nome completo"

**Both modes:**
- E-mail: email input with `mail` icon, placeholder "seu.email@escola.com", label "E-mail escolar ou pessoal"
- Senha: password input with `lock` icon, placeholder "••••••••", label "Senha"
  - Toggle visibility button (eye icon) on the right
  - "Esqueceu a senha?" link (login mode only, can be non-functional for now)

**Register mode** (additional):
- Confirmar senha: password input (optional — keep it simple, you can skip confirmation if you want)

### Login button
- Full-width indigo button: "Entrar" (login) or "Criar conta" (register)
- Loading state with spinner while authenticating
- `bg-primary hover:bg-primary-hover text-white rounded-xl h-12 font-semibold`

### Google sign-in button
- Full-width outlined button: "Continuar com Google"
- `border border-border rounded-xl h-12 text-text-primary`
- Google "G" icon or generic login icon

### Toggle link
- "Não tem conta? Criar conta" (on login page)
- "Já tem conta? Entrar" (on register page)
- Primary colored link text

### Error handling
- Display Firebase error messages in Portuguese:
  - `auth/invalid-credential` → "E-mail ou senha incorretos"
  - `auth/email-already-in-use` → "Este e-mail já está cadastrado"
  - `auth/weak-password` → "A senha deve ter pelo menos 6 caracteres"
  - `auth/invalid-email` → "E-mail inválido"
  - Default → "Erro ao autenticar. Tente novamente."
- Error shown in a red text below the form

### Navigation
- After successful auth, the user is redirected to "/" (this will be handled by App.tsx route guards, but the Login page should use `useNavigate()` to redirect if `user` is already authenticated when the page mounts)

---

## After Implementation
- `npx tsc --noEmit` — no type errors
- Commit: `git commit -m "feat: add login and register page"`
