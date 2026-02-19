/**
 * Supabase Storage Operations
 */

const getClient = () => {
  return window.supabaseClient;
};

export const storage = {
  async uploadFile(file, taskId) {
    const supabase = getClient();
    if (!supabase) throw new Error("Supabase client not initialized");

    const fileExt = file.name.split(".").pop();
    const fileName = `${taskId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from("task-attachments")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("task-attachments").getPublicUrl(filePath);

    return {
      name: file.name,
      url: publicUrl,
      path: filePath,
      type: file.type,
      size: file.size,
    };
  },

  async deleteFile(path) {
    const supabase = getClient();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { error } = await supabase.storage
      .from("task-attachments")
      .remove([path]);

    if (error) throw error;
  },
};
