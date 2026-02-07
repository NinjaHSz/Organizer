// Organizer Service Worker - Background Engine V4
const VERSION = "1.0.7";
const DB_NAME = "organizer-sw-db";
const STORE_NAME = "config";

// 1. Inicialização Global do Timer (Para rodar sempre que o SW acordar)
let checkInterval = null;

const startBackgroundCheck = () => {
  if (checkInterval) clearInterval(checkInterval);
  console.log("[SW] ⏰ Timer iniciado/reiniciado.");
  checkInterval = setInterval(async () => {
    try {
      await checkNotifications();
    } catch (e) {
      console.error("[SW] Erro no check:", e);
    }
  }, 45000); // 45 segundos
};

// Auto-start quando o cérebro (SW) acorda
startBackgroundCheck();

self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("[SW] Instalado V" + VERSION);
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
  console.log("[SW] Ativado");
  startBackgroundCheck(); // Garante o timer na ativação
});

const checkNotifications = async () => {
  const db = await openDB();
  const settings = (await getData(db, "settings")) || {};
  const tasks = (await getData(db, "tasks")) || [];

  if (!settings.dailyEnabled) return;

  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const todayStr = getLocalDateString(now);

  // Logs silenciosos que aparecem no console do SW
  // console.log(`[SW] Batida de ponto: ${currentH}:${currentM}`);

  // 1. Resumo Semanal
  const [targetH, targetM] = (settings.notifTime || "09:00")
    .split(":")
    .map(Number);
  if (currentH === targetH && currentM === targetM) {
    const lastDate = await getData(db, "lastDailyNotif");
    if (lastDate !== todayStr) {
      console.log("[SW] 🚀 Disparando Resumo Semanal");
      const weekTasks = tasks.filter(
        (t) => t.status !== "done" && (!t.due_date || t.due_date >= todayStr),
      );

      await showNotification("Foco da Semana 🎯", {
        body:
          weekTasks.length > 0
            ? `Você tem ${weekTasks.length} tarefas pendentes. Vamos começar?`
            : "Nenhuma tarefa para esta semana. Bom descanso!",
        tag: "daily-summary",
      });
      await setData(db, "lastDailyNotif", todayStr);
    }
  }

  // 2. Alertas de Aula (Apenas teste básico enquanto ativo)
  // Pode ser expandido aqui se necessário
};

// IndexedDB Helpers
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME))
        db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getData = (db, key) => {
  return new Promise((resolve) => {
    const trans = db.transaction(STORE_NAME, "readonly");
    const req = trans.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
};

const setData = (db, key, val) => {
  return new Promise((resolve) => {
    const trans = db.transaction(STORE_NAME, "readwrite");
    const req = trans.objectStore(STORE_NAME).put(val, key);
    req.onsuccess = () => resolve();
  });
};

const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const showNotification = (title, options) => {
  return self.registration.showNotification(title, {
    icon: "/assets/div.ico",
    badge: "/assets/div.ico",
    vibrate: [200, 100, 200],
    requireInteraction: true,
    ...options,
  });
};

// Message Listener
self.addEventListener("message", async (event) => {
  const data = event.data;
  if (data.type === "SYNC_DATA") {
    const db = await openDB();
    await setData(db, "tasks", data.tasks);
    await setData(db, "settings", data.settings);
    await setData(db, "lastSync", new Date().getTime());
    console.log("[SW] 🔄 Sincronizado com App");
    startBackgroundCheck();
  }
  if (data.type === "GET_SW_STATUS") {
    const db = await openDB();
    const settings = await getData(db, "settings");
    const tasks = await getData(db, "tasks");
    const lastSync = await getData(db, "lastSync");

    event.source.postMessage({
      type: "SW_STATUS_RESPONSE",
      status: "active",
      version: VERSION,
      lastSync: lastSync,
      taskCount: tasks ? tasks.length : 0,
      settings: settings,
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        if (list.length > 0) return list[0].focus();
        return clients.openWindow("/");
      }),
  );
});
