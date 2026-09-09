import { useState } from 'react';

const slides = [
  {
    title: "Organize seus deveres 📋",
    desc: "Cadastre matéria, título, prazo e prioridade."
  },
  {
    title: "Prove que fez 📸",
    desc: "Tire uma foto do dever pronto para confirmar com IA."
  },
  {
    title: "Ganhe XP e suba de nível 🏆",
    desc: "Acumule XP a cada dever concluído e suba de nível."
  },
  {
    title: "Desbloqueie conquistas 🎖️",
    desc: "Complete desafios e ganhe conquistas exclusivas."
  }
];

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0D1117] flex flex-col items-center justify-center p-6 text-white animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold mb-4 tracking-tight text-[#c9d1d9]">{slides[currentSlide].title}</h1>
        <p className="text-lg text-[#8b949e] font-light leading-relaxed">{slides[currentSlide].desc}</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-8 pb-12">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-[#30363d]'}`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium h-12 rounded-lg transition-colors flex items-center justify-center text-lg"
        >
          {currentSlide === slides.length - 1 ? 'Começar' : 'Próximo'}
        </button>
      </div>
    </div>
  );
}
