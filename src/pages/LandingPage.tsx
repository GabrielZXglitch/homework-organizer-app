import { useState, useEffect, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

function RevealOnScroll({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ease-out w-full ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    { q: "O app é gratuito?", a: "Sim, 100% gratuito. 💸" },
    { q: "Precisa instalar?", a: "Não, roda no navegador. Mas pode instalar como PWA no celular pra ficar mais fácil! 📱" },
    { q: "A foto fica salva?", a: "Não, a foto é usada só pra confirmar na hora e depois é descartada. Pode ficar tranquilo! 📸" },
    { q: "Funciona em qualquer escola?", a: "Sim, basta criar uma conta com e-mail e senha e você organiza as matérias do seu jeito. 🏫" },
    { q: "Tem versão para professores ou pais?", a: "Ainda não, mas em breve teremos novidades! 👀" }
  ];

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 max-w-5xl mx-auto opacity-0 animate-fade-in">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-tight">Homework Organizer</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-primary font-semibold hover:text-primary-hover transition-colors"
        >
          Entrar
        </button>
      </nav>

      {/* Hero Section */}
      <header className="px-4 pt-12 pb-20 text-center max-w-5xl mx-auto flex flex-col items-center">
        <RevealOnScroll delay={100}>
          <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface mb-4 leading-tight">
            Chega de enrolar com os deveres 📚
          </h1>
        </RevealOnScroll>
        <RevealOnScroll delay={200}>
          <p className="text-lg md:text-xl text-on-surface-variant mb-8 max-w-2xl mx-auto">
            Organize suas tarefas, prove que terminou tirando uma foto e acumule XP para manter sua ofensiva!
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={300}>
          <button 
            onClick={() => navigate('/login')}
            className="bg-primary text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all text-lg mb-10"
          >
            Começar agora — é grátis ✨
          </button>
        </RevealOnScroll>
        
        {/* Mockup / Badge */}
        <RevealOnScroll delay={400}>
          <div className="relative w-full max-w-xs md:max-w-md mx-auto">
            <div className="absolute -top-4 -right-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md transform rotate-6 z-10">
              PWA — Instale no celular! 📱
            </div>
            <div className="bg-white rounded-[2rem] border-8 border-surface-container-high shadow-2xl overflow-hidden aspect-[9/19] flex flex-col items-center justify-center relative">
              {/* Fake App Screen */}
              <div className="absolute top-0 w-full h-full bg-surface-container-low p-4 flex flex-col">
                <div className="h-6 w-1/3 bg-surface-container-high rounded-full mb-6 mx-auto mt-2"></div>
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <div className="h-4 w-1/2 bg-surface-container-high rounded-full mb-2"></div>
                  <div className="h-3 w-1/3 bg-surface-container-high rounded-full"></div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <div className="h-4 w-3/4 bg-surface-container-high rounded-full mb-2"></div>
                  <div className="h-3 w-1/4 bg-surface-container-high rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </header>

      {/* Funcionalidades */}
      <section className="bg-surface-container-lowest py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold text-center mb-12">Por que usar? 🤔</h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RevealOnScroll delay={100}>
              <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined text-2xl">edit_document</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Organize seus deveres 📋</h3>
                <p className="text-on-surface-variant">Cadastre matéria, prazo e prioridade em segundos.</p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 text-secondary">
                  <span className="material-symbols-outlined text-2xl">photo_camera</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Prove que fez 📸</h3>
                <p className="text-on-surface-variant">Tire uma foto do dever pronto pra confirmar de verdade.</p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={300}>
              <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center mb-4 text-tertiary">
                  <span className="material-symbols-outlined text-2xl">trophy</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Ganhe XP 🏆</h3>
                <p className="text-on-surface-variant">Acumule pontos e mantenha sua ofensiva em dia.</p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={400}>
              <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined text-2xl">notifications_active</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Nunca esqueça 🔔</h3>
                <p className="text-on-surface-variant">Filtre por hoje, essa semana ou todos os deveres.</p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold text-center mb-16">Como Funciona 🚀</h2>
          </RevealOnScroll>
          <div className="flex flex-col md:flex-row gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-surface-container-high -z-10 -translate-y-1/2 rounded-full"></div>
            
            <div className="flex-1 flex flex-col items-center text-center">
              <RevealOnScroll delay={100}>
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-surface shadow-md mx-auto">1</div>
                <h3 className="text-xl font-bold mb-2">Cadastre seu dever</h3>
                <p className="text-on-surface-variant">Informe a matéria, o que precisa ser feito e para quando é.</p>
              </RevealOnScroll>
            </div>
            
            <div className="flex-1 flex flex-col items-center text-center">
              <RevealOnScroll delay={250}>
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-surface shadow-md mx-auto">2</div>
                <h3 className="text-xl font-bold mb-2">Faça o dever e tire a foto</h3>
                <p className="text-on-surface-variant">Terminou? Envie uma foto como prova definitiva de que está pronto!</p>
              </RevealOnScroll>
            </div>
            
            <div className="flex-1 flex flex-col items-center text-center">
              <RevealOnScroll delay={400}>
                <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-surface shadow-md mx-auto">3</div>
                <h3 className="text-xl font-bold mb-2">Ganhe XP e continue</h3>
                <p className="text-on-surface-variant">Aumente sua ofensiva e seja o mestre da organização! 🔥</p>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="bg-primary text-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold text-center mb-12">O que a galera tá achando 🗣️</h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-3 gap-6">
            <RevealOnScroll delay={100}>
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 h-full">
                <div className="text-tertiary mb-3 flex gap-1">
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                </div>
                <p className="text-lg italic mb-4">"Parei de esquecer os deveres de matemática!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">J</div>
                  <div>
                    <p className="font-bold">João</p>
                    <p className="text-sm opacity-80">8º ano</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 h-full">
                <div className="text-tertiary mb-3 flex gap-1">
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                </div>
                <p className="text-lg italic mb-4">"A parte da foto é genial, não dá pra enganar!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">A</div>
                  <div>
                    <p className="font-bold">Ana</p>
                    <p className="text-sm opacity-80">1º ano do EM</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={300}>
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 h-full">
                <div className="text-tertiary mb-3 flex gap-1">
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                </div>
                <p className="text-lg italic mb-4">"Minha mãe adorou que eu uso isso pra me organizar 😂"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">P</div>
                  <div>
                    <p className="font-bold">Pedro</p>
                    <p className="text-sm opacity-80">7º ano</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold text-center mb-10">Dúvidas Frequentes 🤷‍♂️</h2>
          </RevealOnScroll>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <RevealOnScroll delay={index * 100} key={index}>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden transition-all">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between font-bold text-left hover:bg-surface-container-low transition-colors"
                  >
                    {faq.q}
                    <span className={`material-symbols-outlined transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-40 py-4 border-t border-outline-variant' : 'max-h-0'}`}
                  >
                    <p className="text-on-surface-variant">{faq.a}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-surface-container-lowest py-24 px-4 text-center">
        <RevealOnScroll>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Pronto para virar o jogo? 🎮</h2>
          <p className="text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto">Junte-se à galera e nunca mais esqueça de um dever de casa.</p>
        </RevealOnScroll>
        <RevealOnScroll delay={200}>
          <button 
            onClick={() => navigate('/login')}
            className="bg-primary text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all text-xl"
          >
            Começar agora — é grátis ✨
          </button>
        </RevealOnScroll>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-on-surface-variant text-sm border-t border-outline-variant">
        <p>© {new Date().getFullYear()} Homework Organizer. Feito para estudantes.</p>
      </footer>
    </div>
  );
}
