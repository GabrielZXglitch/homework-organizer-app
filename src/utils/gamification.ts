import { isToday, isThisWeek, startOfDay, differenceInCalendarDays } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import type { Homework } from '../types';

export function calculateXP(withPhoto: boolean): number {
  return withPhoto ? 20 : 10;
}

function toDate(d: Timestamp | Date): Date {
  return d instanceof Timestamp ? d.toDate() : d;
}

export function calculateStreak(lastDate: Timestamp | Date | null, currentDate: Date, currentStreak: number): { streak: number, isConsecutive: boolean } {
  if (!lastDate) return { streak: 1, isConsecutive: true };
  
  const last = toDate(lastDate);
  const diff = differenceInCalendarDays(startOfDay(currentDate), startOfDay(last));

  if (diff === 0) {
    return { streak: currentStreak, isConsecutive: false };
  } else if (diff === 1) {
    return { streak: currentStreak + 1, isConsecutive: true };
  } else {
    return { streak: 1, isConsecutive: true };
  }
}

export function filterHomeworksByPeriod(homeworks: Homework[], period: 'hoje' | 'semana' | 'todos'): Homework[] {
  return homeworks.filter(hw => {
    if (period === 'todos') return true;
    const date = toDate(hw.prazo);
    if (period === 'hoje') return isToday(date);
    if (period === 'semana') return isThisWeek(date, { weekStartsOn: 1 });
    return true;
  });
}
