import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHomeworks } from '../contexts/HomeworkContext';
import { calculateLevel, getAchievements } from '../utils/gamification';

import { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Perfil() {
  const navigate = useNavigate();
  const { userProfile, currentUser, logout } = useAuth();
  const { homeworks } = useHomeworks();
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  
  const completedCount = homeworks.filter(h => h.status === 'concluido').length;
  const xp = userProfile?.xpTotal || 0;
  const streak = userProfile?.streakDias || 0;
  
  const isPwaInstalled = window.matchMedia('(display-mode: standalone)').matches;
  const isNotificationsEnabled = 'Notification' in window && Notification.permission === 'granted';

  const { level, currentXP, nextLevelXP, progress } = calculateLevel(xp);
  const achievements = getAchievements(xp, streak, completedCount, isPwaInstalled, isNotificationsEnabled);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setLoadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), { avatar: dataUrl });
        } catch (err) {
          console.error(err);
        }
        setLoadingAvatar(false);
      };
      if (evt.target?.result) {
        img.src = evt.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-[var(--background)] min-h-screen animate-fade-in">
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md pt-safe border-b border-[var(--border)]">
        <div className="h-14 px-5 flex items-center justify-between md:max-w-2xl md:mx-auto">
          <button 
            onClick={() => navigate('/app')}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1 -ml-2 p-2"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)]">Perfil</span>
          <button 
            onClick={handleLogout}
            className="text-[var(--text-muted)] hover:text-red-400 transition-colors text-sm font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="px-5 pb-24 flex flex-col md:max-w-2xl md:mx-auto w-full mt-8">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-4 group">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
            <div className="w-24 h-24 rounded-full border-2 border-[var(--border)] bg-[var(--surface)] overflow-hidden flex items-center justify-center">
              {userProfile?.avatar || currentUser?.photoURL ? (
                <img src={userProfile?.avatar || currentUser?.photoURL || ''} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[40px] text-[var(--text-muted)]">person</span>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--text-main)] text-[var(--background)] flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
              title="Mudar foto"
            >
              <span className="material-symbols-outlined text-[16px]">{loadingAvatar ? 'sync' : 'photo_camera'}</span>
            </button>
          </div>
          <h1 className="text-[var(--text-main)] text-xl font-bold tracking-tight">
            {userProfile?.nome || currentUser?.displayName || 'Usuário'}
          </h1>
          <p className="text-[var(--text-muted)] text-sm">{currentUser?.email}</p>
        </div>

        <h2 className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)] mb-4 mt-2">Seu Nível</h2>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">shield</span>
              <span className="text-xl font-bold text-[var(--text-main)]">Nível {level}</span>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">{currentXP} / {nextLevelXP} XP</span>
          </div>
          <div className="w-full h-2.5 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
            <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-center mt-3 uppercase tracking-wider font-mono">
            {nextLevelXP - currentXP} XP para o próximo nível
          </p>
        </div>

        <h2 className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)] mb-4">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">local_fire_department</span>
            <span className="text-2xl font-bold text-[var(--text-main)]">{streak}</span>
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] text-center">Dias de Ofensiva</span>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">star</span>
            <span className="text-2xl font-bold text-[var(--text-main)]">{xp}</span>
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] text-center">XP Total</span>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex flex-col items-center justify-center gap-2 col-span-2">
            <span className="material-symbols-outlined text-[var(--text-main)] text-[24px]">task_alt</span>
            <span className="text-2xl font-bold text-[var(--text-main)]">{completedCount}</span>
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] text-center">Tarefas Resolvidas</span>
          </div>
        </div>

        <h2 className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)] mb-4">Conquistas</h2>
        <div className="grid grid-cols-1 gap-3">
          {achievements.map((ach) => (
            <div key={ach.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${ach.unlocked ? 'bg-[var(--surface)] border-[var(--border)]' : 'bg-transparent border-dashed border-[var(--border)] opacity-60 grayscale'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${ach.unlocked ? 'bg-primary/20 text-primary' : 'bg-[var(--surface)] text-[var(--text-muted)]'}`}>
                <span className="material-symbols-outlined text-[24px]">{ach.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold ${ach.unlocked ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{ach.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{ach.description}</p>
              </div>
              {ach.unlocked && (
                <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
