# Task 4 Brief: Shared UI Components and Layout

Build all shared UI components and the app layout shell. These components will be used by all page components.

## Global Constraints
- **Colors**: Primary `#4F46E5` (hover `#4338CA`), Success `#10B981` (active `#059669`), Urgent `#F59E0B`, Background `#FFFFFF`, Card surface `#F8FAFC`, Border `#E2E8F0`.
- **Font**: Plus Jakarta Sans (already configured in Tailwind).
- **Shapes**: `rounded-xl` on buttons/inputs, `rounded-2xl` on cards, `rounded-full` on chips/badges.
- **All UI text in Portuguese (pt-BR)**.
- **Mobile-first**: Optimized for 375px-430px width.
- Working directory: `/home/gabriel/project`

## Dependencies from Prior Tasks
- `src/utils/subjects.ts` — exports `SUBJECTS_LIST`, `getSubjectStyle(name)` with `{ name, icon, color, textColor }`
- `src/utils/gamification.ts` — exports `calculateGamification()`
- `src/contexts/AuthContext.tsx` — exports `useAuth()` hook returning `{ user, userProfile, loading, logout }`
- `src/contexts/HomeworkContext.tsx` — exports `useHomework()` hook returning `{ homeworks, filter, setFilter, stats }`
- Material Symbols Outlined font already loaded in index.html
- Tailwind colors available: `primary`, `primary-hover`, `primary-light`, `success`, `success-active`, `success-light`, `urgent`, `urgent-light`, `surface-card`, `border`, `text-primary`, `text-secondary`, `text-muted`

---

## Components to Create

### 1. `src/components/common/SubjectBadge.tsx`

A colored pill/chip showing the subject name with its icon.

Props: `{ subjectName: string, size?: 'sm' | 'md' }`

Uses `getSubjectStyle(subjectName)` to get the icon and colors.

```tsx
// Example output for "Matemática":
// <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
//   <span className="material-symbols-outlined text-sm">calculate</span>
//   Matemática
// </span>
```

### 2. `src/components/common/PriorityBadge.tsx`

Shows priority level with appropriate color.

Props: `{ priority: 'tranquilo' | 'importante' | 'urgente' }`

Color mapping:
- `tranquilo` → success green (`bg-success/10 text-success`)
- `importante` → primary indigo (`bg-primary/10 text-primary`)
- `urgente` → urgent amber (`bg-urgent/10 text-urgent`)

Labels (Portuguese):
- `tranquilo` → "Tranquilo"
- `importante` → "Importante"
- `urgente` → "Urgente"

### 3. `src/components/common/ProgressRing.tsx`

A circular SVG progress ring showing daily completion progress.

Props: `{ completed: number, total: number, size?: number }`

- SVG circle with stroke-dasharray for progress visualization
- Shows percentage number in the center
- Colors: track = `#E2E8F0`, progress = `#4F46E5`
- Smooth transition animation on progress change

### 4. `src/components/common/CelebrationModal.tsx`

A modal that appears after successfully completing a homework.

Props: `{ isOpen: boolean, onClose: () => void, xpGained: number, newStreak: number }`

- Full-screen overlay with backdrop blur
- Centered card with celebration content
- Shows "+20 XP" or "+10 XP" with animation (scale + fade in)
- Shows current streak with fire emoji 🔥
- Fires `canvas-confetti` on mount when isOpen becomes true
- "Continuar" button to dismiss
- Auto-dismiss after 3 seconds

### 5. `src/components/layout/Header.tsx`

Top fixed header bar.

Props: `{ title?: string, showBack?: boolean, onBack?: () => void }`

- Fixed to top with `backdrop-blur-xl` and subtle shadow
- If `showBack` is true: back arrow button + title text
- If `showBack` is false: title "Meus Deveres" or "Histórico" + search button + user avatar circle
- Avatar: purple circle with person icon (uses primary color), or first letter of user name
- Uses `useAuth()` to get user profile for the avatar

### 6. `src/components/layout/BottomNav.tsx`

Bottom fixed navigation bar with two tabs.

- Fixed to bottom, respects safe-area
- Two tabs: "Meus Deveres" (icon: `assignment`) and "Histórico" (icon: `history`)
- Active tab uses primary color, inactive uses text-muted
- Uses React Router's `useLocation()` and `useNavigate()` to handle active state
- Routes: "/" for Meus Deveres, "/history" for Histórico

### 7. `src/components/layout/AppLayout.tsx`

Layout wrapper for authenticated pages.

Props: `{ children: React.ReactNode, title?: string, showBack?: boolean, onBack?: () => void, showFab?: boolean }`

- Renders Header at top
- Main content area with proper padding (top for header, bottom for nav)
- BottomNav at bottom (hidden if `showBack` is true — detail pages don't show bottom nav)
- If `showFab` is true: floating action button "+" positioned above BottomNav
  - Circular indigo button with white "+" icon
  - `rounded-full` with shadow
  - Links to "/new" route

### 8. `src/components/homework/HomeworkCard.tsx`

Card component for displaying a homework item in the list.

Props: `{ homework: Homework, onClick: (id: string) => void }`

Uses `Homework` type from `src/types/homework.ts`.

- Card container: `bg-surface-card rounded-2xl p-4 border border-border`
- Row layout: check circle on left, content in middle
- Top row: SubjectBadge + PriorityBadge
- Title: semibold text
- Bottom row: deadline text (from `formatDeadline`) + camera badge if `exigeFoto`
- If deadline is today: highlight with amber/orange color
- If overdue: highlight with red color
- Entire card is clickable

### 9. `src/components/homework/FilterTabs.tsx`

Horizontal scrollable filter chips.

Props: `{ activeFilter: string, onFilterChange: (filter: string) => void, todayCount?: number }`

- Three chips: "Todos", "Para hoje" (with count badge), "Esta semana"
- Active chip: `bg-primary text-white rounded-full`
- Inactive chip: `bg-surface-card text-text-secondary rounded-full border border-border`
- Horizontally scrollable with `overflow-x-auto no-scrollbar`

---

## After Implementation

Verify:
- `npx tsc --noEmit` — no type errors
- `npx vite build` — build succeeds
- Commit all work

Do NOT create page components — those are separate tasks.
