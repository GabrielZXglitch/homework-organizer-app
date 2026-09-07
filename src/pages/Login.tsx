import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await registerWithEmail(nome, email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao entrar com Google.');
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col relative w-full px-4 sm:px-6 md:max-w-md md:mx-auto bg-surface min-h-screen">
      <div className="flex flex-col w-full pb-8 pt-6">
        
        {/* Minimal App Logo */}
        <div className="pt-6 pb-4 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary mb-3">
            <span className="material-symbols-outlined text-3xl">auto_stories</span>
          </div>
          <span className="font-label-md text-label-md text-outline uppercase tracking-wider">Homework Organizer</span>
        </div>

        {/* Header */}
        <div className="text-center px-2 mb-8">
          <h1 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">
            {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="text-base text-on-surface-variant">
            {isRegistering ? 'Organize sua vida acadêmica' : 'Organize seus deveres e tarefas escolares'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
          
          {isRegistering && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface" htmlFor="nome-input">Nome Completo</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-outline text-xl pointer-events-none">person</span>
                <input 
                  className="w-full h-12 bg-surface-container-low text-on-surface text-base placeholder:text-outline rounded-xl pl-11 pr-4 outline-none transition-colors focus:bg-surface-container-high" 
                  id="nome-input" 
                  placeholder="Seu nome" 
                  required={isRegistering} 
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface" htmlFor="email-input">E-mail</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-xl pointer-events-none">mail</span>
              <input 
                className="w-full h-12 bg-surface-container-low text-on-surface text-base placeholder:text-outline rounded-xl pl-11 pr-4 outline-none transition-colors focus:bg-surface-container-high" 
                id="email-input" 
                placeholder="seuemail@gmail.com" 
                required 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-on-surface" htmlFor="password-input">Senha</label>
              {!isRegistering && (
                <button className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors py-1" type="button">
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-xl pointer-events-none">lock</span>
              <input 
                className="w-full h-12 bg-surface-container-low text-on-surface text-base placeholder:text-outline rounded-xl pl-11 pr-12 outline-none transition-colors focus:bg-surface-container-high" 
                id="password-input" 
                placeholder="••••••••" 
                required 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                className="absolute right-1 w-11 h-11 flex items-center justify-center text-outline hover:text-on-surface transition-colors" 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-3">
            <button 
              className="w-full h-12 bg-primary text-on-primary font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              ) : (
                <>
                  <span>{isRegistering ? 'Criar Conta' : 'Entrar'}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-7 flex items-center justify-center">
          <div className="w-full h-px bg-surface-container-high"></div>
          <span className="absolute bg-surface px-3 text-xs font-semibold text-outline uppercase tracking-wider">ou acesse com</span>
        </div>

        <button 
          onClick={handleGoogle}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface flex items-center justify-center gap-2 text-base font-semibold transition-colors disabled:opacity-50" 
          type="button"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Continuar com Google</span>
        </button>

        {/* Toggle Mode */}
        <div className="mt-8 text-center flex items-center justify-center gap-1.5">
          <span className="text-sm text-on-surface-variant">
            {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
          </span>
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors" 
            type="button"
          >
            {isRegistering ? 'Entrar' : 'Criar conta'}
          </button>
        </div>
      </div>
    </main>
  );
}
