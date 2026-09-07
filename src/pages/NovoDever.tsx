import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeworkPriority } from '../types';
import { useHomeworks } from '../contexts/HomeworkContext';
import { format, startOfTomorrow } from 'date-fns';

export function NovoDever() {
  const navigate = useNavigate();
  const { addHomework } = useHomeworks();
  
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('Matemática');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<HomeworkPriority>('tranquilo');
  const [dueDate, setDueDate] = useState(() => format(startOfTomorrow(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState('23:59');
  const [exigeFoto, setExigeFoto] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);

  const defaultSubjects = [
    { id: 'Matemática', label: 'Matemática' },
    { id: 'História', label: 'História' },
    { id: 'Ciências', label: 'Ciências' },
    { id: 'Português', label: 'Português' },
    { id: 'Inglês', label: 'Inglês' }
  ];

  const allSubjects = [
    ...defaultSubjects,
    ...customSubjects.map(s => ({ id: s, label: s }))
  ];

  const handleAddSubject = () => {
    if (newSubject && !allSubjects.find(s => s.id === newSubject)) {
      setCustomSubjects([...customSubjects, newSubject]);
      setMateria(newSubject);
    }
    setNewSubject('');
    setIsAddingSubject(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !dueDate || !dueTime) return;

    setSaving(true);
    try {
      const [year, month, day] = dueDate.split('-').map(Number);
      const [hour, minute] = dueTime.split(':').map(Number);
      const prazo = new Date(year, month - 1, day, hour, minute);

      await addHomework({
        titulo: titulo.trim(),
        materia,
        descricao: descricao.trim(),
        prazo,
        prioridade,
        exigeFoto,
      });

      navigate('/app');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-[var(--background)] min-h-screen animate-fade-in">
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md pt-safe border-b border-[var(--border)]">
        <div className="h-14 px-5 flex items-center justify-between md:max-w-2xl md:mx-auto">
          <button 
            type="button" 
            onClick={() => navigate('/app')}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-muted)]">Nova Tarefa</span>
          <button 
            onClick={handleSubmit}
            disabled={saving || !titulo.trim()}
            className="text-primary hover:text-primary-hover disabled:text-[var(--text-muted)] transition-colors text-sm font-medium"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      <div className="px-5 pb-32 flex flex-col md:max-w-2xl md:mx-auto w-full mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Título */}
          <div>
            <input 
              className="w-full bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-muted)] text-3xl font-semibold tracking-tight focus:outline-none" 
              id="hwTitle" 
              placeholder="Título da Tarefa" 
              required 
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              autoFocus
            />
          </div>

          {/* Descrição */}
          <div className="border-b border-[var(--border)] pb-6">
            <textarea 
              className="w-full bg-transparent text-[var(--text-muted)] focus:text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 text-sm focus:outline-none resize-none transition-colors leading-relaxed" 
              id="hwDesc" 
              placeholder="Adicionar descrição..." 
              rows={3}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Project / Subject */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Matéria / Projeto</label>
              <div className="flex flex-wrap gap-2">
                {allSubjects.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setMateria(s.id)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                      materia === s.id 
                        ? 'border-[var(--text-main)] text-[var(--background)] bg-[var(--text-main)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
                {!isAddingSubject ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingSubject(true)}
                    className="px-3 py-1.5 rounded border border-dashed border-[var(--border)] text-[var(--text-muted)] text-xs font-medium hover:border-[var(--text-muted)] transition-colors flex items-center"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <input 
                      type="text"
                      className="px-2 py-1 rounded border border-[var(--border)] bg-transparent text-[var(--text-main)] text-xs w-24 focus:outline-none focus:border-primary"
                      autoFocus
                      placeholder="Nome"
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                    />
                    <button type="button" onClick={handleAddSubject} className="text-primary material-symbols-outlined text-[16px]">check</button>
                  </div>
                )}
              </div>
            </div>

            {/* Prazo */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Data de Entrega</label>
              <div className="flex gap-2">
                <input 
                  className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] px-3 py-1.5 rounded text-sm focus:outline-none focus:border-primary flex-1" 
                  type="date" 
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
                <input 
                  className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-main)] px-3 py-1.5 rounded text-sm focus:outline-none focus:border-primary w-24" 
                  type="time" 
                  required
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                />
              </div>
            </div>

            {/* Prioridade */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Prioridade</label>
              <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded p-1">
                {[
                  { value: 'tranquilo', label: 'Baixa' },
                  { value: 'importante', label: 'Média' },
                  { value: 'urgente', label: 'Alta' }
                ].map(opt => (
                  <label key={opt.value} className="flex-1 cursor-pointer">
                    <input 
                      className="peer sr-only" 
                      name="priority" 
                      type="radio" 
                      value={opt.value}
                      checked={prioridade === opt.value}
                      onChange={() => setPrioridade(opt.value as HomeworkPriority)}
                    />
                    <div className="text-center py-1 rounded text-xs font-medium text-[var(--text-muted)] peer-checked:text-[var(--text-main)] peer-checked:bg-[var(--surface-hover)] transition-colors">
                      {opt.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Foto Checkbox */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer group mt-4 sm:mt-0 p-3 rounded border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] transition-colors">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-[var(--text-main)] block">Prova Visual</span>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block mt-0.5">Exigir foto</span>
                </div>
                <div className="relative">
                  <input checked={exigeFoto} onChange={(e) => setExigeFoto(e.target.checked)} className="sr-only peer" type="checkbox"/>
                  <div className="w-9 h-5 bg-[var(--border)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text-main)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </label>
            </div>

          </div>
        </form>
      </div>
    </main>
  );
}
