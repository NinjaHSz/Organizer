// Organizer Service Worker - Background Engine V2
const VERSION = "1.0.5";
const DB_NAME = "organizer-sw-db";
const STORE_NAME = "config";

// Inicialização e atualização
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Timer de verificação (O SW pode morrer, mas tentamos manter vivo)
let checkInterval = null;

const startBackgroundCheck = () => {
  if (checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(async () => {
    await checkNotifications();
  }, 45000); // 45 segundos
};

const checkNotifications = async () => {
  // Abrir banco de dados para ler tarefas e config
  const db = await openDB();
  const tasks = (await getData(db, "tasks")) || [];
  const settings = (await getData(db, "settings")) || {};

  if (!settings.dailyEnabled) return;

  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  // 1. Resumo Semanal
  const [targetH, targetM] = (settings.notifTime || "09:00")
    .split(":")
    .map(Number);
  if (currentH === targetH && currentM === targetM) {
    const lastDate = await getData(db, "lastDailyNotif");
    if (lastDate !== todayStr) {
      const weekTasks = tasks.filter(
        (t) => t.status !== "done" && (!t.due_date || t.due_date >= todayStr),
      );

      await showNotification("Resumo da Semana", {
        body:
          weekTasks.length > 0
            ? `Você tem ${weekTasks.length} tarefas pendentes. Fique atento!`
            : "Sua semana está tranquila!",
        tag: "daily-summary",
      });
      await setData(db, "lastDailyNotif", todayStr);
    }
  }
};

// --- Funções de Ajuda ---
const openDB = () => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
  });
};

const getData = (db, key) => {
  return new Promise((resolve) => {
    const trans = db.transaction(STORE_NAME, "readonly");
    const req = trans.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
  });
};

const setData = (db, key, val) => {
  return new Promise((resolve) => {
    const trans = db.transaction(STORE_NAME, "readwrite");
    const req = trans.objectStore(STORE_NAME).put(val, key);
    req.onsuccess = () => resolve();
  });
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

// Listeners
self.addEventListener("message", async (event) => {
  const data = event.data;
  if (data.type === "SYNC_DATA") {
    const db = await openDB();
    await setData(db, "tasks", data.tasks);
    await setData(db, "settings", data.settings);
    console.log("[SW] Dados sincronizados");
    startBackgroundCheck();
  }
  if (data.type === "PING") {
    startBackgroundCheck();
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
