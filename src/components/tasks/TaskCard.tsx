import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  Calendar,
  Trash2,
  Edit2,
  Paperclip,
  ExternalLink,
  Clock3,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Task } from '../../types/task';
import { useApp } from '../../context/AppContext';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { subjects, completedTaskIds, toggleTaskDone, openEditTaskModal, deleteTask } = useApp();

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    };
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirmingDelete) {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      deleteTask(task.id);
    } else {
      setIsConfirmingDelete(true);
      deleteTimeoutRef.current = setTimeout(() => {
        setIsConfirmingDelete(false);
      }, 3500);
    }
  };

  const isDone = completedTaskIds.includes(task.id);
  const subject = subjects.find((s) => s.id === task.subject_id);

  // Priority Border Color
  const priorityColorMap: Record<string, string> = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981',
  };

  const priorityColor = priorityColorMap[task.priority] || '#F59E0B';

  // Due Date Urgency Logic (No background, pure typography & icon)
  const getDueStatus = () => {
    if (!task.due_date) return null;
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const isOverdue = task.due_date < today && !isDone;
    const isToday = task.due_date === today;
    const isTomorrow = task.due_date === tomorrowStr;

    const dateObj = new Date(task.due_date + 'T12:00:00');
    const rawWeekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
    const cleanWeekday =
      rawWeekday.replace('.', '').charAt(0).toUpperCase() +
      rawWeekday.replace('.', '').slice(1);
    const dayMonth = dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    const formatted = `${cleanWeekday}, ${dayMonth}`;

    if (isOverdue) {
      return {
        label: `Atrasada (${formatted})`,
        isOverdue: true,
        className: 'text-rose-500 font-bold',
      };
    }
    if (isToday) {
      return {
        label: `Hoje (${formatted})`,
        isToday: true,
        className: 'text-[var(--action-primary)] font-bold',
      };
    }
    if (isTomorrow) {
      return {
        label: formatted,
        className: 'text-amber-500 font-semibold',
      };
    }
    return {
      label: formatted,
      className: 'text-[var(--text-muted)] font-medium',
    };
  };

  const dueStatus = getDueStatus();

  return (
    <div
      className={`group relative bg-[var(--surface-card)] rounded-xl transition-all duration-200 overflow-hidden shadow-xs hover:shadow-card border border-transparent hover:border-[var(--action-primary)]/20 ${
        isDone ? 'bg-[var(--surface-card)]/50 opacity-60' : ''
      }`}
    >
      {/* Left Priority Indicator (2px distance offset from left) */}
      <div
        className="absolute left-[2px] top-2 bottom-2 w-1 rounded-full transition-colors duration-200"
        style={{
          backgroundColor: isDone ? 'var(--text-muted)' : priorityColor,
        }}
      />

      <div className="py-3.5 px-3.5 sm:px-4 pl-4 sm:pl-4.5">
        {/* Main Row */}
        <div className="flex items-center gap-3">
          {/* Tactile Checkbox sized to match title + subject height */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskDone(task.id);
            }}
            className={`size-10 sm:size-11 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 shadow-2xs active:scale-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--action-primary)] outline-none ${
              isDone
                ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/20'
                : 'bg-[var(--surface-subtle)] hover:bg-[var(--surface-subtle)]/80 text-transparent'
            }`}
            title={isDone ? 'Marcar como pendente' : 'Concluir tarefa'}
          >
            <Check
              size={20}
              className={`stroke-[3.5] transition-all duration-150 ${
                isDone ? 'scale-100 opacity-100 text-white' : 'scale-50 opacity-0'
              }`}
            />
          </button>

          {/* Title and Sub-row Container */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {/* Task Title */}
            <h4
              className={`text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug ${
                isExpanded ? 'break-words' : 'truncate'
              } ${isDone ? 'line-through text-[var(--text-muted)]' : ''}`}
            >
              {task.title}
            </h4>

            {/* Sub-row: Subject + Due Date + Attachments (Below Title) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
              {/* Subject (3-letter abbreviation with colored dot) */}
              {subject && (
                <span
                  className="font-bold flex items-center gap-1.5 shrink-0 uppercase tracking-wider"
                  style={{ color: subject.color }}
                  title={subject.name}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span>{subject.name.substring(0, 3).toUpperCase()}</span>
                </span>
              )}

              {/* Due Date */}
              {dueStatus && (
                <span className={`flex items-center gap-1.5 shrink-0 ${dueStatus.className}`}>
                  {dueStatus.isOverdue ? (
                    <AlertCircle size={13} className="shrink-0 text-rose-500" />
                  ) : (
                    <Calendar size={13} className="shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{dueStatus.label}</span>
                </span>
              )}

              {/* Attachments Icon */}
              {task.attachments && task.attachments.length > 0 && (
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 shrink-0">
                  <Paperclip size={12} />
                  <span>{task.attachments.length}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => openEditTaskModal(task)}
              className="size-10 sm:size-11 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--action-primary)] hover:bg-[var(--surface-subtle)] transition-all duration-200 shrink-0 active:scale-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--action-primary)] outline-none"
              title="Editar"
            >
              <Edit2 size={18} />
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className={`size-10 sm:size-11 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none ${
                isConfirmingDelete
                  ? 'bg-rose-500 text-white shadow-xs font-black ring-2 ring-rose-500/30 animate-pulse scale-105'
                  : 'text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10'
              }`}
              title={isConfirmingDelete ? 'Clique novamente para confirmar exclusão' : 'Excluir tarefa'}
            >
              {isConfirmingDelete ? (
                <HelpCircle size={18} className="stroke-[2.8]" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Details Section */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[var(--surface-subtle)] animate-fade-in space-y-2.5 pl-2 sm:pl-9">
            {/* Full Formatted Description */}
            {task.description ? (
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                {task.description}
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic">
                Sem descrição detalhada.
              </p>
            )}

            {/* Attachments Section */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Paperclip size={13} />
                  <span>Anexos ({task.attachments.length})</span>
                </span>

                <div className="flex flex-wrap gap-2">
                  {task.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-[var(--action-primary)] hover:underline font-medium"
                    >
                      <Paperclip size={13} />
                      <span className="truncate max-w-[180px]">{att.name}</span>
                      <ExternalLink size={12} className="shrink-0 opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Created Timestamp */}
            {task.created_at && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium pt-1">
                <Clock3 size={12} />
                <span>
                  Cadastrada em {new Date(task.created_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(task.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
