import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Escuta o evento de instalação do PWA
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Checa se o usuário já dispensou o banner antes
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    
    // Mostra o banner após 3 segundos se o evento estiver pronto e não foi dispensado
    const timer = setTimeout(() => {
      if (!dismissed) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    // Request notification permission first
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.error("Erro ao pedir notificação", e);
      }
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };
    
  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser || !location.pathname.startsWith('/app')) return null;

  const needsNotification = 'Notification' in window && Notification.permission === 'default';

  if (!showPrompt || (!deferredPrompt && !needsNotification)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 md:bottom-8 md:right-8 bg-[#0D1117] border border-[var(--border)] rounded-xl p-5 shadow-2xl z-50 animate-fade-in flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain flex-shrink-0" />
        <p className="text-[var(--text-main)] font-medium text-sm leading-snug">
          Instale o app e ative as notificações para a experiência completa!
        </p>
      </div>
      <div className="flex gap-2 w-full mt-1">
        <button 
          onClick={handleDismiss}
          className="flex-1 px-4 py-2 rounded border border-[var(--border)] text-[var(--text-muted)] text-xs font-medium hover:bg-[var(--surface-hover)] transition-colors"
        >
          Agora não
        </button>
        <button 
          onClick={handleInstall}
          className="flex-1 px-4 py-2 rounded bg-primary text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-glow-subtle"
        >
          {deferredPrompt ? 'Instalar App' : 'Ativar Alertas'}
        </button>
      </div>
    </div>
  );
}
