import React, { useState } from 'react';
import { Plus, Sparkles, CheckSquare, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickActionFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openNewTaskModal, openAIScannerModal, activePage } = useApp();

  // Hide FAB on settings page or if not relevant
  if (activePage === 'settings') return null;

  return (
    <div className="hidden lg:flex fixed bottom-10 right-10 z-40 flex-col items-end gap-3">
      {/* Speed Dial Options */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 animate-slide-up">
          {/* Option: AI Scanner */}
          <button
            onClick={() => {
              setIsOpen(false);
              openAIScannerModal();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-subtle)] active:scale-95 transition-all text-xs font-bold group"
          >
            <span className="text-[var(--text-primary)]">Escanear Caderno com IA</span>
            <div className="size-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md">
              <Sparkles size={18} />
            </div>
          </button>

          {/* Option: Manual Task */}
          <button
            onClick={() => {
              setIsOpen(false);
              openNewTaskModal();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xl border border-[var(--border-subtle)] hover:bg-[var(--surface-subtle)] active:scale-95 transition-all text-xs font-bold group"
          >
            <span className="text-[var(--text-primary)]">Nova Tarefa Manual</span>
            <div className="size-9 rounded-xl bg-[var(--action-primary)] text-white flex items-center justify-center shadow-md">
              <CheckSquare size={18} />
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`size-14 rounded-full bg-[var(--action-primary)] text-white shadow-xl shadow-[var(--action-primary)]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 ${
          isOpen ? 'rotate-45 bg-[var(--surface-card)] !text-[var(--text-primary)] border border-[var(--border-subtle)]' : ''
        }`}
        title={isOpen ? 'Fechar' : 'Adicionar'}
      >
        {isOpen ? <X size={26} /> : <Plus size={30} className="stroke-[2.5]" />}
      </button>
    </div>
  );
};
