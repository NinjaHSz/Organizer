import React, { useMemo } from 'react';
import { CheckCircle2, Clock, AlertTriangle, SearchX, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../common/EmptyState';
import { Task } from '../../types/task';

export const TaskList: React.FC = () => {
  const { tasks, filters, completedTaskIds, openNewTaskModal, openAIScannerModal } = useApp();

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const searchLower = filters.search.trim().toLowerCase();

    return tasks
      .filter((task) => {
        // Search filter
        if (searchLower) {
          const matchTitle = task.title.toLowerCase().includes(searchLower);
          const matchDesc = task.description?.toLowerCase().includes(searchLower);
          if (!matchTitle && !matchDesc) return false;
        }

        // Category filter (Atrasadas, Próximas, Concluídas)
        const isDone = completedTaskIds.includes(task.id) || task.status === 'done';

        if (filters.category === 'overdue') {
          if (isDone || !task.due_date || task.due_date >= today) return false;
        } else if (filters.category === 'done') {
          if (!isDone) return false;
        } else {
          // 'upcoming' (default)
          if (isDone) return false;
          if (task.due_date && task.due_date < today) return false;
        }

        return true;
      })
      .sort((a: Task, b: Task) => {
        // Sort: pending first, then by due_date ascending
        const aDone = completedTaskIds.includes(a.id);
        const bDone = completedTaskIds.includes(b.id);
        if (aDone !== bDone) return aDone ? 1 : -1;

        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
  }, [tasks, filters, completedTaskIds]);

  if (filteredTasks.length === 0) {
    if (filters.search) {
      return (
        <EmptyState
          icon={SearchX}
          title="Nenhuma tarefa encontrada"
          description={`Nenhum resultado para a busca "${filters.search}".`}
          actionLabel="Nova Tarefa"
          onAction={() => openNewTaskModal()}
        />
      );
    }

    if (filters.category === 'overdue') {
      return (
        <EmptyState
          icon={AlertTriangle}
          title="Nenhuma tarefa atrasada"
          description="Excelente trabalho! Todas as suas entregas e estudos estão em dia."
          actionLabel="Criar Nova Tarefa"
          onAction={() => openNewTaskModal()}
        />
      );
    }

    if (filters.category === 'done') {
      return (
        <EmptyState
          icon={CheckCircle2}
          title="Nenhuma tarefa concluída ainda"
          description="Quando você concluir suas atividades, elas ficarão arquivadas aqui."
        />
      );
    }

    // Default upcoming empty state
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="size-16 rounded-2xl bg-[var(--action-primary)]/10 flex items-center justify-center text-[var(--action-primary)] mb-4 shadow-xs">
          <Clock size={32} className="stroke-[2]" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1">
          Nenhuma tarefa próxima pendente!
        </h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-5 leading-relaxed">
          Você não possui atividades pendentes. Crie uma nova tarefa ou use a câmera com IA para capturar suas anotações.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => openNewTaskModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--action-primary)] text-white text-xs font-bold shadow-md shadow-[var(--action-primary)]/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>Criar Tarefa</span>
          </button>
          <button
            onClick={openAIScannerModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-card)] text-[var(--action-primary)] text-xs font-bold hover:bg-[var(--surface-subtle)] active:scale-95 transition-all shadow-xs"
          >
            <Sparkles size={15} />
            <span>Escanear com IA</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 items-start">
      {filteredTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};
