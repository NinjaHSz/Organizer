import React, { useState, useEffect } from 'react';
import { Palette, FolderOpen, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';

const PRESET_COLORS = [
  '#4285F4', // Blue
  '#34A853', // Green
  '#FBBC05', // Yellow
  '#EA4335', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F97316', // Orange
  '#6366F1', // Indigo
];

export const SubjectFormModal: React.FC = () => {
  const { isSubjectModalOpen, closeSubjectModal, editingSubject, createSubject, updateSubject, showToast } =
    useApp();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#4285F4');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name || '');
      setColor(editingSubject.color || '#4285F4');
    } else {
      setName('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    }
  }, [editingSubject, isSubjectModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Por favor, informe o nome da matéria', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, {
          name: name.trim(),
          color,
        });
      } else {
        await createSubject({
          name: name.trim(),
          color,
        });
      }
      closeSubjectModal();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar matéria', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isSubjectModalOpen}
      onClose={closeSubjectModal}
      title={editingSubject ? 'Editar Matéria' : 'Nova Matéria'}
      subtitle="Cadastre disciplinas para categorizar suas tarefas"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
            <FolderOpen size={14} />
            <span>Nome da Disciplina *</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Física, Cálculo I, História..."
            className="w-full bg-[var(--surface-subtle)] text-[var(--text-primary)] px-4 py-3 rounded-2xl text-sm font-semibold outline-none border border-transparent focus:border-[var(--action-primary)] focus:bg-[var(--surface-card)] transition-all"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5 flex items-center gap-1.5">
            <Palette size={14} />
            <span>Cor da Matéria</span>
          </label>

          <div className="grid grid-cols-5 gap-2.5 mb-3">
            {PRESET_COLORS.map((c) => {
              const isSelected = color.toLowerCase() === c.toLowerCase();
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-10 rounded-2xl transition-transform flex items-center justify-center ${
                    isSelected ? 'ring-4 ring-[var(--action-primary)]/30 scale-105 shadow-md' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              );
            })}
          </div>

          {/* Custom Color Input */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--surface-subtle)]">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <span className="text-xs text-[var(--text-secondary)] font-mono font-bold">
              {color.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={closeSubjectModal}
            className="flex-1 py-3 px-4 rounded-2xl bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-bold text-xs hover:bg-[var(--surface-subtle)]/80 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-2xl bg-[var(--action-primary)] text-white font-bold text-xs shadow-lg shadow-[var(--action-primary)]/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            <span>{editingSubject ? 'Salvar Alterações' : 'Criar Matéria'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
