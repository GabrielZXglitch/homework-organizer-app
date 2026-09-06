# Task 6 Brief: Home Page — Meus Deveres (`/`)

Build the main home page showing pending homework items with filters and daily progress.

## Global Constraints
- **Colors**: Primary `#4F46E5`, Success `#10B981`, Urgent `#F59E0B`, Card surface `#F8FAFC`, Border `#E2E8F0`.
- **Font**: Plus Jakarta Sans. **Shapes**: `rounded-xl`, `rounded-2xl`, `rounded-full`.
- **All UI text in Portuguese (pt-BR)**. **Mobile-first**: 375px-430px.
- Working directory: `/home/gabriel/project`

## Dependencies
- `src/contexts/AuthContext.tsx` — `useAuth()` → `{ userProfile }`
- `src/contexts/HomeworkContext.tsx` — `useHomework()` → `{ homeworks, filter, setFilter, stats, loading }`
  - `stats: { totalToday: number, completedToday: number, progressPercent: number }`
  - `filter`: `'all' | 'today' | 'week'`
  - `homeworks`: `Homework[]` (only pending ones, filtered by current filter)
- `src/components/layout/AppLayout.tsx` — layout wrapper with header, bottom nav, and FAB
- `src/components/homework/HomeworkCard.tsx` — card component
- `src/components/homework/FilterTabs.tsx` — filter chips
- `src/components/common/ProgressRing.tsx` — circular progress
- `src/types/homework.ts` — `Homework` type with `prazo` as Firestore Timestamp (has `.toDate()`)
- `src/utils/dateUtils.ts` — `formatDeadline()`, `isToday()`, `isThisWeek()`

## Reference Design
See `/home/gabriel/project/homework-organizer-assets/stitch_homework_organizer_app_ui/2._home_meus_deveres/screen.png` for visual reference.

---

## Create `src/pages/Home.tsx`

### Structure

Wrapped in `<AppLayout title="Meus Deveres" showFab>`:

#### 1. Date & Progress Section
- Left side: "Hoje, [day] de [month name]" in headline font
  - Below: pulsing dot + "X tarefas pendentes para hoje" in smaller text
- Right side: `<ProgressRing>` showing today's completion stats from `stats`

#### 2. Filter Tabs
- `<FilterTabs>` with `filter` and `setFilter` from context
- Show count of today's pending tasks on the "Para hoje" chip

#### 3. Homework Cards List
- Map over `homeworks` array (already filtered by context)
- Render `<HomeworkCard>` for each
- Sort: urgent first, then by deadline ascending
- On card click: navigate to `/homework/${homework.id}/complete`

#### 4. Empty State
When no homeworks match the filter:
- Centered illustration area with a large checkmark or book icon
- Message: "Nenhum dever pendente!" (if filter is 'all')
- Or: "Nenhum dever para hoje! 🎉" (if filter is 'today')
- Or: "Nenhum dever esta semana!" (if filter is 'week')
- Subtitle: "Toque no + para adicionar um novo dever"

#### 5. Loading State
While `loading` is true, show a simple centered spinner or skeleton cards.

### Navigation
- FAB "+" button → navigates to `/new`
- Card click → navigates to `/homework/:id/complete`
- Bottom nav "Histórico" → navigates to `/history`

---

## After Implementation
- `npx tsc --noEmit` — no type errors
- Commit: `git commit -m "feat: add home page with homework list and filters"`
