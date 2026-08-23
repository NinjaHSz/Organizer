import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Task, FilterState, TaskCategory, Priority, ViewMode } from '../types/task';
import { Subject } from '../types/subject';
import { dbService } from '../services/supabase';
import { notificationService } from '../services/notificationService';

export type AppPage = 'dashboard' | 'calendar' | 'schedule' | 'subjects' | 'settings';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  // State
  tasks: Task[];
  subjects: Subject[];
  activePage: AppPage;
  filters: FilterState;
  completedTaskIds: string[];
  calendarDate: Date;
  selectedCalendarDate: string;
  isLoading: boolean;
  toasts: ToastItem[];

  // Modal States
  isTaskModalOpen: boolean;
  editingTask: Task | null;
  initialTaskDueDate: string | null;
  isAIScannerOpen: boolean;
  isSubjectModalOpen: boolean;
  editingSubject: Subject | null;

  // Actions
  setActivePage: (page: AppPage) => void;
  setSearch: (search: string) => void;
  setCategory: (category: TaskCategory) => void;
  setPriorityFilter: (priority: 'all' | Priority) => void;
  setSubjectFilter: (subjectId: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setCalendarDate: (date: Date) => void;
  setSelectedCalendarDate: (dateStr: string) => void;

  // Task Actions
  createTask: (data: Omit<Task, 'id' | 'created_at'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskDone: (id: string) => Promise<void>;

  // Subject Actions
  createSubject: (data: Omit<Subject, 'id' | 'created_at'>) => Promise<Subject>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Modal Triggers
  openNewTaskModal: (dueDate?: string) => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;
  openAIScannerModal: () => void;
  closeAIScannerModal: () => void;
  openNewSubjectModal: () => void;
  openEditSubjectModal: (subject: Subject) => void;
  closeSubjectModal: () => void;

  // Utilities
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  dismissToast: (id: string) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activePage, setActivePage] = useState<AppPage>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialTaskDueDate, setInitialTaskDueDate] = useState<string | null>(null);
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>(() => ({
    search: '',
    category: 'upcoming',
    priority: 'all',
    subjectId: 'all',
    viewMode: (localStorage.getItem('view-mode') as ViewMode) || 'list',
  }));

  // Calendar
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Completed Tasks (Ids)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('completed_tasks') || '[]');
    } catch {
      return [];
    }
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedTasks, fetchedSubjects] = await Promise.all([
        dbService.getTasks(),
        dbService.getSubjects(),
      ]);
      setTasks(fetchedTasks);
      setSubjects(fetchedSubjects);

      // Synchronize completedTaskIds with loaded tasks
      const doneIds = fetchedTasks.filter((t) => t.status === 'done').map((t) => t.id);
      setCompletedTaskIds((prev) => {
        // Keep offline-created completed task IDs that aren't in fetchedTasks yet
        const offlineDone = prev.filter((id) => !fetchedTasks.some((t) => t.id === id));
        const allDoneIds = Array.from(new Set([...doneIds, ...offlineDone]));
        localStorage.setItem('completed_tasks', JSON.stringify(allDoneIds));
        return allDoneIds;
      });
    } catch (err) {
      console.error('Failed to load data:', err);
      showToast('Erro ao sincronizar com banco de dados', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic in-app daily reminder check (fires at user's chosen time)
  useEffect(() => {
    const checkReminder = () => {
      const isDailyEnabled = localStorage.getItem('daily-reminders-enabled') === 'true';
      if (!isDailyEnabled) return;

      const targetTime = localStorage.getItem('notif-time') || '09:00';
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`;
      const lastFiredDate = localStorage.getItem('last-daily-notif-date');

      if (currentTime === targetTime && lastFiredDate !== todayDateStr) {
        localStorage.setItem('last-daily-notif-date', todayDateStr);

        // Calculate end of the current week
        const currentDayOfWeek = now.getDay();
        const daysUntilSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (daysUntilSunday === 0 ? 6 : daysUntilSunday));
        const endOfWeekStr = `${endOfWeek.getFullYear()}-${String(endOfWeek.getMonth() + 1).padStart(2, '0')}-${String(endOfWeek.getDate()).padStart(2, '0')}`;

        const pendingToday = tasks.filter(
          (t) =>
            t.due_date === todayDateStr &&
            !completedTaskIds.includes(t.id) &&
            t.status !== 'done'
        );

        const pendingThisWeek = tasks.filter(
          (t) =>
            t.due_date &&
            t.due_date >= todayDateStr &&
            t.due_date <= endOfWeekStr &&
            !completedTaskIds.includes(t.id) &&
            t.status !== 'done'
        );

        const weekCount = pendingThisWeek.length;
        const weekText = weekCount === 1 ? '1 tarefa' : `${weekCount} tarefas`;

        if (pendingToday.length > 0) {
          const todayText = pendingToday.length === 1 ? '1 tarefa' : `${pendingToday.length} tarefas`;
          notificationService.showLocalNotification('Lembrete de Tarefas', {
            body: `Você tem ${todayText} para entregar hoje e ${weekText} no total para esta semana.`,
            tag: 'daily-reminder',
          });
        } else if (weekCount > 0) {
          notificationService.showLocalNotification('Passando para lembrar das suas Tarefas', {
            body: `Você tem ${weekText} para entregar nesta semana.`,
            tag: 'daily-reminder',
          });
        } else {
          notificationService.showLocalNotification('Passando para lembrar das suas Tarefas', {
            body: 'Você não tem tarefas pendentes para entregar nesta semana!',
            tag: 'daily-reminder',
          });
        }
      }
    };

    const interval = setInterval(checkReminder, 25000); // Check every 25 seconds
    checkReminder();
    return () => clearInterval(interval);
  }, [tasks, completedTaskIds]);

  // Tasks CRUD
  const createTask = async (data: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
    const created = await dbService.createTask(data);
    setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
    showToast('Tarefa criada com sucesso!', 'success');
    return created;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    if (updates.status) {
      setCompletedTaskIds((prev) => {
        const updated =
          updates.status === 'done'
            ? Array.from(new Set([...prev, id]))
            : prev.filter((cid) => cid !== id);
        localStorage.setItem('completed_tasks', JSON.stringify(updated));
        return updated;
      });
    }
    await dbService.updateTask(id, updates);
    showToast('Tarefa atualizada!', 'info');
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setCompletedTaskIds((prev) => {
      const filtered = prev.filter((cid) => cid !== id);
      localStorage.setItem('completed_tasks', JSON.stringify(filtered));
      return filtered;
    });
    await dbService.deleteTask(id);
    showToast(`Tarefa "${taskToDelete?.title || ''}" removida`, 'info');
  };

  const toggleTaskDone = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const currentlyDone = completedTaskIds.includes(id) || task?.status === 'done';
    const isNowDone = !currentlyDone;

    let newCompleted: string[];
    if (isNowDone) {
      newCompleted = Array.from(new Set([...completedTaskIds, id]));
      // Celebrate with confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'],
      });
      showToast('Tarefa concluída! Parabéns! 🎉', 'success');
    } else {
      newCompleted = completedTaskIds.filter((cid) => cid !== id);
      showToast('Tarefa reaberta', 'info');
    }

    setCompletedTaskIds(newCompleted);
    localStorage.setItem('completed_tasks', JSON.stringify(newCompleted));

    const newStatus: Task['status'] = isNowDone ? 'done' : 'todo';

    // Synchronously update in-memory tasks state
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    // Persist to Supabase / Local Cache
    await dbService.updateTask(id, { status: newStatus });
  };

  // Subjects CRUD
  const createSubject = async (data: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> => {
    const created = await dbService.createSubject(data);
    setSubjects((prev) => [...prev, created]);
    showToast(`Matéria "${created.name}" criada!`, 'success');
    return created;
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    await dbService.updateSubject(id, updates);
    showToast('Matéria atualizada!', 'info');
  };

  const deleteSubject = async (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    await dbService.deleteSubject(id);
    showToast('Matéria removida', 'info');
  };

  // Filter Setters
  const setSearch = (search: string) => setFilters((prev) => ({ ...prev, search }));
  const setCategory = (category: TaskCategory) => setFilters((prev) => ({ ...prev, category }));
  const setPriorityFilter = (priority: 'all' | Priority) => setFilters((prev) => ({ ...prev, priority }));
  const setSubjectFilter = (subjectId: string) => setFilters((prev) => ({ ...prev, subjectId }));
  const setViewMode = (viewMode: ViewMode) => {
    localStorage.setItem('view-mode', viewMode);
    setFilters((prev) => ({ ...prev, viewMode }));
  };

  // Modal Handlers
  const openNewTaskModal = (dueDate?: string) => {
    setEditingTask(null);
    setInitialTaskDueDate(dueDate || null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setInitialTaskDueDate(null);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setInitialTaskDueDate(null);
  };

  const openAIScannerModal = () => setIsAIScannerOpen(true);
  const closeAIScannerModal = () => setIsAIScannerOpen(false);

  const openNewSubjectModal = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (subject: Subject) => {
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const closeSubjectModal = () => {
    setIsSubjectModalOpen(false);
    setEditingSubject(null);
  };

  const contextValue = useMemo(
    () => ({
      tasks,
      subjects,
      activePage,
      filters,
      completedTaskIds,
      calendarDate,
      selectedCalendarDate,
      isLoading,
      toasts,
      isTaskModalOpen,
      editingTask,
      initialTaskDueDate,
      isAIScannerOpen,
      isSubjectModalOpen,
      editingSubject,
      setActivePage,
      setSearch,
      setCategory,
      setPriorityFilter,
      setSubjectFilter,
      setViewMode,
      setCalendarDate,
      setSelectedCalendarDate,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskDone,
      createSubject,
      updateSubject,
      deleteSubject,
      openNewTaskModal,
      openEditTaskModal,
      closeTaskModal,
      openAIScannerModal,
      closeAIScannerModal,
      openNewSubjectModal,
      openEditSubjectModal,
      closeSubjectModal,
      showToast,
      dismissToast,
      refreshData,
    }),
    [
      tasks,
      subjects,
      activePage,
      filters,
      completedTaskIds,
      calendarDate,
      selectedCalendarDate,
      isLoading,
      toasts,
      isTaskModalOpen,
      editingTask,
      initialTaskDueDate,
      isAIScannerOpen,
      isSubjectModalOpen,
      editingSubject,
      showToast,
      dismissToast,
      refreshData,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
