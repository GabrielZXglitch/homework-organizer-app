import { Timestamp } from 'firebase/firestore';

export interface User {
  userId: string;
  nome: string;
  email: string;
  xpTotal: number;
  streakDias: number;
  ultimoConcluido: Timestamp | Date | null;
  createdAt: Timestamp | Date;
}

export type HomeworkPriority = 'tranquilo' | 'importante' | 'urgente';
export type HomeworkStatus = 'pendente' | 'concluido';

export interface Homework {
  id: string;
  userId: string;
  materia: string;
  titulo: string;
  descricao: string;
  prazo: Timestamp | Date;
  prioridade: HomeworkPriority;
  exigeFoto: boolean;
  status: HomeworkStatus;
  dataConclusao: Timestamp | Date | null;
  xpGanho: number | null;
  createdAt: Timestamp | Date;
}

export interface SubjectOption {
  label: string;
  color: string;
  textColor: string;
  icon?: string;
}
