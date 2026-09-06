# Task 1-3 Brief: Project Foundation — Setup, Types, Utils, Firebase, Contexts

This is the foundational batch: set up the entire React + Vite + TypeScript + Tailwind project, create all types and utility functions with unit tests, and implement Firebase configuration with Auth and Homework contexts.

## Global Constraints
- **No demo/mock mode**: The app must connect to Firebase real via `.env` variables. If `.env` is missing, show a friendly alert.
- **Colors**: Primary `#4F46E5` (hover `#4338CA`), Success `#10B981` (active `#059669`), Urgent `#F59E0B`, Background `#FFFFFF`, Card surface `#F8FAFC`, Border `#E2E8F0`.
- **Font**: Plus Jakarta Sans from Google Fonts.
- **Shapes**: `rounded-xl` on buttons/inputs, `rounded-2xl` on cards, `rounded-full` on chips/badges.
- **All UI text in Portuguese (pt-BR)**.
- **Photo is never persisted** to Firebase Storage. Only kept in memory during confirmation.
- Working directory: `/home/gabriel/project`

---

## Task 1: Project Initialization and Build Configuration

### Step 1.1: Create `package.json`

```json
{
  "name": "homework-organizer",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "firebase": "^10.14.0",
    "date-fns": "^4.1.0",
    "canvas-confetti": "^1.9.3",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/canvas-confetti": "^1.6.4",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.11",
    "vite-plugin-pwa": "^0.21.1",
    "vitest": "^2.1.4",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.6.3",
    "jsdom": "^25.0.1"
  }
}
```

### Step 1.2: Create `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Homework Organizer',
        short_name: 'HW Organizer',
        description: 'Organize seus deveres escolares',
        theme_color: '#4F46E5',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
```

### Step 1.3: Create `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
        },
        success: {
          DEFAULT: '#10B981',
          active: '#059669',
          light: '#ECFDF5',
        },
        urgent: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#F8FAFC',
        },
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-muted': '#94A3B8',
      },
    },
  },
  plugins: [],
}
```

### Step 1.4: Create `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Step 1.5: Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "esModuleInterop": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 1.6: Create `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### Step 1.7: Create `index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#4F46E5" />
    <meta name="description" content="Organize seus deveres escolares com o Homework Organizer" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    <title>Homework Organizer</title>
  </head>
  <body class="bg-white font-sans text-text-primary antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 1.8: Create `.env.example` and `.env`

`.env.example`:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`.env` — identical content (empty values for user to fill in).

### Step 1.9: Create `.gitignore`

```
node_modules
dist
.env
*.local
.DS_Store
```

### Step 1.10: Create `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /homeworks/{homeworkId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 1.11: Create `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Step 1.12: Create `firebase.json`

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

### Step 1.13: Create basic entry files

`src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    @apply min-h-screen bg-white;
    -webkit-tap-highlight-color: transparent;
    overscroll-behavior: none;
  }

  body {
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-top: env(safe-area-inset-top, 0px);
  }
}

@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

`src/main.tsx`:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

`src/App.tsx` (placeholder — will be completed in Task 10):
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-4 text-primary font-bold text-xl">Homework Organizer</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### Step 1.14: Create Vitest setup

`src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Add vitest config to `vite.config.ts` — add this to the defineConfig:
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

(Make sure to add `/// <reference types="vitest" />` at the top of vite.config.ts)

### Step 1.15: Create PWA icon placeholders

For the PWA icons, create simple placeholder PNG files in `public/`:
- `pwa-192x192.png` (192x192)
- `pwa-512x512.png` (512x512)
- `apple-touch-icon.png` (180x180)
- `favicon.ico`

You can copy `/home/gabriel/project/homework-organizer-assets/logo.png` as the base for these. If you can't resize, just copy the original file to all icon paths — it will work for development.

### Step 1.16: Run `npm install` and verify the dev server starts

