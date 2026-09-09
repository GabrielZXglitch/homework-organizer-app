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

export function calculateLevel(xpTotal: number) {
  const level = Math.floor(Math.sqrt(xpTotal / 50)) + 1;
  const currentLevelBaseXP = Math.pow(level - 1, 2) * 50;
  const nextLevelBaseXP = Math.pow(level, 2) * 50;
  const xpInLevel = xpTotal - currentLevelBaseXP;
  const xpRequiredForNextLevel = nextLevelBaseXP - currentLevelBaseXP;
  const progress = (xpInLevel / xpRequiredForNextLevel) * 100;

  return {
    level,
    currentXP: xpInLevel,
    nextLevelXP: xpRequiredForNextLevel,
    progress
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function getAchievements(xpTotal: number, streakDias: number, completedCount: number): Achievement[] {
  return [
    {
      id: 'first_task',
      name: 'Primeiro Passo',
      description: 'Concluiu sua primeira tarefa.',
      icon: 'star',
      unlocked: completedCount >= 1
    },
    {
      id: 'streak_3',
      name: 'Pegando o Ritmo',
      description: 'Atingiu 3 dias de ofensiva.',
      icon: 'local_fire_department',
      unlocked: streakDias >= 3
    },
    {
      id: 'streak_7',
      name: 'Imparável',
      description: 'Atingiu 7 dias de ofensiva.',
      icon: 'whatshot',
      unlocked: streakDias >= 7
    },
    {
      id: 'tasks_10',
      name: 'Focado',
      description: 'Concluiu 10 tarefas no total.',
      icon: 'school',
      unlocked: completedCount >= 10
    },
    {
      id: 'tasks_50',
      name: 'Mestre',
      description: 'Concluiu 50 tarefas no total.',
      icon: 'military_tech',
      unlocked: completedCount >= 50
    },
    {
      id: 'level_10',
      name: 'Lenda Viva',
      description: 'Chegou ao Nível 10.',
      icon: 'workspace_premium',
      unlocked: calculateLevel(xpTotal).level >= 10
    }
  ];
}
