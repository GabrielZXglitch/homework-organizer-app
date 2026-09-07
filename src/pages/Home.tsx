import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHomeworks } from '../contexts/HomeworkContext';
import { filterHomeworksByPeriod } from '../utils/gamification';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export function Home() {
  const { userProfile, currentUser } = useAuth();
  const { homeworks, loading } = useHomeworks();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'hoje' | 'semana' | 'todos'>('semana');

  const pendingHomeworks = homeworks.filter(hw => hw.status === 'pendente');
  const displayedHomeworks = filterHomeworksByPeriod(pendingHomeworks, filter);

  const formatPrazo = (dateValue: Timestamp | Date) => {
    const d = dateValue instanceof Timestamp ? dateValue.toDate() : dateValue;
    if (isToday(d)) return `Hoje, ${format(d, 'HH:mm')}`;
    if (isTomorrow(d)) return `Amanhã, ${format(d, 'HH:mm')}`;
    return format(d, "EEEE, HH:mm", { locale: ptBR });
  };

  const subjectConfig: Record<string, { icon: string, bg: string, text: string }> = {
    'Matemática': { icon: '➗', bg: 'bg-primary-container', text: 'text-on-primary' },
    'Física': { icon: '⚛️', bg: 'bg-primary-container', text: 'text-on-primary' },
    'Biologia': { icon: '🧬', bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
    'História': { icon: '🏛️', bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' },
    'Português': { icon: '📚', bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  };

  return (
    <main className="flex-1 flex flex-col relative w-full px-4 md:max-w-md md:mx-auto pb-24 bg-surface min-h-screen">
      {/* Gamification Top Bar */}
      <div className="pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center border-2 border-primary overflow-hidden shrink-0">
            <span className="material-symbols-outlined text-outline text-2xl">person</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-on-surface">Olá, {userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Aluno'} 👋</span>
            <span className="text-xs text-on-surface-variant font-medium">Bora devorar esses deveres!</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-xl">
            <span className="material-symbols-outlined text-tertiary text-lg" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
            <span className="text-sm font-bold text-on-surface">{userProfile?.streakDias || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-xl">
            <span className="material-symbols-outlined text-primary text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
            <span className="text-sm font-bold text-on-surface">{userProfile?.xpTotal || 0} XP</span>
          </div>
        </div>
      </div>

      <div className="mt-4 mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Meus Deveres</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'hoje', label: 'Hoje' },
          { id: 'semana', label: 'Esta Semana' },
          { id: 'todos', label: 'Todos' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-all ${
              filter === tab.id 
                ? 'bg-primary text-on-primary font-bold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant font-semibold hover:bg-surface-container'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <section className="flex flex-col gap-3">
        {loading ? (
          <div className="py-8 text-center"><span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span></div>
        ) : displayedHomeworks.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-outline">check_circle</span>
            </div>
            <p className="text-base font-semibold text-on-surface">Tudo limpo!</p>
            <p className="text-sm text-on-surface-variant mt-1">Você não tem deveres para este período.</p>
          </div>
        ) : (
          displayedHomeworks.map(hw => {
            const config = subjectConfig[hw.materia] || { icon: '📝', bg: 'bg-surface-container-high', text: 'text-on-surface-variant' };
            return (
              <article key={hw.id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm transition-all duration-300">
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => navigate(`/app/concluir/${hw.id}`)}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center transition-all mt-0.5 hover:bg-secondary/20"
                  >
                    <span className="material-symbols-outlined text-[16px] text-transparent check-icon transition-colors">check</span>
                  </button>
                  <div className="flex-1 min-w-0" onClick={() => navigate(`/app/concluir/${hw.id}`)}>
                    <div className="flex items-center justify-between gap-1 mb-1.5 cursor-pointer">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                        <span className="text-[13px]">{config.icon}</span>
                        <span>{hw.materia}</span>
                      </span>
                      <span className={`text-xs font-semibold ${hw.prioridade === 'urgente' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                        {hw.prioridade.charAt(0).toUpperCase() + hw.prioridade.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-on-surface line-clamp-2 cursor-pointer">
                      {hw.titulo}
                    </h3>
                    <div className="flex flex-wrap items-center justify-between gap-y-2 mt-3 pt-2">
                      <div className="flex items-center gap-1 text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        <span className="capitalize">{formatPrazo(hw.prazo)}</span>
                      </div>
                      {hw.exigeFoto && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-container-low text-primary text-xs font-semibold">
                          <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>photo_camera</span>
                          <span>Comprovante</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      <aside className="fixed bottom-[5.25rem] right-4 md:right-auto md:left-1/2 md:ml-[160px] z-40">
        <button 
          onClick={() => navigate('/app/novo')}
          className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </aside>
    </main>
  );
}
