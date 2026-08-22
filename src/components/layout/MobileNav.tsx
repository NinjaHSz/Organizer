import React from 'react';
import {
  LayoutDashboard,
  Clock,
  FolderOpen,
  Settings as SettingsIcon,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { activePage, setActivePage, tasks, completedTaskIds, openNewTaskModal } = useApp();

  const pendingCount = tasks.length - completedTaskIds.length;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-card)]/90 ios-blur pb-safe">
      <nav className="flex items-center justify-between px-3 py-1.5 max-w-lg mx-auto">
        {/* Início / Dashboard */}
        <button
          onClick={() => setActivePage('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 touch-target transition-all duration-200 relative ${
            activePage === 'dashboard'
              ? 'text-[var(--action-primary)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-medium active:scale-95'
          }`}
        >
          <div className="relative">
            <LayoutDashboard
              size={21}
              className={activePage === 'dashboard' ? 'stroke-[2.5]' : 'stroke-2'}
            />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 size-4 bg-[var(--action-primary)] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Início</span>
          {activePage === 'dashboard' && (
            <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[var(--action-primary)]" />
          )}
        </button>

        {/* Horários / Cronograma */}
        <button
          onClick={() => setActivePage('schedule')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 touch-target transition-all duration-200 relative ${
            activePage === 'schedule'
              ? 'text-[var(--action-primary)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-medium active:scale-95'
          }`}
        >
          <Clock
            size={21}
            className={activePage === 'schedule' ? 'stroke-[2.5]' : 'stroke-2'}
          />
          <span className="text-[10px] mt-1 tracking-tight">Horários</span>
          {activePage === 'schedule' && (
            <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[var(--action-primary)]" />
          )}
        </button>

        {/* Center Action Button: Nova Tarefa */}
        <div className="flex-1 flex items-center justify-center -translate-y-2">
          <button
            onClick={() => openNewTaskModal()}
            className="size-11 rounded-full bg-[var(--action-primary)] text-white shadow-lg shadow-[var(--action-primary)]/35 flex items-center justify-center active:scale-90 hover:scale-105 transition-all cursor-pointer"
            title="Adicionar Nova Tarefa"
          >
            <Plus size={24} className="stroke-[3]" />
          </button>
        </div>

        {/* Matérias / Subjects */}
        <button
          onClick={() => setActivePage('subjects')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 touch-target transition-all duration-200 relative ${
            activePage === 'subjects'
              ? 'text-[var(--action-primary)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-medium active:scale-95'
          }`}
        >
          <FolderOpen
            size={21}
            className={activePage === 'subjects' ? 'stroke-[2.5]' : 'stroke-2'}
          />
          <span className="text-[10px] mt-1 tracking-tight">Matérias</span>
          {activePage === 'subjects' && (
            <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[var(--action-primary)]" />
          )}
        </button>

        {/* Ajustes / Settings */}
        <button
          onClick={() => setActivePage('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 touch-target transition-all duration-200 relative ${
            activePage === 'settings'
              ? 'text-[var(--action-primary)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-medium active:scale-95'
          }`}
        >
          <SettingsIcon
            size={21}
            className={activePage === 'settings' ? 'stroke-[2.5]' : 'stroke-2'}
          />
          <span className="text-[10px] mt-1 tracking-tight">Ajustes</span>
          {activePage === 'settings' && (
            <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[var(--action-primary)]" />
          )}
        </button>
      </nav>
    </div>
  );
};
