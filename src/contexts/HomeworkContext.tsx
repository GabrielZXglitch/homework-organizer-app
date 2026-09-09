import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, writeBatch, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { calculateXP, calculateStreak } from '../utils/gamification';
import type { Homework, HomeworkStatus } from '../types';

interface HomeworkContextType {
  homeworks: Homework[];
  loading: boolean;
  addHomework: (hw: Omit<Homework, 'id' | 'userId' | 'status' | 'dataConclusao' | 'xpGanho' | 'createdAt'>) => Promise<void>;
  completeHomework: (homeworkId: string, withPhoto: boolean) => Promise<void>;
  updateHomework: (id: string, data: Partial<Homework>) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
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

  // Local Notification Logic
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();
      };
      const hasPendingToday = homeworks.some(hw => hw.status === 'pendente' && isToday(hw.prazo instanceof Timestamp ? hw.prazo.toDate() : new Date(hw.prazo)));
      const alreadyNotified = localStorage.getItem('notified_today') === new Date().toDateString();

      if (hasPendingToday && !alreadyNotified) {
        new Notification('Lembrete de Dever', {
          body: 'Você tem tarefas pendentes para entregar hoje! Não deixe para a última hora.',
          icon: '/logo.png'
        });
        localStorage.setItem('notified_today', new Date().toDateString());
      }
    }
  }, [homeworks]);

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

  async function updateHomework(id: string, data: Partial<Homework>) {
    if (!currentUser) return;
    const hwRef = doc(db, 'homeworks', id);
    await updateDoc(hwRef, data);
  }

  async function deleteHomework(id: string) {
    if (!currentUser) return;
    const hwRef = doc(db, 'homeworks', id);
    await deleteDoc(hwRef);
  }

  return (
    <HomeworkContext.Provider value={{ homeworks, loading, addHomework, completeHomework, updateHomework, deleteHomework }}>
      {children}
    </HomeworkContext.Provider>
  );
}
