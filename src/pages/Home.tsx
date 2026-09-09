import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHomeworks } from '../contexts/HomeworkContext';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Homework } from '../types';

const filterHomeworksByPeriod = (hws: Homework[], filter: string) => {
  const now = new Date();
  if (filter === 'hoje') {
    return hws.filter(hw => {
      const d = hw.prazo instanceof Timestamp ? hw.prazo.toDate() : hw.prazo;
      return isToday(d);
    });
  }
  if (filter === 'semana') {
    return hws.filter(hw => {
      const d = hw.prazo instanceof Timestamp ? hw.prazo.toDate() : hw.prazo;
      const diffTime = Math.abs(d.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 7;
    });
  }
  return hws;
};

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
    return format(d, "dd MMM, HH:mm", { locale: ptBR });
  };

  const getSubjectInitials = (subject: string) => subject.substring(0, 2).toUpperCase();

  return (
    <main className="flex-1 flex flex-col relative w-full px-5 md:max-w-2xl md:mx-auto pb-24 min-h-screen bg-[var(--background)] animate-fade-in">
      
      {/* Header & Stats - Sleek / Linear Vibe */}
      <header className="pt-10 pb-6 flex items-end justify-between border-b border-[var(--border)]">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full border border-[var(--border)] overflow-hidden bg-[var(--surface)] flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/perfil')}>
            {userProfile?.avatar || currentUser?.photoURL ? (
              <img src={userProfile?.avatar || currentUser?.photoURL || ''} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[20px] text-[var(--text-muted)]">person</span>
            )}
          </div>
          <div>
            <h2 className="text-[var(--text-muted)] text-sm mb-0.5">
              Olá, <span className="font-semibold text-[var(--text-main)]">{userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Aluno'}</span>
            </h2>
            <h1 className="text-[var(--text-main)] text-xl md:text-2xl font-bold tracking-tight leading-none">
              Tarefas Ativas
            </h1>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[var(--text-muted)] text-[10px] font-mono tracking-wider uppercase">Ofensiva</span>
            <span className="text-[var(--text-main)] text-sm font-semibold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              {userProfile?.streakDias || 0}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[var(--text-muted)] text-[10px] font-mono tracking-wider uppercase">Experiência</span>
            <span className="text-primary text-sm font-semibold flex items-center gap-1">
              {userProfile?.xpTotal || 0} XP
            </span>
          </div>
        </div>
      </header>

      {/* Filter Tabs & Add Button */}
      <div className="flex items-center justify-between mt-6 mb-8">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'hoje', label: 'Hoje' },
            { id: 'semana', label: 'Esta Semana' },
            { id: 'todos', label: 'Todas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as 'hoje' | 'semana' | 'todos')}
              className={`flex-shrink-0 text-sm font-medium transition-colors pb-1 border-b-2 ${
                filter === tab.id 
                  ? 'text-[var(--text-main)] border-[var(--text-main)]'
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button 
          onClick={() => navigate('/novo')}
          className="flex-shrink-0 bg-[var(--text-main)] text-[var(--background)] h-8 px-3 rounded-md font-medium text-xs flex items-center gap-1 hover:opacity-90 transition-opacity ml-4"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Novo
        </button>
      </div>

      {/* Task List */}
      <section className="flex flex-col gap-[1px] bg-[var(--border)] rounded-lg overflow-hidden border border-[var(--border)]">
        {loading ? (
          <div className="bg-[var(--surface)] p-8 text-center text-[var(--text-muted)] font-mono text-sm">Carregando tarefas...</div>
        ) : displayedHomeworks.length === 0 ? (
          <div className="bg-[var(--surface)] py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[var(--text-muted)]">done_all</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-main)]">Nenhuma tarefa ativa</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Tudo limpo por aqui.</p>
          </div>
        ) : (
          displayedHomeworks.map(hw => (
            <article 
              key={hw.id} 
              onClick={() => navigate(`/app/concluir/${hw.id}`)}
              className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Checkbox Placeholder */}
                <div className="flex-shrink-0 w-4 h-4 rounded-sm border border-[var(--text-muted)] group-hover:border-primary transition-colors flex items-center justify-center"></div>
                
                {/* ID & Title */}
                <div className="flex-1 min-w-0 flex items-baseline gap-2">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase shrink-0">
                    {getSubjectInitials(hw.materia)}-{hw.id.substring(0,4)}
                  </span>
                  <h3 className="text-sm font-medium text-[var(--text-main)] truncate">
                    {hw.titulo}
                  </h3>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 ml-7 sm:ml-0 shrink-0">
                {hw.prioridade === 'urgente' && (
                  <span className="text-[10px] uppercase font-mono text-[#F87171] bg-[#F87171]/10 px-1.5 py-0.5 rounded">Urgente</span>
                )}
                {hw.exigeFoto && (
                  <span className="material-symbols-outlined text-[14px] text-[var(--text-muted)]">photo_camera</span>
                )}
                <span className="text-xs font-mono text-[var(--text-muted)] w-24 text-right">
                  {formatPrazo(hw.prazo)}
                </span>
              </div>
            </article>
          ))
        )}
      </section>

      {/* FAB - Re-styled as a primary action button, more Vercel-like */}
      <aside className="fixed bottom-6 right-6 md:right-auto md:left-1/2 md:ml-[160px] z-40">
        <button 
          onClick={() => navigate('/app/novo')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--text-main)] text-[var(--background)] font-medium text-sm shadow-glow-subtle hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nova Tarefa
        </button>
      </aside>
    </main>
  );
}
