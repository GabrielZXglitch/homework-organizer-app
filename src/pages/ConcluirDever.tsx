import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHomeworks } from '../contexts/HomeworkContext';
import confetti from 'canvas-confetti';

export function ConcluirDever() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { homeworks, completeHomework } = useHomeworks();
  
  const hw = homeworks.find(h => h.id === id);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hw) {
      navigate('/app');
    }
  }, [hw, navigate]);

  if (!hw) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setPhotoData(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (hw.exigeFoto && !photoData) {
      alert("É necessário anexar uma foto como comprovante.");
      return;
    }

    setIsSubmitting(true);
    
    // Validação com API do Gemini
    if (photoData) {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          console.warn("VITE_GEMINI_API_KEY não está configurada, pulando validação de IA.");
          await new Promise(resolve => setTimeout(resolve, 800));
        } else {
          const base64Data = photoData.split(',')[1];
          const mimeType = photoData.split(';')[0].split(':')[1];
          
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Você é um assistente verificador de deveres de casa. Analise esta imagem e determine se é uma foto legítima de um dever de casa, anotações de aula, livro didático, material de estudo escolar/universitário, ou um estudante fazendo lição. Responda APENAS com a palavra 'SIM' se for válido ou 'NAO' se for uma foto inválida (ex: uma selfie aleatória, foto de comida, paisagem, etc)." },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 10,
              }
            })
          });

          if (!response.ok) {
            throw new Error(`Erro na API do Gemini: ${response.statusText}`);
          }

          const data = await response.json();
          const respostaGemini = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';
          
          if (!respostaGemini.includes('SIM')) {
            alert('A foto enviada não parece ser um dever de casa válido. Por favor, tire uma foto mais clara do seu material de estudo.');
            setIsSubmitting(false);
            return;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar foto com Gemini:", error);
        // Se a API falhar, podemos aceitar por precaução ou pedir pra tentar de novo
        // Aqui optamos por alertar e abortar, mas pode ser ajustado
        alert('Ocorreu um erro ao validar sua foto. Tente novamente.');
        setIsSubmitting(false);
        return;
      }
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#4F46E5', '#F59E0B']
    });

    await completeHomework(hw.id, !!photoData);
    
    setTimeout(() => {
      navigate('/app');
    }, 1500);
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-surface min-h-screen">
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md pt-safe">
        <div className="h-16 px-4 flex items-center justify-between md:max-w-md md:mx-auto">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <span className="text-base font-bold text-on-surface flex-1 text-center pr-10">Concluir Dever</span>
        </div>
      </header>

      <div className="px-4 pb-12 flex flex-col md:max-w-md md:mx-auto w-full gap-6 mt-2">
        <div className="text-center">
          <h2 className="text-xl font-bold text-on-surface mb-1">{hw.titulo}</h2>
          <p className="text-sm font-semibold text-on-surface-variant">Matéria: {hw.materia}</p>
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
              className="w-full relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl group"
            >
              {!photoData ? (
                <div className="w-full h-80 rounded-2xl bg-surface-container-lowest flex flex-col items-center justify-center p-6 shadow-sm transition-all duration-200 group-active:bg-surface-container-low border border-dashed border-outline-variant">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 transition-transform group-hover:scale-105">
                    <span className="material-symbols-outlined text-[40px]">photo_camera</span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface text-center max-w-[240px]">
                    Toque para abrir a câmera ou escolher da galeria
                  </p>
                  <p className="text-sm text-on-surface-variant text-center mt-2">
                    Formatos aceitos: JPG, PNG ou HEIC
                  </p>
                </div>
              ) : (
                <div className="w-full h-80 rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden relative">
                  <img className="w-full h-full object-cover" src={photoData} alt="Preview" />
                  <div className="absolute inset-0 bg-on-surface/20"></div>
                  <div className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
                    <span className="text-xs font-semibold text-on-surface">Foto anexada</span>
                  </div>
                </div>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-3xl">task</span>
            </div>
            <p className="text-sm font-semibold text-on-surface">Este dever não exige comprovação com foto.</p>
            <p className="text-sm text-on-surface-variant mt-1">Clique em Confirmar para finalizá-lo.</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <button 
            className="w-full h-12 bg-secondary hover:bg-success-active active:bg-success-active text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50" 
            onClick={handleConfirm} 
            disabled={isSubmitting || (hw.exigeFoto && !photoData)}
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined text-[22px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            )}
            <span>{isSubmitting ? 'Validando...' : 'Confirmar conclusão'}</span>
          </button>
          
          {hw.exigeFoto && photoData && !isSubmitting && (
            <button 
              className="w-full h-12 bg-surface-container-lowest active:bg-surface-container text-on-surface-variant font-bold rounded-xl flex items-center justify-center gap-1 transition-colors shadow-sm" 
              onClick={() => fileInputRef.current?.click()} 
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              <span>Tirar outra foto</span>
            </button>
          )}
          
          {!isSubmitting && (
            <button 
              className="w-full h-12 bg-transparent text-outline hover:text-on-surface active:bg-surface-container-low font-bold rounded-xl flex items-center justify-center transition-colors" 
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
