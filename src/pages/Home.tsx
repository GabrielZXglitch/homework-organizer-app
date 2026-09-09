import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHomeworks } from '../contexts/HomeworkContext';
import { calculateLevel } from '../utils/gamification';
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

import { Onboarding } from '../components/Onboarding';

export function Home() {
  const { userProfile, currentUser } = useAuth();
  const { homeworks, loading, deleteHomework } = useHomeworks();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'hoje' | 'semana' | 'todos'>('semana');
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('has_seen_onboarding'));

  const handleFinishOnboarding = () => {
    localStorage.setItem('has_seen_onboarding', 'true');
    setShowOnboarding(false);
  };

  const pendingHomeworks = homeworks.filter(hw => hw.status === 'pendente');
  const displayedHomeworks = filterHomeworksByPeriod(pendingHomeworks, filter);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const formatPrazo = (dateValue: Timestamp | Date) => {
    const d = dateValue instanceof Timestamp ? dateValue.toDate() : dateValue;
    if (isToday(d)) return `Hoje, ${format(d, 'HH:mm')}`;
    if (isTomorrow(d)) return `Amanhã, ${format(d, 'HH:mm')}`;
    return format(d, "dd MMM, HH:mm", { locale: ptBR });
  };

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const justLongPressed = useRef(false);

  const handleTouchStart = (id: string) => {
    if (isSelectionMode) return;
    longPressTimer.current = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedIds(new Set([id]));
      justLongPressed.current = true;
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleCardClick = (id: string) => {
    if (justLongPressed.current) {
      justLongPressed.current = false;
      return;
    }
    
    if (isSelectionMode) {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectedIds(next);
      if (next.size === 0) setIsSelectionMode(false);
    } else {
      navigate(`/app/concluir/${id}`);
    }
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Deletar ${selectedIds.size} dever(es) selecionado(s)?`)) {
      for (const id of selectedIds) {
        await deleteHomework(id);
      }
      cancelSelection();
    }
  };

  const getSubjectInitials = (subject: string) => subject.substring(0, 2).toUpperCase();

  if (showOnboarding) {
    return <Onboarding onFinish={handleFinishOnboarding} />;
  }

  return (
    <main className="flex-1 flex flex-col relative w-full px-5 md:max-w-2xl md:mx-auto pb-24 min-h-screen bg-[var(--background)] animate-fade-in">
      
      {/* Header & Stats - Sleek / Linear Vibe */}
      <header className="pt-10 pb-6 flex items-end justify-between border-b border-[var(--border)]">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full border border-[var(--border)] overflow-hidden bg-[var(--surface)] flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/app/perfil')}>
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
            <span className="text-[var(--text-muted)] text-[10px] font-mono tracking-wider uppercase">Nível {calculateLevel(userProfile?.xpTotal || 0).level}</span>
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
          onClick={() => navigate('/app/novo')}
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
              onClick={() => handleCardClick(hw.id)}
              onMouseDown={() => handleTouchStart(hw.id)}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchMove}
              onTouchStart={() => handleTouchStart(hw.id)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              className={`bg-[var(--surface)] hover:bg-[var(--surface-hover)] p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer transition-colors group ${
                isSelectionMode && selectedIds.has(hw.id) ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 pointer-events-none">
                {/* Checkbox Placeholder / Actual Checkbox */}
                {isSelectionMode ? (
                  <div className={`flex-shrink-0 w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
                    selectedIds.has(hw.id) ? 'bg-indigo-500 border-indigo-500' : 'border-[var(--text-muted)] group-hover:border-indigo-500'
                  }`}>
                    {selectedIds.has(hw.id) && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-4 h-4 rounded-sm border border-[var(--text-muted)] group-hover:border-primary transition-colors flex items-center justify-center"></div>
                )}
                
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

      {/* Action Bar / FAB */}
      {isSelectionMode ? (
        <aside className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 bg-[#1a1f2e] p-4 flex items-center justify-between z-40 animate-slide-up shadow-[0_-4px_20px_rgba(0,0,0,0.5)] md:max-w-2xl md:mx-auto md:rounded-t-xl">
          <button 
            onClick={cancelSelection}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Cancelar
          </button>
          
          <div className="flex gap-2">
            {selectedIds.size === 1 && (
              <button 
                onClick={() => navigate(`/app/editar/${Array.from(selectedIds)[0]}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Editar
              </button>
            )}
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              {selectedIds.size === 1 ? 'Deletar' : `Deletar (${selectedIds.size})`}
            </button>
          </div>
        </aside>
      ) : (
        <aside className="fixed bottom-24 right-6 md:right-auto md:left-1/2 md:ml-[160px] z-40 animate-fade-in">
          <button 
            onClick={() => navigate('/app/novo')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--text-main)] text-[var(--background)] font-medium text-sm shadow-glow-subtle hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nova Tarefa
          </button>
        </aside>
      )}
    </main>
  );
}
