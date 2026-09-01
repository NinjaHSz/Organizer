import React from 'react';
import {
  LayoutDashboard,
  Clock,
  FolderOpen,
  Settings as SettingsIcon,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { useApp, AppPage } from '../../context/AppContext';

export const DesktopSidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    tasks,
    subjects,
    completedTaskIds,
    openNewTaskModal,
  } = useApp();

  const pendingCount = tasks.filter((t) => !completedTaskIds.includes(t.id)).length;

  const navItems = [
    {
      id: 'dashboard' as AppPage,
      label: 'Início',
      icon: LayoutDashboard,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'schedule' as AppPage,
      label: 'Cronograma',
      icon: Clock,
    },
    {
      id: 'subjects' as AppPage,
      label: 'Minhas Matérias',
      icon: FolderOpen,
      badge: subjects.length > 0 ? subjects.length : undefined,
    },
    {
      id: 'settings' as AppPage,
      label: 'Ajustes',
      icon: SettingsIcon,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[var(--surface-card)] shrink-0 z-40 h-screen sticky top-0">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-[var(--action-primary)]/15 flex items-center justify-center text-[var(--action-primary)] shrink-0 shadow-inner">
          <CheckCircle2 size={24} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Organizer
          </h1>
          <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
            Estudos & Rotina
          </p>
        </div>
      </div>

      {/* New Task Direct CTA Button */}
      <div className="px-4 pb-2">
        <button
          onClick={() => openNewTaskModal()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--action-primary)] text-white text-xs font-bold shadow-md shadow-[var(--action-primary)]/20 hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-3 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group text-left cursor-pointer ${
                isActive
                  ? 'bg-[var(--action-primary)] text-white shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={
                    isActive
                      ? 'text-white'
                      : 'text-[var(--text-secondary)] group-hover:text-[var(--action-primary)] transition-colors'
                  }
                />
                <span className="text-xs sm:text-sm">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] group-hover:bg-[var(--action-primary)]/10 group-hover:text-[var(--action-primary)]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
