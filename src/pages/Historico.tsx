import { useState } from 'react';
import { useHomeworks } from '../contexts/HomeworkContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export function Historico() {
  const { homeworks, loading } = useHomeworks();
  
  const [filter, setFilter] = useState<'mes' | 'todos'>('mes');
  
  const completedHomeworks = homeworks.filter(hw => hw.status === 'concluido');
  
  const displayed = completedHomeworks;

  const formatDate = (dateValue: Timestamp | Date) => {
    const d = dateValue instanceof Timestamp ? dateValue.toDate() : dateValue;
    return format(d, "dd MMM yyyy, HH:mm", { locale: ptBR });
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-[var(--background)] min-h-screen animate-fade-in">
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md pt-safe border-b border-[var(--border)]">
        <div className="h-14 px-5 flex items-center justify-between md:max-w-2xl xl:max-w-[800px] 3xl:max-w-[1000px] md:mx-auto">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)]">Histórico</span>
        </div>
      </header>

      <div className="px-5 pb-24 flex flex-col md:max-w-2xl xl:max-w-[800px] 3xl:max-w-[1000px] md:mx-auto w-full mt-6">
        <h1 className="text-[var(--text-main)] text-2xl font-bold tracking-tight mb-6">
          Tarefas Resolvidas
        </h1>

        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setFilter('mes')}
            className={`text-sm font-medium transition-colors pb-1 border-b-2 ${filter === 'mes' ? 'text-[var(--text-main)] border-[var(--text-main)]' : 'text-[var(--text-muted)] border-transparent'}`}
          >
            Este Mês
          </button>
          <button 
            onClick={() => setFilter('todos')}
            className={`text-sm font-medium transition-colors pb-1 border-b-2 ${filter === 'todos' ? 'text-[var(--text-main)] border-[var(--text-main)]' : 'text-[var(--text-muted)] border-transparent'}`}
          >
            Sempre
          </button>
        </div>

        <section className="flex flex-col gap-[1px] bg-[var(--border)] rounded-lg overflow-hidden border border-[var(--border)]">
          {loading ? (
             <div className="bg-[var(--surface)] p-8 text-center text-[var(--text-muted)] font-mono text-sm">Carregando histórico...</div>
          ) : displayed.length === 0 ? (
            <div className="bg-[var(--surface)] p-12 text-center">
              <span className="material-symbols-outlined text-[var(--text-muted)] text-3xl mb-2">history</span>
              <p className="text-[var(--text-main)] text-sm font-medium">Nenhuma tarefa resolvida ainda</p>
            </div>
          ) : (
            displayed.map(hw => (
              <article key={hw.id} className="bg-[var(--surface)] p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase truncate">{hw.materia}</span>
                    <h3 className="text-sm font-medium text-[var(--text-main)] truncate">{hw.titulo}</h3>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">Concluído em</span>
                  <span className="text-xs text-[var(--text-main)]">{formatDate(hw.dataConclusao || hw.prazo)}</span>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
