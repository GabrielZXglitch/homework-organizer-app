import { Timestamp } from 'firebase/firestore'

export type Priority = 'tranquilo' | 'importante' | 'urgente'
export type HomeworkStatus = 'pendente' | 'concluido'

export interface Homework {
  id: string
  userId: string
  materia: string
  titulo: string
  descricao: string
  prazo: Timestamp
  prioridade: Priority
  exigeFoto: boolean
  status: HomeworkStatus
  dataConclusao: Timestamp | null
  xpGanho: number | null
  createdAt: Timestamp
}

export interface NewHomeworkData {
  materia: string
  titulo: string
  descricao: string
  prazo: Date
  prioridade: Priority
  exigeFoto: boolean
}
