import { Link, useLocation } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-4 flex items-center justify-around max-w-md mx-auto">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-12 h-12 transition-colors gap-0.5 ${location.pathname === '/' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[22px]">format_list_bulleted</span>
          <span className="text-xs font-semibold">Deveres</span>
        </Link>
        <Link 
          to="/historico" 
          className={`flex flex-col items-center justify-center w-12 h-12 transition-colors gap-0.5 ${location.pathname === '/historico' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[22px]">task_alt</span>
          <span className="text-xs font-semibold">Histórico</span>
        </Link>
      </div>
    </nav>
  );
}
