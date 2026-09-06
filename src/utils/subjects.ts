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
