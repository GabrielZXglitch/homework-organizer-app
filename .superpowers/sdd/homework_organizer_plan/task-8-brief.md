# Task 8 Brief: Complete Homework Page with Photo Validation (`/homework/:id/complete`)

Build the homework completion page with optional photo proof capture.

## Global Constraints
- **Colors**: Primary `#4F46E5`, Success `#10B981`, Urgent `#F59E0B`, Card surface `#F8FAFC`, Border `#E2E8F0`.
- **Font**: Plus Jakarta Sans. **Shapes**: `rounded-xl`, `rounded-2xl`, `rounded-full`.
- **All UI text in Portuguese (pt-BR)**. **Mobile-first**: 375px-430px.
- **CRITICAL: Photo is NEVER persisted to Firebase Storage.** Only kept as an ObjectURL in memory during confirmation. After completion, `URL.revokeObjectURL()` must be called.
- Working directory: `/home/gabriel/project`

## Dependencies
- `src/contexts/HomeworkContext.tsx` — `useHomework()` → `{ homeworks, completeHomework }`
  - `completeHomework(id: string, exigeFoto: boolean): Promise<{ xpGained: number, newStreak: number }>`
- `src/types/homework.ts` — `Homework` type
- `src/utils/dateUtils.ts` — `formatDeadline()`
- `src/utils/subjects.ts` — `getSubjectStyle()`
- `src/components/common/SubjectBadge.tsx`
- `src/components/common/CelebrationModal.tsx` — `{ isOpen, onClose, xpGained, newStreak }`
- `src/components/layout/AppLayout.tsx` — with `showBack`
- `react-router-dom` — `useParams()`, `useNavigate()`

## Reference Design
See `/home/gabriel/project/homework-organizer-assets/stitch_homework_organizer_app_ui/4._confirmar_com_foto/screen.png` and `code.html`.

---

## Create `src/pages/CompleteHomework.tsx`

### Route
- URL: `/homework/:id/complete`
- Extract `id` from URL params
- Find the homework in `homeworks` array by `id`
- If not found: show "Tarefa não encontrada" with back button

### Header Card (always visible)
- AppLayout with `showBack={true}`, title "Detalhes Da Tarefa"
- Top card showing:
  - SubjectBadge for the subject
  - "Etapa final" badge with verified icon
  - Homework title in headline font
  - Description in smaller text (if present)
  - Info box with tip about taking a clear photo (only if `exigeFoto`)
  - Deadline info formatted with `formatDeadline()`

### Photo Capture Area (only if `exigeFoto === true`)

#### Empty state (no photo captured yet)
- Large tappable area (full-width, ~320px height)
- Centered: camera icon in a circular indigo-tinted background
- Text: "Toque para abrir a câmera ou escolher da galeria"
- Subtitle: "Formatos aceitos: JPG, PNG ou HEIC"
- Tip pills: "Boa iluminação" and "Texto legível"
- Hidden `<input type="file" accept="image/*" capture="environment" />` triggered on tap

#### Photo captured state
- Shows the captured image as preview (full-width, object-cover)
- "Foto anexada" badge overlay in top-right corner
- "Tirar outra foto" button below the preview

#### Implementation
```tsx
const [photoUrl, setPhotoUrl] = useState<string | null>(null)
const fileInputRef = useRef<HTMLInputElement>(null)

const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    // Revoke previous URL if exists
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    const url = URL.createObjectURL(file)
    setPhotoUrl(url)
  }
}

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
  }
}, [photoUrl])
```

### No-photo mode (if `exigeFoto === false`)
- Show a simple info card: "Esta tarefa não exige comprovação fotográfica."
- Checkmark icon
- "Confirmar conclusão" button enabled immediately

### Confirm Button
- Full-width: "Confirmar conclusão"
- If `exigeFoto`: **disabled** until `photoUrl` is not null
- If not `exigeFoto`: enabled immediately
- `bg-success hover:bg-success-active text-white rounded-xl h-12 font-semibold`
- When disabled: `opacity-50 cursor-not-allowed`
- Loading state with spinner while saving

### On Confirm
1. Call `completeHomework(homework.id, homework.exigeFoto)`
2. Revoke the photo ObjectURL (if any) — `URL.revokeObjectURL(photoUrl)`
3. Set `photoUrl` to null
4. Show `CelebrationModal` with `xpGained` and `newStreak` from the result
5. After modal closes: navigate to "/"

### Important: completeHomework return type
The `completeHomework` function from HomeworkContext should return `{ xpGained, newStreak }` so this component can display them in the celebration modal. If the current implementation doesn't return these values, update the function signature and implementation in HomeworkContext to return them.

---

## After Implementation
- `npx tsc --noEmit` — no type errors
- Commit: `git commit -m "feat: add homework completion page with photo capture"`
