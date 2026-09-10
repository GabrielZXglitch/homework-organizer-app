import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[240px] 3xl:w-[280px] bg-[var(--surface)] border-r border-[var(--border)] z-50">
      <div className="p-6">
        <h1 className="text-xl font-bold text-[var(--text-main)]">HomeworkApp</h1>
      </div>
      
      <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
        <Link 
          to="/app" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/app' ? 'bg-primary/10 text-primary font-medium' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
          Deveres
        </Link>
        <Link 
          to="/app/historico" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/app/historico' ? 'bg-primary/10 text-primary font-medium' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">task_alt</span>
          Histórico
        </Link>
        <Link 
          to="/app/perfil" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/app/perfil' ? 'bg-primary/10 text-primary font-medium' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)]'}`}
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
          Perfil
        </Link>
      </nav>

      <div className="p-4 mb-4">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sair
        </button>
      </div>
    </aside>
  );
}
