import { getSupabaseClient } from './supabase';
import { TaskAttachment } from '../types/task';

export const storageService = {
  async uploadAttachment(file: File, taskId: string): Promise<TaskAttachment> {
    const client = getSupabaseClient();
    if (!client) {
      // Create a local data URL preview when Supabase is offline
      const reader = new FileReader();
      const localUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      return {
        name: file.name,
        url: localUrl,
        path: `local/${taskId}/${file.name}`,
        type: file.type,
        size: file.size,
      };
    }

    const fileExt = file.name.split('.').pop();
    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${taskId}/${cleanFileName}`;

    const { error: uploadError } = await client.storage
      .from('task-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.warn('[Storage] Upload to bucket error, using local fallback:', uploadError);
      const reader = new FileReader();
      const localUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      return {
        name: file.name,
        url: localUrl,
        path: filePath,
        type: file.type,
        size: file.size,
      };
    }

    const {
      data: { publicUrl },
    } = client.storage.from('task-attachments').getPublicUrl(filePath);

    return {
      name: file.name,
      url: publicUrl,
      path: filePath,
      type: file.type,
      size: file.size,
    };
  },

  async deleteAttachment(path: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client || path.startsWith('local/')) return;

    try {
      await client.storage.from('task-attachments').remove([path]);
    } catch (err) {
      console.warn('[Storage] Delete error:', err);
    }
  },
};
