export type Priority = 'low' | 'medium' | 'high';

export type TaskCategory = 'all' | 'today' | 'upcoming' | 'overdue' | 'done';

export type ViewMode = 'list' | 'grid';

export interface TaskAttachment {
  name: string;
  url: string;
  path: string;
  type?: string;
  size?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  due_date?: string | null; // YYYY-MM-DD
  subject_id?: string | null;
  status?: 'pending' | 'done';
  created_at?: string;
  attachments?: TaskAttachment[] | null;
}

export interface FilterState {
  search: string;
  category: TaskCategory;
  priority: 'all' | Priority;
  subjectId: string;
  viewMode: ViewMode;
}
