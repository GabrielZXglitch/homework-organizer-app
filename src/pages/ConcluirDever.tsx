import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHomeworks } from '../contexts/HomeworkContext';
import confetti from 'canvas-confetti';
import { prepareHomeworkPhoto, photoPayload, type HomeworkPhoto } from '../utils/homeworkPhotos';

export function ConcluirDever() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { homeworks, completeHomework } = useHomeworks();
  
  const hw = homeworks.find(h => h.id === id);
  const [photos, setPhotos] = useState<HomeworkPhoto[]>([]);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const busyRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout>>();
  const busy = isPreparing || isSubmitting;

  useEffect(() => () => clearTimeout(navigationTimer.current), []);

  useEffect(() => {
    if (!hw) navigate('/app');
  }, [hw, navigate]);

  if (!hw) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (busyRef.current || files.length === 0) return;
    busyRef.current = true;
    setIsPreparing(true);
    setError('');
    const added: HomeworkPhoto[] = [];
    const errors: string[] = [];
    try {
      // Sequential preparation preserves page order and limits peak memory use.
      for (const file of files) {
        try {
          added.push(await prepareHomeworkPhoto(file));
        } catch (cause) {
          errors.push(`${file.name}: ${cause instanceof Error ? cause.message : 'Não foi possível preparar a foto.'}`);
        }
      }
      setPhotos(previous => [...previous, ...added]);
      setError(errors.join(' '));
    } finally {
      busyRef.current = false;
      setIsPreparing(false);
    }
  };

  const handleConfirm = async () => {
    if (busyRef.current || hw.status === 'concluido') return;
    if (hw.exigeFoto && photos.length === 0) {
      setError('Adicione pelo menos uma foto do dever.');
      return;
    }
    busyRef.current = true;
    setIsSubmitting(true);
    setError('');
    let completed = false;
    try {
      for (let index = 0; index < photos.length; index++) {
        setProgress(`Validando foto ${index + 1} de ${photos.length}...`);
        let approved = false;
        try {
          const response = await fetch('/api/verify-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(photoPayload(photos[index].dataUrl)),
          });
          if (!response.ok) throw new Error('Erro na rede');
          approved = (await response.json()).aprovado === true;
        } catch {
          throw new Error(`Erro ao validar a foto ${index + 1}. Verifique sua conexão e tente novamente.`);
        }
        if (!approved) {
          throw new Error(`A foto ${index + 1} não foi aprovada. Confira se mostra material de estudo legível e remova ou substitua essa foto.`);
        }
      }
      setProgress('Salvando...');
      try {
        await completeHomework(hw.id, photos.length > 0);
      } catch {
        throw new Error('Não foi possível salvar a conclusão. Suas fotos foram mantidas. Tente novamente.');
      }
      completed = true;
      setProgress('Concluído!');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#4F46E5', '#10B981', '#FFFFFF'] });
      navigationTimer.current = setTimeout(() => navigate('/app'), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir o dever.');
    } finally {
      if (!completed) {
        busyRef.current = false;
        setIsSubmitting(false);
        setProgress('');
      }
    }
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-[var(--background)] min-h-screen animate-fade-in">
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md pt-safe border-b border-[var(--border)]">
        <div className="h-14 px-5 flex items-center justify-between md:max-w-2xl xl:max-w-[800px] 3xl:max-w-[1000px] md:mx-auto">
          <button 
            type="button" 
            disabled={busy}
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Voltar
          </button>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)] absolute left-1/2 -translate-x-1/2">Resolver Tarefa</span>
        </div>
      </header>

      <div className="px-5 pb-12 flex flex-col md:max-w-2xl xl:max-w-[800px] 3xl:max-w-[1000px] md:mx-auto w-full gap-8 mt-8">
        <div>
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
            {hw.materia}
          </span>
          <h2 className="text-2xl font-semibold text-[var(--text-main)] mt-1 tracking-tight leading-snug">{hw.titulo}</h2>
        </div>

        {hw.exigeFoto ? (
          <section className="flex flex-col gap-4" aria-label="Fotos do dever">
            <input type="file" accept="image/*" multiple className="hidden"
              aria-label="Selecionar fotos" ref={fileInputRef} onChange={handleFileChange} disabled={busy} />
            <input type="file" accept="image/*" capture="environment" className="hidden"
              aria-label="Tirar foto" ref={cameraInputRef} onChange={handleFileChange} disabled={busy} />
            <div>
              <h3 className="text-sm font-medium text-[var(--text-main)]">Fotos do dever</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Adicione uma foto de cada página feita. Pelo menos uma foto é obrigatória.</p>
            </div>
            {photos.length > 0 && (
              <>
                <p className="text-xs text-[var(--text-muted)]" aria-live="polite">{photos.length} {photos.length === 1 ? 'foto anexada' : 'fotos anexadas'}</p>
                <ol className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <li key={photo.id} className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
                      <img className="w-full aspect-[3/4] object-contain" src={photo.dataUrl} alt={`Página ${index + 1}: ${photo.name}`} />
                      <div className="flex items-center justify-between gap-2 p-2">
                        <span className="text-xs text-[var(--text-main)]">Página {index + 1}</span>
                        <button type="button" disabled={busy} aria-label={`Remover foto ${index + 1}`}
                          className="text-xs text-[var(--text-muted)] hover:text-red-500 disabled:opacity-50 min-h-11 px-2"
                          onClick={() => { setPhotos(previous => previous.filter(item => item.id !== photo.id)); setError(''); }}>
                          Remover
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-11 px-4 py-3 rounded-lg border border-dashed border-[var(--border)] text-sm text-[var(--text-main)] hover:border-primary disabled:opacity-50">
                {photos.length ? 'Adicionar mais fotos' : 'Selecionar fotos'}
              </button>
              <button type="button" disabled={busy} onClick={() => cameraInputRef.current?.click()}
                className="min-h-11 px-4 py-3 rounded-lg border border-[var(--border)] text-sm text-[var(--text-main)] disabled:opacity-50">
                Tirar foto
              </button>
            </div>
            {isPreparing && <p role="status" className="text-sm text-[var(--text-muted)]">Preparando fotos...</p>}
          </section>
        ) : (
          <div className="bg-[var(--surface)] p-6 rounded-lg border border-[var(--border)] flex items-start gap-3">
            <span className="material-symbols-outlined text-[var(--text-muted)]">info</span>
            <div>
              <p className="text-sm font-medium text-[var(--text-main)]">Nenhuma prova visual exigida.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Você pode marcar essa tarefa como concluída imediatamente.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[var(--border)]">
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <button 
            className="w-full h-11 bg-[var(--text-main)] text-[var(--background)] font-medium text-sm rounded-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-glow-subtle" 
            onClick={handleConfirm} 
            disabled={busy || hw.status === 'concluido' || (hw.exigeFoto && photos.length === 0)}
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : null}
            <span>{isSubmitting ? progress : 'Marcar como Concluído'}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
