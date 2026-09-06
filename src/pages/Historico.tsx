import { useAuth } from '../contexts/AuthContext';
import { useHomeworks } from '../contexts/HomeworkContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export function Historico() {
  const { userProfile, logout } = useAuth();
  const { homeworks, loading } = useHomeworks();

  const completedHomeworks = homeworks.filter(hw => hw.status === 'concluido').sort((a, b) => {
    const da = a.dataConclusao instanceof Timestamp ? a.dataConclusao.toMillis() : (a.dataConclusao as Date)?.getTime() || 0;
    const dbTime = b.dataConclusao instanceof Timestamp ? b.dataConclusao.toMillis() : (b.dataConclusao as Date)?.getTime() || 0;
    return dbTime - da; // desc
  });

  const formatData = (dateValue: Timestamp | Date | null) => {
    if (!dateValue) return '';
    const d = dateValue instanceof Timestamp ? dateValue.toDate() : dateValue;
    return format(d, "dd 'de' MMM, yyyy", { locale: ptBR });
  };

  return (
    <main className="flex-1 flex flex-col relative w-full px-4 md:max-w-md md:mx-auto pb-24 bg-surface min-h-screen">
      <div className="pt-6 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Histórico</h1>
        <button onClick={logout} className="p-2 text-error hover:bg-error/10 rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>

      <div className="bg-surface-container-low p-4 rounded-2xl mb-6 mt-2 flex justify-around">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-primary">{completedHomeworks.length}</span>
          <span className="text-xs text-on-surface-variant uppercase font-semibold">Concluídos</span>
        </div>
        <div className="w-px bg-outline-variant"></div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-secondary">{userProfile?.xpTotal || 0}</span>
          <span className="text-xs text-on-surface-variant uppercase font-semibold">XP Total</span>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        {loading ? (
          <div className="py-8 text-center"><span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span></div>
        ) : completedHomeworks.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-outline">history</span>
            </div>
            <p className="text-base font-semibold text-on-surface">Nenhum histórico</p>
            <p className="text-sm text-on-surface-variant mt-1">Os deveres que você concluir aparecerão aqui.</p>
          </div>
        ) : (
          completedHomeworks.map(hw => (
            <article key={hw.id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm opacity-75">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-on-surface line-clamp-1 line-through">
                    {hw.titulo}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-on-surface-variant">
                    <span>{hw.materia}</span>
                    <span>•</span>
                    <span>{formatData(hw.dataConclusao)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-lg">
                  <span className="text-xs font-bold text-primary">+{hw.xpGanho} XP</span>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
