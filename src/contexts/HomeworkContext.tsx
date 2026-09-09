import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { calculateXP, calculateStreak } from '../utils/gamification';
import type { Homework, HomeworkStatus } from '../types';

interface HomeworkContextType {
  homeworks: Homework[];
  loading: boolean;
  addHomework: (hw: Omit<Homework, 'id' | 'userId' | 'status' | 'dataConclusao' | 'xpGanho' | 'createdAt'>) => Promise<void>;
  completeHomework: (homeworkId: string, withPhoto: boolean) => Promise<void>;
}

const HomeworkContext = createContext<HomeworkContextType>({} as HomeworkContextType);

// eslint-disable-next-line react-refresh/only-export-components
export function useHomeworks() {
  return useContext(HomeworkContext);
}

export function HomeworkProvider({ children }: { children: ReactNode }) {
  const { currentUser, userProfile } = useAuth();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setHomeworks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'homeworks'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hws: Homework[] = [];
      snapshot.forEach((doc) => {
        hws.push({ id: doc.id, ...doc.data() } as Homework);
      });
      // Sort by prazo asc locally
      hws.sort((a, b) => {
        const da = a.prazo instanceof Timestamp ? a.prazo.toMillis() : (a.prazo as Date).getTime();
        const dbTime = b.prazo instanceof Timestamp ? b.prazo.toMillis() : (b.prazo as Date).getTime();
        return da - dbTime;
      });
      setHomeworks(hws);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  async function addHomework(hwData: Omit<Homework, 'id' | 'userId' | 'status' | 'dataConclusao' | 'xpGanho' | 'createdAt'>) {
    if (!currentUser) return;
    const newDocRef = doc(collection(db, 'homeworks'));
    const newHw: Homework = {
      ...hwData,
      id: newDocRef.id,
      userId: currentUser.uid,
      status: 'pendente',
      dataConclusao: null,
      xpGanho: null,
      createdAt: new Date()
    };
    await setDoc(newDocRef, newHw);
  }

  async function completeHomework(homeworkId: string, withPhoto: boolean) {
    if (!currentUser || !userProfile) return;
    
    const hw = homeworks.find(h => h.id === homeworkId);
    if (!hw || hw.status === 'concluido') return;

    const batch = writeBatch(db);

    // 1. Update Homework
    const xp = calculateXP(withPhoto);
    const hwRef = doc(db, 'homeworks', homeworkId);
    batch.update(hwRef, {
      status: 'concluido' as HomeworkStatus,
      dataConclusao: new Date(),
      xpGanho: xp
    });

    // 2. Update User Gamification
    const now = new Date();
    const { streak } = calculateStreak(userProfile.ultimoConcluido, now, userProfile.streakDias);
    
    const userRef = doc(db, 'users', currentUser.uid);
    batch.update(userRef, {
      xpTotal: (userProfile.xpTotal || 0) + xp,
      streakDias: streak,
      ultimoConcluido: now
    });

    await batch.commit();
  }

  return (
    <HomeworkContext.Provider value={{ homeworks, loading, addHomework, completeHomework }}>
      {children}
    </HomeworkContext.Provider>
  );
}
