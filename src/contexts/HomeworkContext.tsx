import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { Homework, NewHomeworkData } from '../types/homework'
import { useAuth } from './AuthContext'
import { isToday, isThisWeek } from '../utils/dateUtils'
import { calculateGamification } from '../utils/gamification'

type FilterType = 'all' | 'today' | 'week'

interface Stats {
  totalToday: number
  completedToday: number
  progressPercent: number
}

interface HomeworkContextType {
  homeworks: Homework[]
  addHomework: (data: NewHomeworkData) => Promise<void>
  completeHomework: (id: string, exigeFoto: boolean) => Promise<void>
  filter: FilterType
  setFilter: (f: FilterType) => void
  stats: Stats
  loading: boolean
}

const HomeworkContext = createContext<HomeworkContextType | null>(null)

export function HomeworkProvider({ children }: { children: ReactNode }) {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [homeworks, setHomeworks] = useState<Homework[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setHomeworks([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(
      collection(db, 'homeworks'),
      where('userId', '==', user.uid),
      orderBy('prazo', 'asc')
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const data: Homework[] = []
      snapshot.forEach(d => {
        data.push({ id: d.id, ...d.data() } as Homework)
      })
      setHomeworks(data)
      setLoading(false)
    })

    return () => unsub()
  }, [user])

  const addHomework = async (data: NewHomeworkData) => {
    if (!user) return
    await addDoc(collection(db, 'homeworks'), {
      ...data,
      userId: user.uid,
      status: 'pendente',
      dataConclusao: null,
      xpGanho: null,
      createdAt: serverTimestamp()
    })
  }

  const completeHomework = async (id: string, exigeFoto: boolean) => {
    if (!user || !userProfile) return

    const now = new Date()
    const result = calculateGamification(userProfile, exigeFoto, now)

    const batch = writeBatch(db)
    
    // Update homework
    const hwRef = doc(db, 'homeworks', id)
    batch.update(hwRef, {
      status: 'concluido',
      dataConclusao: serverTimestamp(),
      xpGanho: result.xpGained
    })

    // Update user stats
    const userRef = doc(db, 'users', user.uid)
    batch.update(userRef, {
      xpTotal: result.newXp,
      streakDias: result.newStreak,
      ultimoConcluido: serverTimestamp()
    })

    await batch.commit()
    await refreshUserProfile()
  }

  const filteredHomeworks = useMemo(() => {
    const now = new Date()
    return homeworks.filter(hw => {
      const p = hw.prazo.toDate()
      if (filter === 'today') return isToday(p, now)
      if (filter === 'week') return isThisWeek(p, now)
      return true
    })
  }, [homeworks, filter])

  const stats = useMemo(() => {
    const now = new Date()
    let totalToday = 0
    let completedToday = 0

    homeworks.forEach(hw => {
      if (isToday(hw.prazo.toDate(), now)) {
        totalToday++
        if (hw.status === 'concluido') completedToday++
      }
    })

    return {
      totalToday,
      completedToday,
      progressPercent: totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100)
    }
  }, [homeworks])

  return (
    <HomeworkContext.Provider value={{
      homeworks: filteredHomeworks,
      addHomework,
      completeHomework,
      filter,
      setFilter,
      stats,
      loading
    }}>
      {children}
    </HomeworkContext.Provider>
  )
}

export const useHomework = () => {
  const ctx = useContext(HomeworkContext)
  if (!ctx) throw new Error('useHomework must be used within HomeworkProvider')
  return ctx
}
