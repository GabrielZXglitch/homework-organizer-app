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
  const level = calculateLevel(xpTotal).level;
  
  return [
    // --- TAREFAS (11) ---
    { id: 'task_1', name: 'Primeiro Passo', description: 'Concluiu sua primeira tarefa.', icon: 'star', unlocked: completedCount >= 1 },
    { id: 'task_5', name: 'Aprendiz', description: 'Concluiu 5 tarefas.', icon: 'child_care', unlocked: completedCount >= 5 },
    { id: 'task_10', name: 'Focado', description: 'Concluiu 10 tarefas no total.', icon: 'school', unlocked: completedCount >= 10 },
    { id: 'task_25', name: 'Esforçado', description: 'Concluiu 25 tarefas.', icon: 'menu_book', unlocked: completedCount >= 25 },
    { id: 'task_50', name: 'Mestre da Rotina', description: 'Concluiu 50 tarefas no total.', icon: 'military_tech', unlocked: completedCount >= 50 },
    { id: 'task_75', name: 'Especialista', description: 'Concluiu 75 tarefas.', icon: 'psychology', unlocked: completedCount >= 75 },
    { id: 'task_100', name: 'Máquina de Estudar', description: 'Concluiu 100 tarefas no total.', icon: 'robot_2', unlocked: completedCount >= 100 },
    { id: 'task_200', name: 'Ciborgue', description: 'Concluiu 200 tarefas.', icon: 'precision_manufacturing', unlocked: completedCount >= 200 },
    { id: 'task_300', name: 'Titã dos Estudos', description: 'Concluiu 300 tarefas.', icon: 'account_balance', unlocked: completedCount >= 300 },
    { id: 'task_500', name: 'Super Estudante', description: 'Concluiu impressionantes 500 tarefas.', icon: 'diamond', unlocked: completedCount >= 500 },
    { id: 'task_1000', name: 'Gênio Indomável', description: 'Concluiu 1000 tarefas!', icon: 'auto_awesome', unlocked: completedCount >= 1000 },
    
    // --- OFENSIVAS (11) ---
    { id: 'streak_2', name: 'Dose Dupla', description: 'Atingiu 2 dias de ofensiva.', icon: 'looks_two', unlocked: streakDias >= 2 },
    { id: 'streak_3', name: 'Pegando o Ritmo', description: 'Atingiu 3 dias de ofensiva.', icon: 'directions_run', unlocked: streakDias >= 3 },
    { id: 'streak_5', name: 'Aquecimento', description: 'Atingiu 5 dias de ofensiva.', icon: 'local_fire_department', unlocked: streakDias >= 5 },
    { id: 'streak_7', name: 'Semana Perfeita', description: 'Atingiu 7 dias de ofensiva sem parar.', icon: 'whatshot', unlocked: streakDias >= 7 },
    { id: 'streak_10', name: 'Disciplina', description: 'Atingiu 10 dias de ofensiva.', icon: 'verified_user', unlocked: streakDias >= 10 },
    { id: 'streak_14', name: 'Imparável', description: 'Atingiu 14 dias de ofensiva (2 semanas).', icon: 'electric_bolt', unlocked: streakDias >= 14 },
    { id: 'streak_21', name: 'Três Semanas Focadas', description: 'Atingiu 21 dias de ofensiva.', icon: 'track_changes', unlocked: streakDias >= 21 },
    { id: 'streak_30', name: 'Hábito de Ferro', description: 'Atingiu 30 dias de ofensiva.', icon: 'fitness_center', unlocked: streakDias >= 30 },
    { id: 'streak_50', name: 'Inabalável', description: 'Atingiu 50 dias de ofensiva.', icon: 'shield', unlocked: streakDias >= 50 },
    { id: 'streak_100', name: 'Deus da Disciplina', description: 'Um verdadeiro monge. 100 dias de ofensiva.', icon: 'self_improvement', unlocked: streakDias >= 100 },
    { id: 'streak_365', name: 'Ano de Ouro', description: 'Um ano inteiro sem falhar um único dia!', icon: 'calendar_month', unlocked: streakDias >= 365 },

    // --- NÍVEIS (9) ---
    { id: 'level_2', name: 'Subindo o Degrau', description: 'Chegou ao Nível 2.', icon: 'upgrade', unlocked: level >= 2 },
    { id: 'level_5', name: 'Iniciante Curioso', description: 'Alcançou o Nível 5.', icon: 'emoji_events', unlocked: level >= 5 },
    { id: 'level_10', name: 'Lenda Urbana', description: 'Chegou ao Nível 10.', icon: 'workspace_premium', unlocked: level >= 10 },
    { id: 'level_15', name: 'Aluno Prodígio', description: 'Alcançou o Nível 15.', icon: 'moving', unlocked: level >= 15 },
    { id: 'level_25', name: 'Veterano', description: 'Chegou ao Nível 25.', icon: 'verified', unlocked: level >= 25 },
    { id: 'level_30', name: 'Grão-Mestre', description: 'Chegou ao Nível 30.', icon: 'local_police', unlocked: level >= 30 },
    { id: 'level_50', name: 'Mito', description: 'Atingiu o prestigiado Nível 50.', icon: 'stars', unlocked: level >= 50 },
    { id: 'level_75', name: 'Semi-Deus', description: 'Chegou ao Nível 75.', icon: 'brightness_7', unlocked: level >= 75 },
    { id: 'level_100', name: 'Divindade Acadêmica', description: 'O inimaginável: Nível 100.', icon: 'flare', unlocked: level >= 100 }
  ];
}
