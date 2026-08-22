import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCategory } from '../../types/task';

export const TaskFilters: React.FC = () => {
  const { tasks, filters, completedTaskIds, setCategory } = useApp();

  const today = new Date().toISOString().split('T')[0];

  const totalCount = tasks.length;
  const doneCount = tasks.filter(
    (t) => completedTaskIds.includes(t.id) || t.status === 'done'
  ).length;
  const percentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const upcomingCount = tasks.filter(
    (t) =>
      (!t.due_date || t.due_date >= today) &&
      !completedTaskIds.includes(t.id) &&
      t.status !== 'done'
  ).length;

  const overdueCount = tasks.filter(
    (t) =>
      t.due_date &&
      t.due_date < today &&
      !completedTaskIds.includes(t.id) &&
      t.status !== 'done'
  ).length;

  const tabs: {
    id: TaskCategory;
    label: string;
    count: number;
    icon: any;
    activeClass: string;
    badgeActive: string;
  }[] = [
    {
      id: 'overdue',
      label: 'Atrasadas',
      count: overdueCount,
      icon: AlertTriangle,
      activeClass: 'bg-rose-500 text-white shadow-sm shadow-rose-500/20',
      badgeActive: 'bg-white/20 text-white',
    },
    {
      id: 'upcoming',
      label: 'Próximas',
      count: upcomingCount,
      icon: Clock,
      activeClass:
        'bg-[var(--action-primary)] text-white shadow-sm shadow-[var(--action-primary)]/20',
      badgeActive: 'bg-white/20 text-white',
    },
    {
      id: 'done',
      label: 'Concluídas',
      count: doneCount,
      icon: CheckCircle2,
      activeClass: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
      badgeActive: 'bg-white/20 text-white',
    },
  ];

  return (
    <div className="mb-4 space-y-3 w-full max-w-md">
      {/* KPI Card: Porcentagem de Conclusão */}
      <div className="p-3.5 sm:p-4 rounded-lg bg-[var(--surface-card)] shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">
                Conclusão de Tarefas
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] truncate">
                {totalCount > 0
                  ? `${doneCount} de ${totalCount} concluídas`
                  : 'Nenhuma tarefa cadastrada'}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-0.5 shrink-0">
            <span className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="h-1.5 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 3-Segment Grid Filter Control */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[var(--surface-card)] w-full overflow-hidden shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = filters.category === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`min-w-0 w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 sm:px-2.5 rounded-md text-xs font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? tab.activeClass
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
              }`}
            >
              <Icon
                size={13}
                className={`shrink-0 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`}
              />
              <span className="truncate">{tab.label}</span>
              <span
                className={`shrink-0 text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive
                    ? tab.badgeActive
                    : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
