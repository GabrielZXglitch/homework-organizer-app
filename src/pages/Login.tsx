import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const { loginWithEmail, loginWithGoogle, registerWithEmail, loading } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await loginWithEmail(email, senha);
        navigate('/app');
      } else {
        if (!nome) return;
        await registerWithEmail(nome, email, senha);
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login com Google');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto object-contain mb-6" />
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-2">
            {isLogin ? 'Insira seus dados para acessar suas tarefas.' : 'Comece a organizar seus estudos hoje.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Nome Completo</label>
              <input 
                className="w-full h-10 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] rounded px-3 text-sm focus:outline-none focus:border-[var(--text-main)] transition-colors" 
                type="text" 
                required 
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">E-mail</label>
            <input 
              className="w-full h-10 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] rounded px-3 text-sm focus:outline-none focus:border-[var(--text-main)] transition-colors" 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Senha</label>
            <input 
              className="w-full h-10 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] rounded px-3 text-sm focus:outline-none focus:border-[var(--text-main)] transition-colors" 
              type="password" 
              required 
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-10 bg-[var(--text-main)] text-[var(--background)] font-medium text-sm rounded mt-2 hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : (isLogin ? 'Continuar' : 'Cadastrar')}
          </button>
        </form>

        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="flex-shrink-0 mx-4 text-[10px] font-mono uppercase text-[var(--text-muted)]">Ou</span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full h-10 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] font-medium text-sm rounded hover:bg-[var(--surface-hover)] transition-colors flex items-center justify-center gap-2"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
          Continuar com Google
        </button>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm transition-colors"
          >
            {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
          </button>
        </div>
      </div>
    </main>
  );
}
