import { User } from 'firebase/auth'
import { UserProfile } from './user'

export interface AuthState {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
}
