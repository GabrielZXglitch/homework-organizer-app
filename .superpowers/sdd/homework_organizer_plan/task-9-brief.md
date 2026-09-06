# Task 9 Brief: History Page (`/history`)

Build the history page showing completed homework items and student performance stats.

## Global Constraints
- **Colors**: Primary `#4F46E5`, Success `#10B981`, Urgent `#F59E0B`, Card surface `#F8FAFC`, Border `#E2E8F0`.
- **Font**: Plus Jakarta Sans. **Shapes**: `rounded-xl`, `rounded-2xl`, `rounded-full`.
- **All UI text in Portuguese (pt-BR)**. **Mobile-first**: 375px-430px.
- Working directory: `/home/gabriel/project`

## Dependencies
- `src/contexts/AuthContext.tsx` — `useAuth()` → `{ userProfile }` with `xpTotal`, `streakDias`
- `src/contexts/HomeworkContext.tsx` — `useHomework()` → `{ homeworks }`
  - NOTE: The context provides ALL homeworks (pending + completed). Filter completed ones with `homework.status === 'concluido'`
- `src/types/homework.ts` — `Homework` type
- `src/utils/dateUtils.ts` — `formatCompletionDate(date: Date)`
- `src/components/common/SubjectBadge.tsx`
- `src/components/layout/AppLayout.tsx`
- `react-router-dom` hooks

## Reference Design
See `/home/gabriel/project/homework-organizer-assets/stitch_homework_organizer_app_ui/5._hist_rico/screen.png` and `code.html`.

---

## Create `src/pages/History.tsx`

### Layout
Wrapped in `<AppLayout title="Histórico">` (no FAB, no back button — uses BottomNav).

### 1. Performance Summary Card (top)
- Full-width card with stats
- Left side:
  - Label: "DESEMPENHO ACADÊMICO" in small caps, success green
  - Headline: "X deveres concluídos" (count for current filter period)
  - Subtitle: motivational text like "Parabéns! Continue assim." or "Você está indo muito bem!"
- Right side:
  - Circular ring (like ProgressRing) showing completion percentage or trophy icon
  - `military_tech` Material Symbol in success green

### 2. Stats Row (below summary card)
Three stat cards in a row:
- **XP Total**: show `userProfile.xpTotal` with star icon
- **Streak**: show `userProfile.streakDias` with 🔥 fire emoji, "dias"
- **Este mês**: count of completed homeworks this month

Each stat card: `bg-surface-card rounded-xl p-3 border border-border text-center`

### 3. Filter Chips (horizontal scroll)
- "Este mês" (active by default) — indigo chip
- "Mês anterior"
- "Todas as matérias" (dropdown-like with tune icon)

Local filter state (not from context — this is independent from the home page filter):
```tsx
const [periodFilter, setPeriodFilter] = useState<'current' | 'previous'>('current')
const [subjectFilter, setSubjectFilter] = useState<string | null>(null) // null = all
```

Filter logic:
- "Este mês": completed homeworks where `dataConclusao` is in the current month
- "Mês anterior": completed homeworks where `dataConclusao` is in the previous month
- Subject filter: additionally filter by `materia` if a subject is selected

### 4. Completed Homework Cards List
For each completed homework, show a card:
- Left: green check circle icon (`check_circle` filled, success color)
- Subject badge + "Concluído" badge
- Title with strikethrough decoration (`line-through`)
- Description text (if present)
- Bottom row:
  - Clock icon + formatted completion date (e.g., "Concluído hoje às 15:30")
  - Camera badge "Foto enviada" if `exigeFoto === true` on that homework
  - XP badge: "+20 XP" or "+10 XP" from `homework.xpGanho`

Card styling: `bg-surface-card rounded-xl p-4 border border-border`

### 5. Empty State
When no completed homeworks match the filter:
- Centered area with a motivational illustration (book/star icon)
- Message: "Nenhum dever concluído neste período"
- Subtitle: "Complete seus deveres para ver seu progresso aqui!"

---

## After Implementation
- `npx tsc --noEmit` — no type errors
- Commit: `git commit -m "feat: add history page with performance stats"`
