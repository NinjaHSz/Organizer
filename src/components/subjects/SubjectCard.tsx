import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Check, Plus, HelpCircle } from 'lucide-react';
import { Subject } from '../../types/subject';
import { useApp } from '../../context/AppContext';

interface SubjectCardProps {
  subject: Subject;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    tasks,
    completedTaskIds,
    openEditSubjectModal,
    deleteSubject,
    openNewTaskModal,
    toggleTaskDone,
  } = useApp();

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    };
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirmingDelete) {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      deleteSubject(subject.id);
    } else {
      setIsConfirmingDelete(true);
      deleteTimeoutRef.current = setTimeout(() => {
        setIsConfirmingDelete(false);
      }, 3500);
    }
  };

  const subjectTasks = tasks.filter((t) => t.subject_id === subject.id);
  const pendingTasks = subjectTasks.filter((t) => !completedTaskIds.includes(t.id));
  const doneTasks = subjectTasks.filter((t) => completedTaskIds.includes(t.id));

  // Extract 3-letter uppercase subject identifier
  const subjectAbbr = (subject.name || 'MAT').trim().substring(0, 3).toUpperCase();

  return (
    <div className="group relative bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--action-primary)]/35 shadow-xs hover:shadow-card transition-all duration-200 overflow-hidden">
      {/* Left Subject Color Indicator Pill (2px offset) */}
      <div
        className="absolute left-[2px] top-1.5 bottom-1.5 w-1 rounded-full transition-colors duration-200"
        style={{ backgroundColor: subject.color }}
      />

      <div className="py-2.5 px-3 sm:px-4 pl-4 sm:pl-4.5">
        {/* Main Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Info Area (Click to Expand) */}
          <div
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {/* Subject Color Badge Icon */}
            <div
              className="size-7 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 shadow-xs text-white"
              style={{ backgroundColor: subject.color }}
            >
              {subjectAbbr}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate leading-snug">
                {subject.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-[11px] text-[var(--text-secondary)]">
                <span>{pendingTasks.length} pendentes</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium">{doneTasks.length} concluídas</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEditSubjectModal(subject);
              }}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--action-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
              title="Editar Matéria"
            >
              <Edit2 size={13} />
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                isConfirmingDelete
                  ? 'bg-rose-500 text-white shadow-xs font-black ring-2 ring-rose-500/30 animate-pulse scale-105'
                  : 'text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10'
              }`}
              title={isConfirmingDelete ? 'Clique novamente para confirmar exclusão' : 'Excluir matéria'}
            >
              {isConfirmingDelete ? (
                <HelpCircle size={13} className="stroke-[2.8]" />
              ) : (
                <Trash2 size={13} />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Subtask Details Section */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-[var(--separator)] animate-fade-in space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Tarefas da matéria ({subjectTasks.length})
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openNewTaskModal();
                }}
                className="text-[11px] font-bold text-[var(--action-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>Nova Tarefa</span>
              </button>
            </div>

            {subjectTasks.length > 0 ? (
              <div className="space-y-1">
                {subjectTasks.map((t) => {
                  const isDone = completedTaskIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--surface-subtle)]/60 hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)]/60 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskDone(t.id);
                        }}
                        className={`size-5 rounded-full border-[1.5px] flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white ring-1 ring-emerald-500/20'
                            : 'border-[var(--border-subtle)] hover:border-[var(--action-primary)]'
                        }`}
                      >
                        {isDone && <Check size={11} className="stroke-[3.5]" />}
                      </button>
                      <span
                        className={`text-xs font-semibold text-[var(--text-primary)] flex-1 truncate ${
                          isDone ? 'line-through opacity-50' : ''
                        }`}
                      >
                        {t.title}
                      </span>
                      {t.due_date && (
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-medium">
                          {new Date(t.due_date + 'T12:00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)] italic py-1 text-center">
                Nenhuma tarefa vinculada a esta matéria ainda.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
