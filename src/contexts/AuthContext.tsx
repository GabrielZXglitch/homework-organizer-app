import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'
import { AuthState } from '../types/auth'
import { UserProfile } from '../types/user'

interface AuthContextType extends AuthState {
  signInWithEmail: (e: string, p: string) => Promise<void>
  signUpWithEmail: (n: string, e: string, p: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
  })

  const fetchProfile = async (uid: string) => {
    const docRef = doc(db, 'users', uid)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      setState(s => ({ ...s, userProfile: snap.data() as UserProfile }))
    } else {
      setState(s => ({ ...s, userProfile: null }))
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setState(s => ({ ...s, user }))
        await fetchProfile(user.uid)
      } else {
        setState({ user: null, userProfile: null, loading: false })
      }
      setState(s => ({ ...s, loading: false }))
    })
    return () => unsub()
  }, [])

  const refreshUserProfile = async () => {
    if (state.user) {
      await fetchProfile(state.user.uid)
    }
  }

  const signInWithEmail = async (e: string, p: string) => {
    await signInWithEmailAndPassword(auth, e, p)
  }

  const signUpWithEmail = async (nome: string, email: string, p: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, p)
    await updateProfile(res.user, { displayName: nome })
    const profile: UserProfile = {
      nome,
      email,
      xpTotal: 0,
      streakDias: 0,
      ultimoConcluido: null,
    }
    await setDoc(doc(db, 'users', res.user.uid), profile)
    await fetchProfile(res.user.uid)
  }

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider)
    const docRef = doc(db, 'users', res.user.uid)
    const snap = await getDoc(docRef)
    if (!snap.exists()) {
      const profile: UserProfile = {
        nome: res.user.displayName || '',
        email: res.user.email || '',
        xpTotal: 0,
        streakDias: 0,
        ultimoConcluido: null,
      }
      await setDoc(docRef, profile)
    }
    await fetchProfile(res.user.uid)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ ...state, signInWithEmail, signUpWithEmail, signInWithGoogle, logout, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
