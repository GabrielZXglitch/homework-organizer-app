import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';

// Fade in up animation helper
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

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] font-sans overflow-x-hidden selection:bg-primary/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="w-5 h-5 rounded-sm bg-[var(--text-main)] flex items-center justify-center">
              <span className="material-symbols-outlined text-[var(--background)] text-[14px]">bolt</span>
            </div>
            HW Tracker
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              Log in
            </button>
            <button onClick={() => navigate('/login')} className="text-sm font-medium bg-[var(--text-main)] text-[var(--background)] px-3 py-1.5 rounded hover:opacity-90 transition-opacity">
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 flex flex-col items-center text-center">
        {/* Glow behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-20"></div>
        
        <RevealOnScroll>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 max-w-4xl mx-auto leading-[1.1] relative z-10">
            Linear for your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              studies.
            </span>
          </h1>
        </RevealOnScroll>
        
        <RevealOnScroll delay={100}>
          <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto font-light tracking-tight relative z-10">
            A specialized issue tracker built for students. Plan tasks, verify completion with AI, and build an unbroken streak of productivity.
          </p>
        </RevealOnScroll>
        
        <RevealOnScroll delay={200}>
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <button 
              onClick={() => navigate('/login')}
              className="bg-[var(--text-main)] text-[var(--background)] h-12 px-8 rounded-full font-medium text-sm flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Start tracking
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </RevealOnScroll>

        {/* Dashboard Preview Mockup */}
        <RevealOnScroll delay={400}>
          <div className="mt-20 relative w-full max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-b from-[var(--border)] to-transparent rounded-xl blur-sm opacity-50"></div>
            <div className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden aspect-[16/9] shadow-2xl flex flex-col">
              {/* Fake Window Controls */}
              <div className="h-10 border-b border-[var(--border)] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              <div className="flex-1 p-8 flex flex-col gap-4 opacity-50 select-none">
                <div className="h-6 w-32 bg-[var(--border)] rounded"></div>
                <div className="h-12 w-full bg-[var(--border)] rounded"></div>
                <div className="h-12 w-full bg-[var(--border)] rounded"></div>
                <div className="h-12 w-full bg-[var(--border)] rounded"></div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Features Bento */}
      <section className="py-24 px-6 border-t border-[var(--border)] relative z-10">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Built for execution.</h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-2 gap-4">
            
            <RevealOnScroll delay={100}>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 h-[320px] flex flex-col hover:border-[var(--text-muted)] transition-colors group">
                <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center mb-6 group-hover:bg-[var(--text-main)] group-hover:text-[var(--background)] transition-colors">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 tracking-tight">AI Verification</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  Upload a photo of your finished work. Our vision model instantly verifies the material, ensuring the issue can only be closed with undeniable proof.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 h-[320px] flex flex-col hover:border-[var(--text-muted)] transition-colors group">
                <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center mb-6 group-hover:bg-[var(--text-main)] group-hover:text-[var(--background)] transition-colors">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 tracking-tight">Keyboard First</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  Navigate, create, and resolve issues at the speed of thought. The interface stays out of your way so you can focus on getting the work done.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={300}>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 h-[320px] flex flex-col md:col-span-2 hover:border-[var(--text-muted)] transition-colors group relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10 w-full md:w-1/2">
                  <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center mb-6 group-hover:bg-[var(--text-main)] group-hover:text-[var(--background)] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">timeline</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 tracking-tight">Metrics that matter</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                    Track your velocity over time. Maintain streaks and earn XP in a sophisticated environment that treats your studies like professional projects, not toys.
                  </p>
                </div>
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 text-center">
        <div className="flex items-center justify-center gap-2 font-semibold tracking-tight text-[var(--text-muted)] mb-2">
          <div className="w-4 h-4 rounded-sm bg-[var(--text-muted)] flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--background)] text-[12px]">bolt</span>
          </div>
          HW Tracker
        </div>
        <p className="text-[12px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
          © {new Date().getFullYear()} Issue Tracking for Students
        </p>
      </footer>
    </div>
  );
}
