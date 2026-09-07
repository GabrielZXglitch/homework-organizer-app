import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export function Perfil() {
  const { userProfile, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState(userProfile?.nome || currentUser?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    if (!currentUser || !nome.trim()) return;
    setSaving(true);
    setMsg('');
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { nome: nome.trim() });
      setMsg('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      setMsg('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <main className="flex-1 flex flex-col relative w-full px-4 md:max-w-md md:mx-auto pb-24 bg-surface min-h-screen">
      <div className="pt-8 pb-6 text-center">
        <h1 className="text-2xl font-bold text-on-surface">Meu Perfil</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center border-4 border-primary overflow-hidden shrink-0 mb-4">
          <span className="material-symbols-outlined text-outline text-5xl">person</span>
        </div>
        <p className="text-sm font-medium text-on-surface-variant">{userProfile?.email || currentUser?.email}</p>
        
        <div className="mt-6 w-full flex items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-primary">{userProfile?.xpTotal || 0}</span>
            <span className="text-xs font-semibold text-on-surface-variant">XP Total</span>
          </div>
          <div className="w-px h-8 bg-outline-variant"></div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-secondary">{userProfile?.streakDias || 0} 🔥</span>
            <span className="text-xs font-semibold text-on-surface-variant">Ofensiva</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-2">Seu Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full h-14 bg-surface-container-low border border-outline-variant rounded-2xl px-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Como quer ser chamado?"
          />
        </div>

        {msg && (
          <div className={`text-sm font-medium p-3 rounded-xl ${msg.includes('sucesso') ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
            {msg}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !nome.trim()}
          className="w-full h-14 bg-primary text-on-primary font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="mt-12">
        <button
          onClick={handleLogout}
          className="w-full h-14 bg-surface-container-high text-error font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          Sair do aplicativo
        </button>
      </div>
    </main>
  );
}
