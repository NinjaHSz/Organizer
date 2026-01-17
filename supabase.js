/**
 * Supabase Client Settings & Database Operations
 */

// Integrating provided Supabase project credentials
const SUPABASE_URL = localStorage.getItem('supabase_url') || 'https://sywueeqbijwdjjleyzbo.supabase.co';
const SUPABASE_KEY = localStorage.getItem('supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5d3VlZXFiaWp3ZGpqbGV5emJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTYwMTksImV4cCI6MjA4NDIzMjAxOX0.LtUDmZ5MIxTAuf8L9TZFvYKo8HY6TngiJyVRouln85Q';

let supabaseClient = null;

if (SUPABASE_URL && !SUPABASE_URL.includes('YOUR_SUPABASE') && SUPABASE_KEY && !SUPABASE_KEY.includes('YOUR_SUPABASE')) {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabaseClient = supabaseClient;
    } catch (e) {
        console.error("Failed to initialize Supabase:", e);
    }
}

const db = {
    // TASKS
    async getTasks() {
        const { data, error } = await supabaseClient
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async createTask(taskData) {
        const { data, error } = await supabaseClient
            .from('tasks')
            .insert([taskData])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateTask(id, updates) {
        const { data, error } = await supabaseClient
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteTask(id) {
        const { error } = await supabaseClient
            .from('tasks')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // SUBJECTS
    async getSubjects() {
        const { data, error } = await supabaseClient
            .from('subjects')
            .select('*')
            .order('name', { ascending: true });
        if (error) throw error;
        return data;
    },

    async createSubject(subjectData) {
        const { data, error } = await supabaseClient
            .from('subjects')
            .insert([subjectData])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateSubject(id, updates) {
        const { data, error } = await supabaseClient
            .from('subjects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteSubject(id) {
        const { error } = await supabaseClient
            .from('subjects')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

window.db = db;