Run: `npm install`
Run: `npx vite build` (verify build succeeds)
Run: `npx vitest run` (verify test infrastructure works — it's ok if 0 tests found)

---

## Task 2: Types, Utilities, and Unit Tests (TDD)

### Types

Create `src/types/user.ts`:
```typescript
import { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  nome: string
  email: string
  xpTotal: number
  streakDias: number
  ultimoConcluido: Timestamp | null
  createdAt?: Timestamp
}
```

Create `src/types/homework.ts`:
```typescript
import { Timestamp } from 'firebase/firestore'

export type Priority = 'tranquilo' | 'importante' | 'urgente'
export type HomeworkStatus = 'pendente' | 'concluido'

export interface Homework {
  id: string
  userId: string
  materia: string
  titulo: string
  descricao: string
  prazo: Timestamp
  prioridade: Priority
  exigeFoto: boolean
  status: HomeworkStatus
  dataConclusao: Timestamp | null
  xpGanho: number | null
  createdAt: Timestamp
}

export interface NewHomeworkData {
  materia: string
  titulo: string
  descricao: string
  prazo: Date
  prioridade: Priority
  exigeFoto: boolean
}
```

Create `src/types/auth.ts`:
```typescript
import { User } from 'firebase/auth'
import { UserProfile } from './user'

export interface AuthState {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
}
```

### Subjects utility

Create `src/utils/subjects.ts`:
```typescript
export interface Subject {
  name: string
  icon: string // Material Symbols icon name
  color: string // Tailwind bg class for chip
  textColor: string // Tailwind text class for chip
}

export const SUBJECTS_LIST: Subject[] = [
  { name: 'Matemática', icon: 'calculate', color: 'bg-blue-100', textColor: 'text-blue-700' },
  { name: 'Português', icon: 'menu_book', color: 'bg-rose-100', textColor: 'text-rose-700' },
  { name: 'História', icon: 'auto_stories', color: 'bg-amber-100', textColor: 'text-amber-700' },
  { name: 'Geografia', icon: 'public', color: 'bg-emerald-100', textColor: 'text-emerald-700' },
  { name: 'Ciências', icon: 'biotech', color: 'bg-purple-100', textColor: 'text-purple-700' },
  { name: 'Inglês', icon: 'translate', color: 'bg-sky-100', textColor: 'text-sky-700' },
  { name: 'Biologia', icon: 'eco', color: 'bg-green-100', textColor: 'text-green-700' },
  { name: 'Física', icon: 'science', color: 'bg-indigo-100', textColor: 'text-indigo-700' },
  { name: 'Química', icon: 'experiment', color: 'bg-orange-100', textColor: 'text-orange-700' },
  { name: 'Educação Física', icon: 'sports_soccer', color: 'bg-red-100', textColor: 'text-red-700' },
]

export function getSubjectStyle(subjectName: string): Subject {
  const found = SUBJECTS_LIST.find(s => s.name === subjectName)
  if (found) return found
  // Fallback for custom subjects
  return {
    name: subjectName,
    icon: 'school',
    color: 'bg-gray-100',
    textColor: 'text-gray-700',
  }
}
```

### Gamification utility — TDD

Create tests FIRST at `src/test/gamification.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { calculateGamification } from '../utils/gamification'

describe('calculateGamification', () => {
  it('awards +20 XP when completing homework with photo', () => {
    const result = calculateGamification({
      xpTotal: 100,
      streakDias: 3,
      ultimoConcluido: null,
    }, true, new Date('2025-10-24T15:00:00'))

    expect(result.xpGained).toBe(20)
    expect(result.newXp).toBe(120)
  })

  it('awards +10 XP when completing homework without photo', () => {
    const result = calculateGamification({
      xpTotal: 50,
      streakDias: 1,
      ultimoConcluido: null,
    }, false, new Date('2025-10-24T15:00:00'))

    expect(result.xpGained).toBe(10)
    expect(result.newXp).toBe(60)
  })

  it('increments streak on consecutive days', () => {
    // Yesterday was the last completion
    const yesterday = new Date('2025-10-23T18:00:00')
    const today = new Date('2025-10-24T15:00:00')

    const result = calculateGamification({
      xpTotal: 100,
      streakDias: 5,
      ultimoConcluido: { toDate: () => yesterday } as any,
    }, true, today)

    expect(result.newStreak).toBe(6)
  })

  it('keeps streak same if already completed today', () => {
    const earlierToday = new Date('2025-10-24T10:00:00')
    const now = new Date('2025-10-24T15:00:00')

    const result = calculateGamification({
      xpTotal: 100,
      streakDias: 3,
      ultimoConcluido: { toDate: () => earlierToday } as any,
    }, true, now)

    expect(result.newStreak).toBe(3)
  })

  it('resets streak to 1 when gap is more than 1 day', () => {
    const threeDaysAgo = new Date('2025-10-21T18:00:00')
    const today = new Date('2025-10-24T15:00:00')

    const result = calculateGamification({
      xpTotal: 100,
      streakDias: 10,
      ultimoConcluido: { toDate: () => threeDaysAgo } as any,
    }, true, today)

    expect(result.newStreak).toBe(1)
  })

  it('starts streak at 1 when no previous completion', () => {
    const result = calculateGamification({
      xpTotal: 0,
      streakDias: 0,
      ultimoConcluido: null,
    }, true, new Date('2025-10-24T15:00:00'))

    expect(result.newStreak).toBe(1)
  })
})
```

Then implement `src/utils/gamification.ts`:
```typescript
interface GamificationInput {
  xpTotal: number
  streakDias: number
  ultimoConcluido: { toDate: () => Date } | null
}

interface GamificationResult {
  xpGained: number
  newXp: number
  newStreak: number
}

export function calculateGamification(
  user: GamificationInput,
  exigeFoto: boolean,
  now: Date = new Date()
): GamificationResult {
  const xpGained = exigeFoto ? 20 : 10
  const newXp = user.xpTotal + xpGained

  let newStreak: number

  if (!user.ultimoConcluido) {
    // First ever completion
    newStreak = 1
  } else {
    const lastDate = user.ultimoConcluido.toDate()
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
    const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffMs = todayDay.getTime() - lastDay.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Same day — keep streak
      newStreak = user.streakDias
    } else if (diffDays === 1) {
      // Consecutive day — increment
      newStreak = user.streakDias + 1
    } else {
      // Gap — reset
      newStreak = 1
    }
  }

  return { xpGained, newXp, newStreak }
}
```

### Date utility — TDD

Create tests FIRST at `src/test/dateUtils.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { formatDeadline, isToday, isThisWeek } from '../utils/dateUtils'

describe('formatDeadline', () => {
  it('returns "Hoje" for today deadlines', () => {
    const now = new Date('2025-10-24T10:00:00')
    const deadline = new Date('2025-10-24T18:00:00')
    const result = formatDeadline(deadline, now)
    expect(result.isToday).toBe(true)
    expect(result.isOverdue).toBe(false)
    expect(result.text).toContain('Hoje')
  })

  it('detects overdue deadlines', () => {
    const now = new Date('2025-10-24T20:00:00')
    const deadline = new Date('2025-10-24T18:00:00')
    const result = formatDeadline(deadline, now)
    expect(result.isOverdue).toBe(true)
    expect(result.text).toContain('Atrasado')
  })

  it('returns "Amanhã" for tomorrow deadlines', () => {
    const now = new Date('2025-10-24T10:00:00')
    const deadline = new Date('2025-10-25T14:00:00')
    const result = formatDeadline(deadline, now)
    expect(result.text).toContain('Amanhã')
  })

  it('returns formatted date for future deadlines', () => {
    const now = new Date('2025-10-24T10:00:00')
    const deadline = new Date('2025-10-30T14:00:00')
    const result = formatDeadline(deadline, now)
    expect(result.isToday).toBe(false)
    expect(result.isOverdue).toBe(false)
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    const now = new Date('2025-10-24T10:00:00')
    const date = new Date('2025-10-24T18:00:00')
    expect(isToday(date, now)).toBe(true)
  })

  it('returns false for yesterday', () => {
    const now = new Date('2025-10-24T10:00:00')
    const date = new Date('2025-10-23T18:00:00')
    expect(isToday(date, now)).toBe(false)
  })
})

describe('isThisWeek', () => {
  it('returns true for a date within the current week', () => {
    // Oct 24 is a Friday
    const now = new Date('2025-10-24T10:00:00')
    const date = new Date('2025-10-26T18:00:00') // Sunday same week
    expect(isThisWeek(date, now)).toBe(true)
  })

  it('returns false for a date in the next week', () => {
    const now = new Date('2025-10-24T10:00:00')
    const date = new Date('2025-11-02T18:00:00')
    expect(isThisWeek(date, now)).toBe(false)
  })
})
```

Then implement `src/utils/dateUtils.ts`:
```typescript
import { format, isToday as fnsIsToday, isTomorrow, differenceInDays, startOfWeek, endOfWeek, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface DeadlineInfo {
  text: string
  isOverdue: boolean
  isToday: boolean
  isThisWeek: boolean
}

export function formatDeadline(deadline: Date, now: Date = new Date()): DeadlineInfo {
  const isOverdue = isBefore(deadline, now)
  const today = isToday(deadline, now)
  const thisWeek = isThisWeek(deadline, now)
  const timeStr = format(deadline, 'HH:mm')

  let text: string

  if (isOverdue) {
    text = `Atrasado — ${format(deadline, "dd/MM 'às' HH:mm")}`
  } else if (today) {
    text = `Hoje às ${timeStr}`
  } else if (isTomorrow(deadline)) {
    text = `Amanhã às ${timeStr}`
  } else {
    text = format(deadline, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
  }

  return { text, isOverdue, isToday: today, isThisWeek: thisWeek }
}

export function isToday(date: Date, now: Date = new Date()): boolean {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function isThisWeek(date: Date, now: Date = new Date()): boolean {
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }) // Sunday
  return date >= weekStart && date <= weekEnd
}

export function formatCompletionDate(date: Date): string {
  const today = isToday(date)
  if (today) {
    return `Concluído hoje às ${format(date, 'HH:mm')}`
  }
  return `Concluído em ${format(date, "dd/MM/yyyy 'às' HH:mm")}`
}
```

Run the tests:
```bash
npx vitest run
```
Expected: ALL tests pass.

---

## Task 3: Firebase Configuration and React Contexts

### Firebase config

Create `src/config/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
)

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
```

### FirebaseConfigAlert component

Create `src/components/common/FirebaseConfigAlert.tsx`:
```tsx
export default function FirebaseConfigAlert() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-card rounded-2xl border border-border p-6 text-center">
        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">settings</span>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">Configuração necessária</h1>
        <p className="text-text-secondary text-sm mb-4">
          O Firebase ainda não foi configurado. Preencha as credenciais no arquivo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-primary text-xs font-mono">.env</code> na raiz do projeto.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-left text-xs font-mono text-text-secondary space-y-1">
          <p>VITE_FIREBASE_API_KEY=...</p>
          <p>VITE_FIREBASE_AUTH_DOMAIN=...</p>
          <p>VITE_FIREBASE_PROJECT_ID=...</p>
          <p>VITE_FIREBASE_STORAGE_BUCKET=...</p>
          <p>VITE_FIREBASE_MESSAGING_SENDER_ID=...</p>
          <p>VITE_FIREBASE_APP_ID=...</p>
        </div>
        <p className="text-text-muted text-xs mt-4">
          Após preencher, reinicie o servidor de desenvolvimento.
        </p>
      </div>
    </div>
  )
}
```

### AuthContext

Create `src/contexts/AuthContext.tsx`:

This context must:
- Observe `onAuthStateChanged`
- Provide `signInWithEmail(email, password)`, `signUpWithEmail(nome, email, password)`, `signInWithGoogle()`, `logout()`
- On signup: create user in Firebase Auth, update displayName, create `users/{uid}` doc with `xpTotal: 0`, `streakDias: 0`, `ultimoConcluido: null`
- On Google sign-in: check if `users/{uid}` exists, create it if not (first access)
- Load `userProfile` from `users/{uid}` on auth state change
- Provide `refreshUserProfile()` to re-fetch after XP/streak updates
- Export `useAuth()` hook

### HomeworkContext

Create `src/contexts/HomeworkContext.tsx`:

This context must:
- Subscribe with `onSnapshot` to `homeworks` collection where `userId == auth.currentUser.uid`, ordered by `prazo` ascending
- Provide `homeworks` array (typed as `Homework[]`)
- Provide `addHomework(data: NewHomeworkData)` — creates a new doc with `status: 'pendente'`, `dataConclusao: null`, `xpGanho: null`, `createdAt: serverTimestamp()`
- Provide `completeHomework(id: string, exigeFoto: boolean)` — updates the homework doc to `status: 'concluido'`, sets `dataConclusao`, calculates XP using `calculateGamification()`, updates `xpGanho` on the homework, and atomically updates the user's `xpTotal`, `streakDias`, and `ultimoConcluido` in `users/{uid}`
- Provide `filter` state ('all' | 'today' | 'week') and `setFilter`
- Provide computed `stats: { totalToday, completedToday, progressPercent }`
- Export `useHomework()` hook

### After all three tasks, commit and verify

Run: `npx vitest run` — all tests must pass
Run: `npx tsc --noEmit` — no type errors
Commit all work.
