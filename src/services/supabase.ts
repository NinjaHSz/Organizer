import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task } from '../types/task';
import { Subject } from '../types/subject';

const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const DEFAULT_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;

  const url = localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL;
  const key = localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_KEY;

  if (!url || !key || url.includes('YOUR_SUPABASE') || key.includes('YOUR_SUPABASE')) {
    return null;
  }

  try {
    clientInstance = createClient(url, key);
    return clientInstance;
  } catch (error) {
    console.error('[Supabase] Init error:', error);
    return null;
  }
};

export const resetSupabaseClient = () => {
  clientInstance = null;
  return getSupabaseClient();
};

export const dbService = {
  // TASKS
  async getTasks(): Promise<Task[]> {
    const cached = localStorage.getItem('cache_tasks');
    const localTasks: Task[] = cached ? JSON.parse(cached) : [];

    if (!navigator.onLine) {
      return localTasks;
    }

    const client = getSupabaseClient();
    if (!client) return localTasks;

    try {
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const tasks = ((data || []) as Task[]).map((t) => ({
        ...t,
        status: (t.status === 'done' ? 'done' : 'todo') as Task['status'],
      }));
      localStorage.setItem('cache_tasks', JSON.stringify(tasks));
      return tasks;
    } catch (err) {
      console.warn('[DB] Fallback to cache on getTasks:', err);
      return localTasks;
    }
  },

  async createTask(taskData: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const client = getSupabaseClient();
    const tempId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Normalize status for database check constraint ('todo' | 'done')
    const dbStatus = taskData.status === 'done' ? 'done' : 'todo';
    const dbPayload = {
      ...taskData,
      status: dbStatus,
    };

    const newTask: Task = {
      ...taskData,
      status: dbStatus,
      id: tempId,
      created_at: new Date().toISOString(),
    };

    // Update local cache first
    const cached = localStorage.getItem('cache_tasks');
    const list: Task[] = cached ? JSON.parse(cached) : [];
    list.unshift(newTask);
    localStorage.setItem('cache_tasks', JSON.stringify(list));

    if (client && navigator.onLine) {
      try {
        const { data, error } = await client
          .from('tasks')
          .insert([dbPayload])
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          const createdTask = data[0] as Task;
          // Replace temp task with real data
          const updated = list.map((t) => (t.id === tempId ? createdTask : t));
          localStorage.setItem('cache_tasks', JSON.stringify(updated));
          return createdTask;
        }
      } catch (err) {
        console.warn('[DB] Supabase error in createTask, saved locally:', err);
      }
    }

    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    // Normalize status for database check constraint ('todo' | 'done')
    const dbUpdates: any = { ...updates };
    if (dbUpdates.status) {
      dbUpdates.status = dbUpdates.status === 'done' ? 'done' : 'todo';
    }

    // Update local cache
    const cached = localStorage.getItem('cache_tasks');
    let list: Task[] = cached ? JSON.parse(cached) : [];
    list = list.map((t) => (t.id === id ? { ...t, ...updates, ...(dbUpdates.status ? { status: dbUpdates.status } : {}) } : t));
    localStorage.setItem('cache_tasks', JSON.stringify(list));

    const client = getSupabaseClient();
    if (client && navigator.onLine) {
      try {
        const { data, error } = await client
          .from('tasks')
          .update(dbUpdates)
          .eq('id', id)
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          return data[0] as Task;
        }
      } catch (err) {
        console.warn('[DB] Supabase error in updateTask:', err);
      }
    }

    return list.find((t) => t.id === id) || null;
  },

  async deleteTask(id: string): Promise<void> {
    // Update local cache
    const cached = localStorage.getItem('cache_tasks');
    if (cached) {
      const list: Task[] = JSON.parse(cached);
      localStorage.setItem('cache_tasks', JSON.stringify(list.filter((t) => t.id !== id)));
    }

    const client = getSupabaseClient();
    if (client && navigator.onLine) {
      try {
        const { error } = await client.from('tasks').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn('[DB] Supabase error in deleteTask:', err);
      }
    }
  },

  // SUBJECTS
  async getSubjects(): Promise<Subject[]> {
    const cached = localStorage.getItem('cache_subjects');
    const localSubjects: Subject[] = cached ? JSON.parse(cached) : [];

    if (!navigator.onLine) return localSubjects;

    const client = getSupabaseClient();
    if (!client) return localSubjects;

    try {
      const { data, error } = await client
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      const subjects = (data || []) as Subject[];
      localStorage.setItem('cache_subjects', JSON.stringify(subjects));
      return subjects;
    } catch (err) {
      console.warn('[DB] Fallback to cache on getSubjects:', err);
      return localSubjects;
    }
  },

  async createSubject(subjectData: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> {
    const client = getSupabaseClient();
    const tempId = 'sub_' + Date.now();
    const newSubject: Subject = {
      ...subjectData,
      id: tempId,
      created_at: new Date().toISOString(),
    };

    const cached = localStorage.getItem('cache_subjects');
    const list: Subject[] = cached ? JSON.parse(cached) : [];
    list.push(newSubject);
    localStorage.setItem('cache_subjects', JSON.stringify(list));

    if (client && navigator.onLine) {
      try {
        const { data, error } = await client
          .from('subjects')
          .insert([subjectData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const updated = list.map((s) => (s.id === tempId ? (data as Subject) : s));
          localStorage.setItem('cache_subjects', JSON.stringify(updated));
          return data as Subject;
        }
      } catch (err) {
        console.warn('[DB] Supabase error in createSubject:', err);
      }
    }

    return newSubject;
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
    const cached = localStorage.getItem('cache_subjects');
    let list: Subject[] = cached ? JSON.parse(cached) : [];
    list = list.map((s) => (s.id === id ? { ...s, ...updates } : s));
    localStorage.setItem('cache_subjects', JSON.stringify(list));

    const client = getSupabaseClient();
    if (client && navigator.onLine) {
      try {
        const { data, error } = await client
          .from('subjects')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data as Subject;
      } catch (err) {
        console.warn('[DB] Supabase error in updateSubject:', err);
      }
    }

    return list.find((s) => s.id === id) || null;
  },

  async deleteSubject(id: string): Promise<void> {
    const cached = localStorage.getItem('cache_subjects');
    if (cached) {
      const list: Subject[] = JSON.parse(cached);
      localStorage.setItem('cache_subjects', JSON.stringify(list.filter((s) => s.id !== id)));
    }

    const client = getSupabaseClient();
    if (client && navigator.onLine) {
      try {
        const { error } = await client.from('subjects').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn('[DB] Supabase error in deleteSubject:', err);
      }
    }
  },

  // PUSH SUBSCRIPTIONS
  async savePushSubscription(subscription: PushSubscription, settings: { dailyEnabled: boolean; notifTime: string }) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const subJson = subscription.toJSON();
      const payload = {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
        user_agent: navigator.userAgent,
        daily_enabled: settings.dailyEnabled,
        notif_time: settings.notifTime,
        updated_at: new Date().toISOString(),
      };

      await client.from('push_subscriptions').upsert(payload, { onConflict: 'endpoint' });
    } catch (err) {
      console.warn('[DB] Error saving push subscription:', err);
    }
  },

  async updatePushSettings(settings: { dailyEnabled: boolean; notifTime: string }) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await client
            .from('push_subscriptions')
            .update({
              daily_enabled: settings.dailyEnabled,
              notif_time: settings.notifTime,
              updated_at: new Date().toISOString(),
            })
            .eq('endpoint', sub.endpoint);
        }
      }
    } catch (err) {
      console.warn('[DB] Error updating push settings:', err);
    }
  },
};
