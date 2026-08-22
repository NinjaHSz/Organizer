import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  FolderOpen,
  AlertCircle,
  Paperclip,
  Trash2,
  UploadCloud,
  Loader2,
  Camera,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { CustomSelect } from '../common/CustomSelect';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { useApp } from '../../context/AppContext';
import { Priority, TaskAttachment } from '../../types/task';
import { storageService } from '../../services/storageService';
import { getNextClassForSubject } from '../../utils/scheduleHelper';

export const TaskFormModal: React.FC = () => {
  const {
    isTaskModalOpen,
    closeTaskModal,
    editingTask,
    initialTaskDueDate,
    subjects,
    createTask,
    updateTask,
    showToast,
    openAIScannerModal,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const nextClassSuggestion = useMemo(() => {
    return getNextClassForSubject(selectedSubject?.name);
  }, [selectedSubject]);

  const handleSubjectChange = (newSubId: string) => {
    setSubjectId(newSubId);
    const sub = subjects.find((s) => s.id === newSubId);
    const suggestion = getNextClassForSubject(sub?.name);
    // If due date was empty or previous class suggestion, fill with new subject's next class
    if (suggestion && !dueDate) {
      setDueDate(suggestion.dateStr);
    }
  };

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setSubjectId(editingTask.subject_id || '');
      setPriority(editingTask.priority || 'medium');
      setDueDate(editingTask.due_date || '');
      setAttachments(editingTask.attachments || []);
    } else {
      setTitle('');
      setDescription('');
      setSubjectId('');
      setPriority('medium');
      setDueDate(initialTaskDueDate || '');
      setAttachments([]);
    }
  }, [editingTask, initialTaskDueDate, isTaskModalOpen, subjects]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const taskId = editingTask ? editingTask.id : 'new_' + Date.now();

    try {
      const uploadPromises = Array.from(files).map((file) =>
        storageService.uploadAttachment(file, taskId)
      );
      const uploaded = await Promise.all(uploadPromises);
      setAttachments((prev) => [...prev, ...uploaded]);
      showToast('Anexo adicionado com sucesso', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao anexar arquivo', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = async (index: number) => {
    const att = attachments[index];
    if (att && att.path) {
      await storageService.deleteAttachment(att.path);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Por favor, informe o título da tarefa', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title: title.trim(),
          description: description.trim() || null,
          subject_id: subjectId || null,
          priority,
          due_date: dueDate || null,
          attachments,
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim() || null,
          subject_id: subjectId || null,
          priority,
          due_date: dueDate || null,
          status: 'pending',
          attachments,
        });
      }
      closeTaskModal();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar tarefa', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const priorities: { id: Priority; label: string; color: string }[] = [
    { id: 'low', label: 'Baixa', color: 'bg-emerald-500' },
    { id: 'medium', label: 'Média', color: 'bg-amber-500' },
    { id: 'high', label: 'Alta', color: 'bg-rose-500' },
  ];

  return (
    <Modal
      isOpen={isTaskModalOpen}
      onClose={closeTaskModal}
      title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title & AI Camera Scan */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Título da Tarefa *
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Exercícios de Matemática pág. 42"
              className="flex-1 min-w-0 bg-[var(--surface-subtle)] text-[var(--text-primary)] px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold outline-none border border-[var(--border-subtle)] focus:border-[var(--action-primary)] focus:bg-[var(--surface-card)] transition-all"
            />
            <button
              type="button"
              onClick={() => {
                closeTaskModal();
                openAIScannerModal();
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--action-primary)]/15 text-[var(--action-primary)] border border-[var(--border-subtle)] hover:border-[var(--action-primary)]/40 transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-xs cursor-pointer"
              title="Escanear com IA (Foto do Caderno / Quadro)"
            >
              <Camera size={17} className="stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Description (Compact height) */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Descrição / Anotações
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes adicionais, itens de checklist, questões ou orientações..."
            className="w-full bg-[var(--surface-subtle)] text-[var(--text-primary)] px-3.5 py-2 rounded-xl text-xs outline-none border border-[var(--border-subtle)] focus:border-[var(--action-primary)] focus:bg-[var(--surface-card)] transition-all resize-none max-h-16"
          />
        </div>

        {/* Subject & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <FolderOpen size={13} />
              <span>Matéria</span>
            </label>
            <CustomSelect
              value={subjectId}
              onChange={handleSubjectChange}
              size="sm"
              placeholder="Nenhuma / Geral"
              options={[
                { value: '', label: 'Nenhuma / Geral' },
                ...subjects.map((sub) => ({
                  value: sub.id,
                  label: sub.name,
                  color: sub.color,
                })),
              ]}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <Calendar size={13} />
              <span>Data de Entrega</span>
            </label>
            <CustomDatePicker
              value={dueDate}
              onChange={setDueDate}
              size="sm"
              placeholder="Selecione o prazo"
            />
            {/* Smart Next Class Date Suggestion based on Timetable */}
            {nextClassSuggestion && (
              <button
                type="button"
                onClick={() => setDueDate(nextClassSuggestion.dateStr)}
                className={`mt-1 w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] transition-all text-left cursor-pointer select-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none border-none shadow-none ${
                  dueDate === nextClassSuggestion.dateStr
                    ? 'bg-[var(--action-primary)]/15 text-[var(--action-primary)] font-bold'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/80'
                }`}
                title={`Sugerido pelo cronograma de aulas: ${nextClassSuggestion.weekdayName}`}
              >
                <span className="truncate">
                  Próxima aula ({nextClassSuggestion.subjectCode}):
                </span>
                <span className="font-bold shrink-0 ml-1">
                  {nextClassSuggestion.formatted}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 flex items-center gap-1">
            <AlertCircle size={13} />
            <span>Prioridade</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {priorities.map((p) => {
              const isSelected = priority === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`py-1.5 px-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--action-primary)] bg-[var(--action-primary)]/10 text-[var(--text-primary)] shadow-xs'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-card)]'
                  }`}
                >
                  <span className={`size-2 rounded-full ${p.color}`} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Attachments Section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
              <Paperclip size={13} />
              <span>Anexos ({attachments.length})</span>
            </label>
            <label className="cursor-pointer text-[11px] font-bold text-[var(--action-primary)] hover:underline flex items-center gap-1">
              <UploadCloud size={13} />
              <span>Adicionar Arquivo</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {isUploading && (
            <div className="p-2 rounded-lg bg-[var(--surface-subtle)] flex items-center justify-center gap-2 text-[11px] text-[var(--text-secondary)] animate-pulse mb-1.5">
              <Loader2 size={13} className="animate-spin text-[var(--action-primary)]" />
              <span>Enviando anexo...</span>
            </div>
          )}

          {attachments.length > 0 ? (
            <div className="space-y-1 max-h-28 overflow-y-auto no-scrollbar">
              {attachments.map((att, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-subtle)] text-xs text-[var(--text-primary)]"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Paperclip size={13} className="text-[var(--action-primary)] shrink-0" />
                    <span className="truncate font-medium">{att.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                    title="Remover anexo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 rounded-lg border border-dashed border-[var(--border-subtle)] text-center text-[11px] text-[var(--text-muted)]">
              Nenhum arquivo anexado
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="pt-2 flex gap-2.5">
          <button
            type="button"
            onClick={closeTaskModal}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-bold text-xs hover:bg-[var(--surface-subtle)]/80 active:scale-95 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--action-primary)] text-white font-bold text-xs shadow-md shadow-[var(--action-primary)]/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving && <Loader2 size={15} className="animate-spin" />}
            <span>{editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
