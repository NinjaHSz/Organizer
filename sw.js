// Organizer Service Worker - Background Engine V5
const VERSION = "1.1.0";
const DB_NAME = "organizer-sw-db";
const STORE_NAME = "config";

let lastFiredTime = null;

// 1. Inicialização Global do Timer
let checkInterval = null;

const startBackgroundCheck = () => {
  if (checkInterval) clearInterval(checkInterval);
  console.log(`[SW V${VERSION}] ⏰ Motor de fundo ativo.`);
  checkInterval = setInterval(async () => {
    try {
      await checkNotifications();
    } catch (e) {
      console.error("[SW] Erro no ciclo de check:", e);
    }
  }, 20000);
};

startBackgroundCheck();

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
  startBackgroundCheck();
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-check") {
    event.waitUntil(checkNotifications());
  }
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
  const timeKey = `${todayStr}-${currentH}:${currentM}`;

  if (lastFiredTime === timeKey) return;

  const timeSetting = settings.notifTime || "09:00";
  const [targetH, targetM] = timeSetting.split(":").map(Number);

  console.log(
    `[SW] ${currentH}:${currentM} -> Alvo: ${targetH}:${targetM} | Tasks: ${tasks.length}`,
  );

  if (currentH === targetH && currentM === targetM) {
    const lastDate = await getData(db, "lastDailyNotif");
    if (lastDate !== todayStr) {
      lastFiredTime = timeKey;
      await fireDailySummary(db, tasks, todayStr);
    }
  }
};

const fireDailySummary = async (db, tasks, todayStr) => {
  console.log("[SW] 🚀 Disparando Notificação");

  const pendingTasks = tasks.filter(
    (t) => t.status !== "done" && (!t.due_date || t.due_date >= todayStr),
  );

  await showNotification("Suas Tarefas de Hoje 🎯", {
    body:
      pendingTasks.length > 0
        ? `Você tem ${pendingTasks.length} tarefas pendentes. Vamos nessa?`
        : "Nenhuma tarefa para hoje. Aproveite seu tempo!",
    tag: "daily-summary",
    data: { url: "/" },
  });

  await setData(db, "lastDailyNotif", todayStr);
};

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
    ...options,
  });
};

self.addEventListener("message", async (event) => {
  const data = event.data;
  const db = await openDB();

  if (data.type === "SYNC_DATA") {
    await setData(db, "tasks", data.tasks);
    await setData(db, "settings", data.settings);
    await setData(db, "lastSync", new Date().getTime());
    console.log("[SW] 🔄 Sincronizado");
    startBackgroundCheck();
  }

  if (data.type === "FORCE_TEST") {
    console.log("[SW] 🧪 Teste Forçado Recebido.");
    await setData(db, "lastDailyNotif", "reset");
    const tasks = (await getData(db, "tasks")) || [];
    await fireDailySummary(db, tasks, getLocalDateString(new Date()));
  }

  if (data.type === "GET_SW_STATUS") {
    const tasks = await getData(db, "tasks");
    const lastSync = await getData(db, "lastSync");

    event.source.postMessage({
      type: "SW_STATUS_RESPONSE",
      status: "active",
      version: VERSION,
      lastSync: lastSync,
      taskCount: tasks ? tasks.length : 0,
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
