import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, writeBatch, runTransaction, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { calculateXP, calculateStreak } from '../utils/gamification';
import type { Homework, HomeworkStatus } from '../types';
import { deadlineDate, effectiveStatus, nextTimingCheck } from '../utils/homeworkTiming';
import { notifyHomework } from '../utils/homeworkNotifications';

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
  const [storedHomeworks, setHomeworks] = useState<Homework[]>([]);
  const [now, setNow] = useState(() => new Date());
  const homeworks = useMemo(() => storedHomeworks.map(hw => ({
    ...hw, status: effectiveStatus(hw, now),
  })), [storedHomeworks, now]);
  const [loading, setLoading] = useState(true);

  // Recheck on load, at time boundaries, and when returning to the app.
  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    const inFlight = new Set<string>();
    let timer: ReturnType<typeof setTimeout>;

    const check = () => {
      clearTimeout(timer);
      const checkTime = new Date();
      setNow(checkTime);
      for (const hw of storedHomeworks) {
        if (hw.userId !== currentUser.uid || inFlight.has(hw.id)) continue;
        inFlight.add(hw.id);
        const sync = async () => {
          const status = effectiveStatus(hw, checkTime);
          if (status !== hw.status) {
            // Read the latest document so expiration cannot overwrite a concurrent completion.
            await runTransaction(db, async transaction => {
              const ref = doc(db, 'homeworks', hw.id);
              const snapshot = await transaction.get(ref);
              if (!snapshot.exists() || !active) return;
              const latest = snapshot.data() as Homework;
              if (latest.userId !== currentUser.uid) return;
              const latestStatus = effectiveStatus(latest, new Date());
              if (latest.status !== latestStatus) transaction.update(ref, { status: latestStatus });
            });
          }
          if (active) await notifyHomework(hw, checkTime, () => active);
        };
        void sync().catch(error => console.error('Erro ao atualizar prazo/lembrete:', error))
          .finally(() => inFlight.delete(hw.id));
      }
      timer = setTimeout(check, nextTimingCheck(storedHomeworks, checkTime));
    };
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    check();
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [currentUser, storedHomeworks]);

  useEffect(() => {
    if (!currentUser) {
      setHomeworks([]);
      setLoading(false);
      return;
    }

    setHomeworks([]);
    setLoading(true);
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
        const da = deadlineDate(a.prazo).getTime();
        const dbTime = deadlineDate(b.prazo).getTime();
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
      status: effectiveStatus({ status: 'pendente', prazo: hwData.prazo }, new Date()),
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
