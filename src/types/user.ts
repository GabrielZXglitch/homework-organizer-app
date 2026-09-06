import { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  nome: string
  email: string
  xpTotal: number
  streakDias: number
  ultimoConcluido: Timestamp | null
  createdAt?: Timestamp
}
