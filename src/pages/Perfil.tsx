import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHomeworks } from '../contexts/HomeworkContext';

import { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Perfil() {
  const navigate = useNavigate();
  const { userProfile, currentUser, logout } = useAuth();
  const { homeworks } = useHomeworks();
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  
  const completedCount = homeworks.filter(h => h.status === 'concluido').length;

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

        <h2 className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)] mb-4">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">local_fire_department</span>
            <span className="text-2xl font-bold text-[var(--text-main)]">{userProfile?.streakDias || 0}</span>
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] text-center">Dias de Ofensiva</span>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">star</span>
            <span className="text-2xl font-bold text-[var(--text-main)]">{userProfile?.xpTotal || 0}</span>
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] text-center">XP Total</span>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex flex-col items-center justify-center gap-2 col-span-2">
            <span className="material-symbols-outlined text-[var(--text-main)] text-[24px]">task_alt</span>
            <span className="text-2xl font-bold text-[var(--text-main)]">{completedCount}</span>
            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] text-center">Tarefas Resolvidas</span>
          </div>
        </div>
      </div>
    </main>
  );
}
