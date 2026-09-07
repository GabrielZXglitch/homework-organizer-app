import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHomeworks } from '../contexts/HomeworkContext';

export function Perfil() {
  const navigate = useNavigate();
  const { userProfile, currentUser, logout } = useAuth();
  const { homeworks } = useHomeworks();
  
  const completedCount = homeworks.filter(h => h.status === 'concluido').length;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-[var(--background)] min-h-screen animate-fade-in">
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md pt-safe border-b border-[var(--border)]">
        <div className="h-14 px-5 flex items-center justify-between md:max-w-2xl md:mx-auto">
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
          <div className="w-20 h-20 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px] text-[var(--text-muted)]">person</span>
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
