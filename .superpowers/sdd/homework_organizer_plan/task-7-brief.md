# Task 7 Brief: New Homework Page (`/new`)

Build the page for adding a new homework assignment.

## Global Constraints
- **Colors**: Primary `#4F46E5`, Success `#10B981`, Urgent `#F59E0B`, Card surface `#F8FAFC`, Border `#E2E8F0`.
- **Font**: Plus Jakarta Sans. **Shapes**: `rounded-xl`, `rounded-2xl`, `rounded-full`.
- **All UI text in Portuguese (pt-BR)**. **Mobile-first**: 375px-430px.
- Working directory: `/home/gabriel/project`

## Dependencies
- `src/contexts/HomeworkContext.tsx` — `useHomework()` → `{ addHomework }`
  - `addHomework(data: NewHomeworkData): Promise<void>`
- `src/types/homework.ts` — `NewHomeworkData = { materia, titulo, descricao, prazo: Date, prioridade, exigeFoto }`
- `src/utils/subjects.ts` — `SUBJECTS_LIST` array of `{ name, icon, color, textColor }`
- `src/components/layout/AppLayout.tsx` — with `showBack` and `onBack` props
- `react-router-dom` — `useNavigate()` for navigation

## Reference Design
See `/home/gabriel/project/homework-organizer-assets/stitch_homework_organizer_app_ui/3._novo_dever/screen.png` and `code.html` for structure.

---

## Create `src/pages/NewHomework.tsx`

### Header
- AppLayout with `showBack={true}`, title "Novo Dever", `onBack` navigates to "/"

### Form sections

#### 1. Subject Selection (Matéria)
- Label "Matéria" with a "+ Nova Matéria" button on the right
- Horizontally scrollable row of subject chips
- Each chip shows Material Symbol icon + name
- Active chip: `bg-primary text-white rounded-xl`
- Inactive chip: `bg-surface-card text-text-secondary rounded-xl border border-border`
- Pre-defined subjects from `SUBJECTS_LIST`
- "+ Nova Matéria" button opens a simple prompt/inline input to type a custom subject name
  - Custom subjects get added to the chips list temporarily

#### 2. Title (Título da Tarefa)
- Required text input
- Placeholder: "Ex: Exercícios de Álgebra Linear"
- `rounded-xl bg-surface-card border border-border h-12`

#### 3. Description (Descrição detalhada)
- Optional textarea
- Label with "Opcional" tag on the right
- Placeholder: "Descreva a atividade, páginas da apostila ou exercícios..."
- 3 rows, resizable
- `rounded-xl bg-surface-card border border-border`

#### 4. Date & Time (grid of 2 columns)
- **Data de entrega**: date input with calendar icon, default to today
- **Horário limite**: time input with clock icon, default to "23:59"
- Both required
- Both `rounded-xl bg-surface-card border border-border h-12`

#### 5. Priority (Prioridade)
- Three selectable cards/buttons in a row:
  - "Tranquilo" with relaxed icon — success green when selected
  - "Importante" with alert icon — primary indigo when selected
  - "Urgente" with warning icon — urgent amber when selected
- Default: "Tranquilo"
- Selected state: filled background + white text
- Unselected state: outlined/light background

#### 6. Photo Toggle (Comprovação com foto)
- Toggle/switch row
- Label: "Exigir foto de comprovação"
- Subtitle: "O aluno precisará tirar uma foto do dever pronto"
- Default: ON (true)
- When ON: toggle is indigo; camera icon visible
- When OFF: toggle is gray

### Submit Button
- Full-width: "Salvar Dever"
- `bg-primary hover:bg-primary-hover text-white rounded-xl h-12 font-semibold`
- Loading state with spinner
- Disabled until materia + titulo + date are filled

### Form Submission
1. Combine date + time inputs into a single `Date` object for `prazo`
2. Call `addHomework({ materia, titulo, descricao, prazo, prioridade, exigeFoto })`
3. On success: navigate to "/"
4. On error: show error toast/message

---

## After Implementation
- `npx tsc --noEmit` — no type errors
- Commit: `git commit -m "feat: add new homework creation page"`
