import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHomeworks } from '../contexts/HomeworkContext';
import confetti from 'canvas-confetti';

export function ConcluirDever() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { homeworks, completeHomework, deleteHomework } = useHomeworks();
  
  const hw = homeworks.find(h => h.id === id);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hw) navigate('/app');
  }, [hw, navigate]);

  if (!hw) return null;

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que quer deletar este dever?")) {
      await deleteHomework(hw.id);
      navigate('/app');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) setPhotoData(evt.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (hw.exigeFoto && !photoData) {
      alert("Comprovante visual exigido.");
      return;
    }

    setIsSubmitting(true);
    
    if (photoData) {
      try {
        const base64Data = photoData.split(',')[1];
        const mimeType = photoData.split(';')[0].split(':')[1];

        const response = await fetch('/api/verify-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data, mimeType })
        });
        
        if (!response.ok) throw new Error('Erro na rede');

        const { aprovado } = await response.json();
        
        if (!aprovado) {
          alert('Validação falhou. Certifique-se de que a imagem contenha material de estudo válido.');
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error("Verification error:", error);
        alert('Erro ao validar imagem.');
        setIsSubmitting(false);
        return;
      }
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#10B981', '#FFFFFF']
    });

    await completeHomework(hw.id, !!photoData);
    
    setTimeout(() => {
      navigate('/app');
    }, 1000);
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-[var(--background)] min-h-screen animate-fade-in">
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md pt-safe border-b border-[var(--border)]">
        <div className="h-14 px-5 flex items-center justify-between md:max-w-2xl md:mx-auto">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Voltar
          </button>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)] absolute left-1/2 -translate-x-1/2">Resolver Tarefa</span>
          <div className="flex items-center gap-3">
            {hw.status === 'pendente' && (
              <button 
                onClick={() => navigate(`/app/editar/${hw.id}`)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                title="Editar"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            )}
            <button 
              onClick={handleDelete}
              className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
              title="Deletar"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 pb-12 flex flex-col md:max-w-2xl md:mx-auto w-full gap-8 mt-8">
        <div>
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
            {hw.materia}
          </span>
          <h2 className="text-2xl font-semibold text-[var(--text-main)] mt-1 tracking-tight leading-snug">{hw.titulo}</h2>
        </div>

        {hw.exigeFoto ? (
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full relative overflow-hidden focus:outline-none rounded-lg group text-left"
            >
              {!photoData ? (
                <div className="w-full aspect-[4/3] rounded-lg bg-[var(--surface)] flex flex-col items-center justify-center p-6 border border-dashed border-[var(--border)] hover:border-primary/50 transition-colors">
                  <span className="material-symbols-outlined text-[32px] text-[var(--text-muted)] mb-3 group-hover:text-primary transition-colors">add_photo_alternate</span>
                  <p className="text-sm font-medium text-[var(--text-main)]">Enviar Comprovante</p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase mt-2">Obrigatório</p>
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-lg shadow-sm overflow-hidden relative border border-[var(--border)]">
                  <img className="w-full h-full object-cover" src={photoData} alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">Trocar Imagem</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-secondary/90 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-white text-[14px]">done</span>
                    <span className="text-[10px] font-mono uppercase text-white">Anexado</span>
                  </div>
                </div>
              )}
            </button>
          </div>
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
          <button 
            className="w-full h-11 bg-[var(--text-main)] text-[var(--background)] font-medium text-sm rounded-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-glow-subtle" 
            onClick={handleConfirm} 
            disabled={isSubmitting || (hw.exigeFoto && !photoData)}
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            ) : null}
            <span>{isSubmitting ? 'Validando...' : 'Marcar como Concluído'}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
