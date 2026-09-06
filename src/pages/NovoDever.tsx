import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomeworks } from '../contexts/HomeworkContext';
import { Timestamp } from 'firebase/firestore';
import type { HomeworkPriority, SubjectOption } from '../types';
import { parse } from 'date-fns';

const initialSubjects: SubjectOption[] = [
  { label: 'Matemática', color: 'bg-primary', textColor: 'text-on-primary', icon: 'functions' },
  { label: 'Física', color: 'bg-primary', textColor: 'text-on-primary', icon: 'speed' },
  { label: 'Biologia', color: 'bg-primary', textColor: 'text-on-primary', icon: 'biotech' },
  { label: 'História', color: 'bg-primary', textColor: 'text-on-primary', icon: 'account_balance' },
  { label: 'Português', color: 'bg-primary', textColor: 'text-on-primary', icon: 'book' },
];

export function NovoDever() {
  const navigate = useNavigate();
  const { addHomework } = useHomeworks();
  
  const [subjects, setSubjects] = useState(initialSubjects);
  const [selectedSubject, setSelectedSubject] = useState('Matemática');
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const [dueDate, setDueDate] = useState(dateStr);
  const [dueTime, setDueTime] = useState('23:59');
  
  const [prioridade, setPrioridade] = useState<HomeworkPriority>('importante');
  const [exigeFoto, setExigeFoto] = useState(true);
  
  const [saving, setSaving] = useState(false);

  const handleAddSubject = () => {
    const nome = prompt('Nova matéria:');
    if (nome && nome.trim()) {
      const newSubj: SubjectOption = { label: nome.trim(), color: 'bg-primary', textColor: 'text-on-primary', icon: 'bookmark' };
      setSubjects([...subjects, newSubj]);
      setSelectedSubject(nome.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !selectedSubject || !dueDate || !dueTime) return;
    setSaving(true);
    
    try {
      const dateString = `${dueDate} ${dueTime}`;
      const parsedDate = parse(dateString, 'yyyy-MM-dd HH:mm', new Date());
      
      await addHomework({
        materia: selectedSubject,
        titulo,
        descricao,
        prazo: Timestamp.fromDate(parsedDate),
        prioridade,
        exigeFoto
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar.');
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col relative w-full bg-surface min-h-screen">
      {/* App Bar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md pt-safe">
        <div className="h-16 px-4 flex items-center justify-between md:max-w-md md:mx-auto">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <span className="text-base font-bold text-on-surface flex-1 text-center pr-10">Novo Dever</span>
        </div>
      </header>

      <div className="px-4 pb-28 flex flex-col md:max-w-md md:mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4 w-full">
          
          {/* Matéria */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface">Matéria</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {subjects.map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSelectedSubject(s.label)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedSubject === s.label 
                      ? 'bg-primary text-on-primary' 
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleAddSubject}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 border-dashed border-outline-variant text-outline hover:border-outline hover:text-on-surface transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Nova</span>
              </button>
            </div>
          </div>

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface" htmlFor="hwTitle">Título da tarefa</label>
            <input 
              className="w-full h-12 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl px-4 text-base shadow-sm focus:outline-none focus:bg-surface-container-low transition-all" 
              id="hwTitle" 
              placeholder="Ex: Exercícios de Álgebra Linear" 
              required 
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-on-surface" htmlFor="hwDesc">Descrição detalhada</label>
              <span className="text-xs font-semibold text-outline">Opcional</span>
            </div>
            <textarea 
              className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl p-4 text-base shadow-sm focus:outline-none focus:bg-surface-container-low resize-none transition-all" 
              id="hwDesc" 
              placeholder="Descreva a atividade..." 
              rows={3}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>

          {/* Prazo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface" htmlFor="dueDate">Data de entrega</label>
              <div className="relative flex items-center bg-surface-container-lowest rounded-xl shadow-sm focus-within:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined absolute left-3 text-primary text-[20px] pointer-events-none">calendar_today</span>
                <input 
                  className="w-full h-12 bg-transparent text-on-surface pl-10 pr-3 text-sm focus:outline-none" 
                  id="dueDate" 
                  type="date" 
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface" htmlFor="dueTime">Horário limite</label>
              <div className="relative flex items-center bg-surface-container-lowest rounded-xl shadow-sm focus-within:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined absolute left-3 text-primary text-[20px] pointer-events-none">schedule</span>
                <input 
                  className="w-full h-12 bg-transparent text-on-surface pl-10 pr-3 text-sm focus:outline-none" 
                  id="dueTime" 
                  type="time" 
                  required
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Prioridade */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">Prioridade</label>
            <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-1.5 rounded-xl">
              {[
                { value: 'tranquilo', color: 'bg-secondary', text: 'text-secondary', label: 'Tranquilo' },
                { value: 'importante', color: 'bg-[#F59E0B]', text: 'text-[#B45309]', label: 'Importante' },
                { value: 'urgente', color: 'bg-[#EF4444]', text: 'text-[#B91C1C]', label: 'Urgente' }
              ].map(opt => (
                <label key={opt.value} className="cursor-pointer">
                  <input 
                    className="peer sr-only" 
                    name="priority" 
                    type="radio" 
                    value={opt.value}
                    checked={prioridade === opt.value}
                    onChange={() => setPrioridade(opt.value as HomeworkPriority)}
                  />
                  <div className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-on-surface-variant text-sm font-semibold peer-checked:bg-surface-container-lowest peer-checked:${opt.text} peer-checked:shadow-sm transition-all text-center`}>
                    <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
                    <span>{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Foto Checkbox */}
          <div 
            className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4 cursor-pointer select-none"
            onClick={() => setExigeFoto(!exigeFoto)}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">photo_camera</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-on-surface truncate">Comprovação com Foto</span>
                <span className="text-xs text-outline truncate">Anexar imagem ao dar como concluído</span>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <input checked={exigeFoto} onChange={() => {}} className="sr-only peer" type="checkbox"/>
              <div className="w-12 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </div>

          {/* FAB Fixed */}
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-surface/90 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-40">
            <div className="md:max-w-md md:mx-auto">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full h-12 bg-primary hover:bg-primary-hover text-on-primary text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>Salvar Dever</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
