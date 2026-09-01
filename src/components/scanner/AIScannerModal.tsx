import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  FolderOpen,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { CustomSelect } from '../common/CustomSelect';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { useApp } from '../../context/AppContext';
import { aiService, AIParsedTask } from '../../services/aiService';
import { Priority } from '../../types/task';
import { getNextClassForSubject } from '../../utils/scheduleHelper';
import { findBestMatchingSubject } from '../../utils/subjectMatcher';

export const AIScannerModal: React.FC = () => {
  const { isAIScannerOpen, closeAIScannerModal, subjects, createTask, showToast } = useApp();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<AIParsedTask | null>(null);

  // Editable fields for parsed task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>('');

  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustDescriptionHeight = () => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      const newHeight = Math.min(descriptionRef.current.scrollHeight, 125);
      descriptionRef.current.style.height = `${Math.max(newHeight, 56)}px`;
    }
  };

  useEffect(() => {
    adjustDescriptionHeight();
  }, [description, parsedResult]);

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const nextClassSuggestion = useMemo(() => {
    return getNextClassForSubject(selectedSubject?.name);
  }, [selectedSubject]);

  const handleSubjectChange = (newSubId: string) => {
    setSubjectId(newSubId);
    const sub = subjects.find((s) => s.id === newSubId);
    const suggestion = getNextClassForSubject(sub?.name);
    if (suggestion && !dueDate) {
      setDueDate(suggestion.dateStr);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setIsProcessing(false);
    setParsedResult(null);
    setTitle('');
    setDescription('');
    setSubjectId('');
    setPriority('medium');
    setDueDate('');
  };

  const handleClose = () => {
    handleReset();
    closeAIScannerModal();
  };

  const handleImageSelected = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido', 'warning');
      return;
    }

    try {
      const base64 = await aiService.fileToBase64(file);
      setImagePreview(base64);
      processImageWithAI(base64);
    } catch (err) {
      console.error(err);
      showToast('Erro ao ler a imagem', 'error');
    }
  };

  const processImageWithAI = async (base64: string) => {
    setIsProcessing(true);
    setParsedResult(null);

    try {
      const result = await aiService.processImage(base64);
      setParsedResult(result);
      setTitle(result.title || 'Tarefa escaneada');
      setDescription(result.description || '');
      setPriority(result.priority || 'medium');
      setDueDate(result.due_date || '');

      // Try to find matching subject by name using robust matcher
      if (result.subject_suggestion && subjects.length > 0) {
        const found = findBestMatchingSubject(subjects, result.subject_suggestion);
        if (found) {
          setSubjectId(found.id);
          // If no due date came from the image, suggest next class date for this subject
          if (!result.due_date) {
            const suggestion = getNextClassForSubject(found.name);
            if (suggestion) {
              setDueDate(suggestion.dateStr);
            }
          }
        } else {
          setSubjectId(subjects[0].id);
        }
      } else if (subjects.length > 0) {
        setSubjectId(subjects[0].id);
      }

      showToast('Anotações processadas com sucesso pela IA!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Falha ao analisar a imagem com a IA', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveParsedTask = async () => {
    if (!title.trim()) {
      showToast('O título não pode ficar vazio', 'warning');
      return;
    }

    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || null,
        subject_id: subjectId || null,
        priority,
        due_date: dueDate || null,
        status: 'pending',
      });
      handleClose();
    } catch (err) {
      console.error(err);
      showToast('Erro ao criar tarefa', 'error');
    }
  };

  return (
    <Modal
      isOpen={isAIScannerOpen}
      onClose={handleClose}
      title="Scanner de Tarefas com IA"
      subtitle="Fotografe o quadro ou caderno para extrair suas tarefas automaticamente"
      maxWidth="max-w-xl"
    >
      {!imagePreview ? (
        /* Upload Area */
        <div className="space-y-4">
          <div className="rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-colors bg-[var(--surface-subtle)]/50 group">
            <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
              Envie uma foto do seu caderno ou quadro
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-6">
              Nossa inteligência artificial (Gemini 2.0) identifica questões, prazos e matéria automaticamente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {/* Camera Capture on Mobile */}
              <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--action-primary)] text-white text-xs font-bold shadow-md shadow-[var(--action-primary)]/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer text-center">
                <Camera size={16} />
                <span>Tirar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleImageSelected(e.target.files[0]);
                  }}
                />
              </label>

              {/* Upload from Gallery */}
              <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--surface-card)] text-[var(--text-primary)] text-xs font-bold hover:bg-[var(--surface-subtle)] active:scale-95 transition-all cursor-pointer shadow-xs text-center">
                <UploadCloud size={16} />
                <span>Escolher da Galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleImageSelected(e.target.files[0]);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      ) : isProcessing ? (
        /* Processing Loading State */
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="size-16 rounded-full border-4 border-[var(--action-primary)]/20 border-t-[var(--action-primary)] animate-spin" />
            <Camera
              size={20}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--action-primary)]"
            />
          </div>
          <div>
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              Analisando sua imagem...
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              O Gemini está lendo suas anotações e formatando as tarefas.
            </p>
          </div>
        </div>
      ) : parsedResult ? (
        /* Parsed Result Review & Edit */
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Tarefa extraída com sucesso! Revise os detalhes abaixo:</span>
            </div>
            <button
              onClick={handleReset}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Trocar foto</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Título Sugerido
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--surface-subtle)] text-[var(--text-primary)] px-4 py-2.5 rounded-2xl text-sm font-semibold outline-none border border-transparent focus:border-[var(--action-primary)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Conteúdo Extraído
            </label>
            <textarea
              ref={descriptionRef}
              rows={2}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                adjustDescriptionHeight();
              }}
              className="w-full bg-[var(--surface-subtle)] text-[var(--text-primary)] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed outline-none border border-transparent focus:border-[var(--action-primary)] resize-none min-h-[3.5rem] max-h-[7.8rem] overflow-y-auto"
            />
          </div>

          {/* Subject & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                <FolderOpen size={13} />
                <span>Matéria</span>
              </label>
              <CustomSelect
                value={subjectId}
                onChange={handleSubjectChange}
                size="sm"
                placeholder="Geral / Sem matéria"
                options={[
                  { value: '', label: 'Geral / Sem matéria' },
                  ...subjects.map((s) => ({
                    value: s.id,
                    label: s.name,
                    color: s.color,
                  })),
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 flex items-center gap-1">
                <Calendar size={13} />
                <span>Data de Entrega</span>
              </label>
              <CustomDatePicker
                value={dueDate}
                onChange={setDueDate}
                size="sm"
                placeholder="Selecione o prazo"
              />
              {/* Smart Next Class Date Suggestion */}
              {nextClassSuggestion && (
                <button
                  type="button"
                  onClick={() => setDueDate(nextClassSuggestion.dateStr)}
                  className={`mt-1.5 w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] transition-all text-left cursor-pointer select-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none border-none shadow-none ${
                    dueDate === nextClassSuggestion.dateStr
                      ? 'bg-[var(--action-primary)]/15 text-[var(--action-primary)] font-bold'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/80'
                  }`}
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

          {/* Action Buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-bold text-xs hover:bg-[var(--surface-subtle)]/80"
            >
              Recomeçar
            </button>
            <button
              type="button"
              onClick={handleSaveParsedTask}
              className="flex-1 py-3 px-4 rounded-2xl bg-[var(--action-primary)] text-white font-bold text-xs shadow-lg shadow-[var(--action-primary)]/20 hover:opacity-95 active:scale-95 transition-all"
            >
              Salvar nas Tarefas
            </button>
          </div>
        </div>
      ) : (
        /* Error or Retry state */
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <AlertTriangle size={36} className="text-amber-500" />
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Não foi possível processar esta imagem.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-xl bg-[var(--action-primary)] text-white text-xs font-bold"
          >
            Tentar Outra Foto
          </button>
        </div>
      )}
    </Modal>
  );
};
