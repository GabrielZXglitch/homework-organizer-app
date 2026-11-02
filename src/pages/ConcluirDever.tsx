import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHomeworks } from '../contexts/HomeworkContext';
import confetti from 'canvas-confetti';
import { PhotoVerificationError, verifyHomeworkPhoto } from '../utils/verifyHomeworkPhoto';
import { prepareHomeworkPhoto, type HomeworkPhoto } from '../utils/homeworkPhotos';

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
  const approvedPhotos = useRef(new Set<string>());
  const session = useRef(0);
  const activeRequest = useRef<AbortController>();
  const cooldownUntil = useRef(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout>>();
  const busy = isPreparing || isSubmitting;

  useEffect(() => {
    session.current += 1;
    approvedPhotos.current.clear();
    setPhotos([]);
    setError('');
    setProgress('');
    busyRef.current = false;
    setIsPreparing(false);
    setIsSubmitting(false);
    return () => {
      session.current += 1;
      activeRequest.current?.abort();
      clearTimeout(navigationTimer.current);
    };
  }, [id]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(Math.max(0, Math.ceil((cooldownUntil.current - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (!hw) navigate('/app');
  }, [hw, navigate]);

  if (!hw) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (busyRef.current || files.length === 0) return;
    busyRef.current = true;
    const currentSession = session.current;
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
      if (session.current !== currentSession) return;
      setPhotos(previous => [...previous, ...added]);
      setError(errors.join(' '));
    } finally {
      if (session.current === currentSession) {
        busyRef.current = false;
        setIsPreparing(false);
      }
    }
  };

  const handleConfirm = async () => {
    if (busyRef.current || hw.status === 'concluido' || Date.now() < cooldownUntil.current) return;
    if (hw.exigeFoto && photos.length === 0) {
      setError('Adicione pelo menos uma foto do dever.');
      return;
    }
    busyRef.current = true;
    const currentSession = session.current;
    setIsSubmitting(true);
    setError('');
    let completed = false;
    try {
      for (let index = 0; index < photos.length; index++) {
        const photo = photos[index];
        if (approvedPhotos.current.has(photo.id)) continue;
        setProgress(`Validando foto ${index + 1} de ${photos.length}...`);
        const controller = new AbortController();
        activeRequest.current = controller;
        const approved = await verifyHomeworkPhoto(photo.dataUrl, index, controller);
        if (session.current !== currentSession) return;
        if (!approved) {
          throw new Error(`A foto ${index + 1} não foi aprovada. Confira se mostra o caderno, livro ou atividade na foto. Não é necessário ter letra bonita nem conseguir ler cada palavra. Se o material não aparece no enquadramento, tire outra foto.`);
        }
        approvedPhotos.current.add(photo.id);
      }
      if (session.current !== currentSession) return;
      setProgress('Salvando...');
      try {
        await completeHomework(hw.id, photos.length > 0);
      } catch {
        throw new Error('Não foi possível salvar a conclusão. Suas fotos foram mantidas. Tente novamente.');
      }
      if (session.current !== currentSession) return;
      completed = true;
      setProgress('Concluído!');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#4F46E5', '#10B981', '#FFFFFF'] });
      navigationTimer.current = setTimeout(() => navigate('/app'), 1000);
    } catch (cause) {
      if (session.current !== currentSession) return;
      if (cause instanceof PhotoVerificationError && cause.retryAfterSeconds !== undefined) {
        cooldownUntil.current = Date.now() + cause.retryAfterSeconds * 1000;
        setCooldownSeconds(cause.retryAfterSeconds);
      }
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir o dever.');
    } finally {
      if (session.current === currentSession) activeRequest.current = undefined;
      if (!completed && session.current === currentSession) {
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
            <input type="file" accept="image/*,.heic,.heif,.hif" multiple className="hidden"
              aria-label="Selecionar fotos" ref={fileInputRef} onChange={handleFileChange} disabled={busy} />
            <input type="file" accept="image/*,.heic,.heif,.hif" capture="environment" className="hidden"
              aria-label="Tirar foto" ref={cameraInputRef} onChange={handleFileChange} disabled={busy} />
            <div>
              <h3 className="text-sm font-medium text-[var(--text-main)]">Fotos do dever</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Adicione uma foto de cada página feita. Sua letra não precisa ser perfeita.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Aceita HEIC/HEIF, JPG, PNG e outros formatos de imagem compatíveis.</p>
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
                          onClick={() => { approvedPhotos.current.delete(photo.id); setPhotos(previous => previous.filter(item => item.id !== photo.id)); setError(''); }}>
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
          {cooldownSeconds > 0 && <p role="status" className="text-sm text-[var(--text-muted)]">Você poderá continuar em {cooldownSeconds}s. As fotos aprovadas serão mantidas nesta tela.</p>}
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <button 
            className="w-full h-11 bg-[var(--text-main)] text-[var(--background)] font-medium text-sm rounded-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-glow-subtle" 
            onClick={handleConfirm} 
            disabled={busy || cooldownSeconds > 0 || hw.status === 'concluido' || (hw.exigeFoto && photos.length === 0)}
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : null}
            <span>{isSubmitting ? progress : cooldownSeconds > 0 ? `Aguarde ${cooldownSeconds}s` : 'Marcar como Concluído'}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
