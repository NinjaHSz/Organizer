/**
 * Supabase Client Settings & Database Operations
 */

let supabaseClient = null;

const getClient = () => {
  if (supabaseClient) return supabaseClient;

  const url =
    localStorage.getItem("supabase_url") ||
    "https://sywueeqbijwdjjleyzbo.supabase.co";
  const key =
    localStorage.getItem("supabase_key") ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5d3VlZXFiaWp3ZGpqbGV5emJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTYwMTksImV4cCI6MjA4NDIzMjAxOX0.LtUDmZ5MIxTAuf8L9TZFvYKo8HY6TngiJyVRouln85Q";

  if (
    !url ||
    url.includes("YOUR_SUPABASE") ||
    !key ||
    key.includes("YOUR_SUPABASE")
  ) {
    return null;
  }

  try {
    if (window.supabase) {
      supabaseClient = window.supabase.createClient(url, key);
      window.supabaseClient = supabaseClient;
      console.log("✅ Supabase Client initialized.");
    }
  } catch (e) {
    console.error("❌ Supabase init error:", e);
  }

  return supabaseClient;
};

export const db = {
  // TASKS
  async getTasks() {
    if (!navigator.onLine) {
      console.log("[DB] Offline detectado em getTasks, usando cache.");
      const cached = localStorage.getItem("cache_tasks");
      return cached ? JSON.parse(cached) : [];
    }

    const supabaseClient = getClient();
    if (!supabaseClient) {
      const cached = localStorage.getItem("cache_tasks");
      return cached ? JSON.parse(cached) : [];
    }

    try {
      const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Salva no cache para uso offline
      localStorage.setItem("cache_tasks", JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn("[DB] Erro de rede em getTasks, usando cache local:", error);
      const cached = localStorage.getItem("cache_tasks");
      return cached ? JSON.parse(cached) : [];
    }
  },

  async createTask(taskData) {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient
      .from("tasks")
      .insert([taskData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTask(id, updates) {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTask(id) {
    const supabaseClient = getClient();
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  // SUBJECTS
  async getSubjects() {
    if (!navigator.onLine) {
      console.log("[DB] Offline detectado em getSubjects, usando cache.");
      const cached = localStorage.getItem("cache_subjects");
      return cached ? JSON.parse(cached) : [];
    }

    const supabaseClient = getClient();
    if (!supabaseClient) {
      const cached = localStorage.getItem("cache_subjects");
      return cached ? JSON.parse(cached) : [];
    }

    try {
      const { data, error } = await supabaseClient
        .from("subjects")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;

      // Salva no cache para uso offline
      localStorage.setItem("cache_subjects", JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn(
        "[DB] Erro de rede em getSubjects, usando cache local:",
        error,
      );
      const cached = localStorage.getItem("cache_subjects");
      return cached ? JSON.parse(cached) : [];
    }
  },

  async createSubject(subjectData) {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient
      .from("subjects")
      .insert([subjectData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSubject(id, updates) {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient
      .from("subjects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSubject(id) {
    const supabaseClient = getClient();
    if (!supabaseClient) return;
    const { error } = await supabaseClient
      .from("subjects")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  // REALTIME
  subscribeToTasks(callback) {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;
    return supabaseClient
      .channel("public:tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => callback(payload),
      )
      .subscribe();
  },

  subscribeToSubjects(callback) {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;
    return supabaseClient
      .channel("public:subjects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subjects" },
        (payload) => callback(payload),
      )
      .subscribe();
  },

  async savePushSubscription(subscription, settings = {}) {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;

    const subJson =
      typeof subscription.toJSON === "function"
        ? subscription.toJSON()
        : subscription;

    console.log("[DB] Salvando nova inscrição:", subJson.endpoint);

    const { data, error } = await supabaseClient
      .from("push_subscriptions")
      .insert([
        {
          subscription: subJson,
          notif_time: settings.notifTime || "09:00",
          daily_enabled: settings.dailyEnabled !== false,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Salva o ID localmente para atualizações rápidas e precisas
    if (data && data.id) {
      localStorage.setItem("ps_record_id", data.id);
    }

    return data;
  },

  async updatePushSettings(settings) {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      const recordId = localStorage.getItem("ps_record_id");

      const payload = {
        notif_time: settings.notifTime,
        daily_enabled: settings.dailyEnabled,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      console.log("[DB] Sincronizando ajustes:", payload);

      let query = supabaseClient.from("push_subscriptions").update(payload);

      if (recordId) {
        // Usa o ID para uma atualização direta e atômica
        query = query.eq("id", recordId);
      } else {
        // Fallback: Busca pelo endpoint no JSON
        query = query.filter("subscription->>endpoint", "eq", endpoint);
      }

      const { data, error } = await query.select();

      if (error) {
        console.error("[DB] Falha na sincronia:", error);
        throw error;
      }

      // Se atualizou mas não tínhamos o ID, salva agora
      if (data && data.length > 0 && !recordId) {
        localStorage.setItem("ps_record_id", data[0].id);
      }

      console.log("[DB] Sincronizado com sucesso.");
    }
  },
};

window.db = db;
