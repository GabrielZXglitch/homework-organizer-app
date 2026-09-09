import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RevealOnScroll = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {children}
    </div>
  );
};

export function LandingPage() {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/app', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  const faqs = [
    { q: "O app é gratuito?", a: "Sim, 100% gratuito." },
    { q: "Precisa instalar?", a: "Não, roda no navegador. Mas pode instalar como PWA no celular." },
    { q: "A foto fica salva?", a: "Não, a foto é usada só pra confirmar na hora e descartada." },
    { q: "Funciona em qualquer escola?", a: "Sim, basta criar uma conta com e-mail e senha." },
    { q: "A confirmação com foto aceita qualquer imagem?", a: "Não — o app usa inteligência artificial para verificar se a foto é de um material de estudo real (caderno, livro, folha de exercícios). Fotos de objetos aleatórios são rejeitadas automaticamente." }
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] font-sans overflow-x-hidden selection:bg-primary/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold tracking-tight text-lg whitespace-nowrap">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
            <span className="md:hidden">HW Organizer</span>
            <span className="hidden md:inline">Homework Organizer</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              Entrar
            </button>
            <button onClick={() => navigate('/login')} className="text-sm font-medium bg-[var(--text-main)] text-[var(--background)] px-3 py-1.5 rounded hover:opacity-90 transition-opacity">
              Cadastrar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
        <div className="absolute top-1/2 left-1/2 md:left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 md:left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-20"></div>
        
        <div className="flex-1 flex flex-col items-center md:items-start relative z-10 w-full">
          <RevealOnScroll>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 max-w-4xl mx-auto md:mx-0 leading-[1.1]">
              Chega de enrolar com os <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                deveres.
              </span>
            </h1>
          </RevealOnScroll>
          
          <RevealOnScroll delay={100}>
            <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto md:mx-0 font-light tracking-tight">
              Organize seus deveres escolares, comprove que fez com uma foto e ganhe XP a cada dever concluído.
            </p>
          </RevealOnScroll>
          
          <RevealOnScroll delay={200}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-[var(--text-main)] text-[var(--background)] h-12 px-8 rounded-full font-medium text-sm flex items-center gap-2 hover:scale-105 transition-transform"
              >
                Começar a usar
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </RevealOnScroll>
        </div>

        <div className="flex-1 w-full flex justify-center md:justify-end relative z-10 mt-12 md:mt-0">
          <RevealOnScroll delay={300}>
            <img 
              src="/mockup.png" 
              alt="App Mockup" 
              className="w-full h-auto object-contain md:max-w-[600px]"
            />
          </RevealOnScroll>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">O que a galera tá achando.</h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-3 gap-6">
            <RevealOnScroll delay={100}>
              <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] h-full flex flex-col">
                <div className="text-secondary mb-3 flex gap-1">
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                </div>
                <p className="text-[var(--text-main)] text-sm mb-4 italic flex-1">"Parei de esquecer os deveres de matemática!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--border)] rounded-full flex items-center justify-center font-bold text-xs text-[var(--text-main)]">J</div>
                  <div>
                    <p className="font-bold text-[var(--text-main)] text-sm">João</p>
                    <p className="text-xs text-[var(--text-muted)]">8º ano</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] h-full flex flex-col">
                <div className="text-secondary mb-3 flex gap-1">
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                </div>
                <p className="text-[var(--text-main)] text-sm mb-4 italic flex-1">"A parte da foto é genial, não dá pra enganar!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--border)] rounded-full flex items-center justify-center font-bold text-xs text-[var(--text-main)]">A</div>
                  <div>
                    <p className="font-bold text-[var(--text-main)] text-sm">Ana</p>
                    <p className="text-xs text-[var(--text-muted)]">1º ano do EM</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={300}>
              <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] h-full flex flex-col">
                <div className="text-secondary mb-3 flex gap-1">
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                </div>
                <p className="text-[var(--text-main)] text-sm mb-4 italic flex-1">"Minha mãe adorou que eu uso isso pra me organizar 😂"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--border)] rounded-full flex items-center justify-center font-bold text-xs text-[var(--text-main)]">P</div>
                  <div>
                    <p className="font-bold text-[var(--text-main)] text-sm">Pedro</p>
                    <p className="text-xs text-[var(--text-muted)]">7º ano</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Dúvidas Frequentes.</h2>
          </RevealOnScroll>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <RevealOnScroll delay={index * 100} key={index}>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden transition-all">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between font-medium text-left hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-main)] text-sm"
                  >
                    {faq.q}
                    <span className={`material-symbols-outlined transition-transform duration-300 text-[var(--text-muted)] ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-40 py-4 border-t border-[var(--border)]' : 'max-h-0'}`}
                  >
                    <p className="text-[var(--text-muted)] text-sm">{faq.a}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 text-center">
        <div className="flex items-center justify-center gap-2 font-semibold tracking-tight text-[var(--text-muted)] mb-2">
          <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain opacity-50 grayscale" />
          <span>
            Homework Organizer by{' '}
            <a href="https://zxlabs.online/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-main)] transition-colors">
              ZX Labs
            </a>
          </span>
        </div>
        <p className="text-[12px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
          © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
