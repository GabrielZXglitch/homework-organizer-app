import { Timestamp } from 'firebase/firestore';
import type { Homework, HomeworkStatus } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function deadlineDate(prazo: Homework['prazo']): Date {
  return prazo instanceof Timestamp ? prazo.toDate() : prazo;
}

export function effectiveStatus(hw: Pick<Homework, 'status' | 'prazo'>, now: Date): HomeworkStatus {
  if (hw.status === 'concluido') return 'concluido';
  return deadlineDate(hw.prazo).getTime() < now.getTime() ? 'atrasado' : 'pendente';
}

export function reminderTimes(prazo: Homework['prazo']) {
  const deadline = deadlineDate(prazo);
  const today = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const previousDay = new Date(today);
  previousDay.setDate(previousDay.getDate() - 1);
  // Start on the previous day, at least 24 real hours early even across DST.
  return {
    advance: Math.min(previousDay.getTime(), deadline.getTime() - DAY_MS),
    today: today.getTime(),
  };
}

export function dueReminder(hw: Homework, now: Date): 'advance' | 'today' | null {
  if (effectiveStatus(hw, now) !== 'pendente') return null;
  const times = reminderTimes(hw.prazo);
  if (now.getTime() >= times.today) return 'today';
  if (now.getTime() >= times.advance) return 'advance';
  return null;
}

export function reminderKey(hw: Homework, stage: 'advance' | 'today'): string {
  return `homework-reminder:${hw.userId}:${hw.id}:${deadlineDate(hw.prazo).getTime()}:${stage}`;
}

export function nextTimingCheck(homeworks: Homework[], now: Date): number {
  let delay = 60_000;
  for (const hw of homeworks) {
    if (hw.status === 'concluido') continue;
    const times = reminderTimes(hw.prazo);
    for (const time of [times.advance, times.today, deadlineDate(hw.prazo).getTime() + 1]) {
      if (time > now.getTime()) delay = Math.min(delay, time - now.getTime());
    }
  }
  return delay;
}
