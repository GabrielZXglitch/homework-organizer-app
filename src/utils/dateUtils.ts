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
