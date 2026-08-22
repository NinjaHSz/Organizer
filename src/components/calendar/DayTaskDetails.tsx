import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from '../tasks/TaskCard';
import { EmptyState } from '../common/EmptyState';

export const DayTaskDetails: React.FC = () => {
  const { selectedCalendarDate, tasks, openNewTaskModal } = useApp();

  const selectedDateTasks = tasks.filter((t) => t.due_date === selectedCalendarDate);

  // Format date display
  const dateObj = new Date(selectedCalendarDate + 'T12:00:00');
  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const isToday =
    new Date().toISOString().split('T')[0] === selectedCalendarDate;

  return (
    <div className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-7 border border-[var(--border-subtle)] shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--separator)]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] capitalize">
              {formattedDate}
            </h3>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--action-primary)]/15 text-[var(--action-primary)] text-[10px] font-bold uppercase">
                Hoje
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {selectedDateTasks.length}{' '}
            {selectedDateTasks.length === 1 ? 'tarefa programada' : 'tarefas programadas'}
          </p>
        </div>

        <button
          onClick={() => openNewTaskModal(selectedCalendarDate)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--action-primary)] text-white text-xs font-bold shadow hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={15} />
          <span>Agendar</span>
        </button>
      </div>

      {/* Task list for selected date */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
        {selectedDateTasks.length > 0 ? (
          selectedDateTasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <EmptyState
            icon={Calendar}
            title="Nenhuma tarefa nesta data"
            description="Aproveite o dia livre ou clique no botão acima para agendar uma nova atividade para este dia."
            actionLabel="Agendar Tarefa"
            onAction={() => openNewTaskModal(selectedCalendarDate)}
          />
        )}
      </div>
    </div>
  );
};
