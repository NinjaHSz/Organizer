import React from 'react';
import {
  LayoutDashboard,
  Clock,
  FolderOpen,
  Settings,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dock, { DockItemData } from '../common/Dock';

export const DesktopDock: React.FC = () => {
  const {
    activePage,
    setActivePage,
    openNewTaskModal,
  } = useApp();

  const items: DockItemData[] = [
    {
      icon: <LayoutDashboard size={20} className={activePage === 'dashboard' ? 'text-white' : ''} />,
      label: 'Início (Tarefas)',
      onClick: () => setActivePage('dashboard'),
      isActive: activePage === 'dashboard',
    },
    {
      icon: <Clock size={20} className={activePage === 'schedule' ? 'text-white' : ''} />,
      label: 'Cronograma',
      onClick: () => setActivePage('schedule'),
      isActive: activePage === 'schedule',
    },
    {
      icon: <FolderOpen size={20} className={activePage === 'subjects' ? 'text-white' : ''} />,
      label: 'Minhas Matérias',
      onClick: () => setActivePage('subjects'),
      isActive: activePage === 'subjects',
    },
    {
      icon: <Plus size={22} className="stroke-[3] text-white" />,
      label: 'Nova Tarefa',
      onClick: () => openNewTaskModal(),
      className: '!bg-[var(--action-primary)] !text-white shadow-lg shadow-[var(--action-primary)]/30 hover:scale-105',
    },
    {
      icon: <Settings size={20} className={activePage === 'settings' ? 'text-white' : ''} />,
      label: 'Ajustes',
      onClick: () => setActivePage('settings'),
      isActive: activePage === 'settings',
    },
  ];

  return (
    <div className="hidden lg:block">
      <Dock
        items={items}
        panelHeight={56}
        baseItemSize={42}
        magnification={62}
        distance={130}
      />
    </div>
  );
};
