// Organizer Service Worker - Background Engine V5
const VERSION = "1.1.1";
const DB_NAME = "organizer-sw-db";
const STORE_NAME = "config";

let lastFiredDateKey = null;

// 1. Inicialização Global do Timer (Curto prazo enquanto ativo)
let checkInterval = null;

const startBackgroundCheck = () => {
  if (checkInterval) clearInterval(checkInterval);
  console.log(`[SW V${VERSION}] ⏰ Verificação de fundo ativa.`);
  checkInterval = setInterval(async () => {
    try {
      await checkNotifications();
    } catch (e) {
      console.error("[SW] Erro no check:", e);
    }
  }, 30000);
};

startBackgroundCheck();

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
  startBackgroundCheck();
});

// Acordado pelo Sistema Operacional
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

  const timeSetting = settings.notifTime || "09:00";
  const [targetH, targetM] = timeSetting.split(":").map(Number);

  // LÓGICA DE JANELA: Se já passou do horário alvo HOJE
  const targetTotalMinutes = targetH * 60 + targetM;
  const currentTotalMinutes = currentH * 60 + currentM;

  console.log(
    `[SW] Audit: ${currentH}:${currentM} (Alvo: ${targetH}:${targetM})`,
  );

  if (currentTotalMinutes >= targetTotalMinutes) {
    const lastDate = await getData(db, "lastDailyNotif");

    // Se ainda não disparou hoje, DISPARA!
    if (lastDate !== todayStr) {
      console.log("[SW] 🚀 Horário atingido/passado. Disparando resumo.");

      const pendingTasks = tasks.filter(
        (t) => t.status !== "done" && (!t.due_date || t.due_date >= todayStr),
      );

      await showNotification("Resumo do Dia 🎯", {
        body:
          pendingTasks.length > 0
            ? `Você tem ${pendingTasks.length} tarefas pendentes. Vamos organizar o dia?`
            : "Nenhuma tarefa para hoje. Aproveite!",
        tag: "daily-summary",
        data: { url: "/" },
      });

      await setData(db, "lastDailyNotif", todayStr);
    }
  }
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
    console.log("[SW] 🔄 Dados Sincronizados");
    startBackgroundCheck();
  }

  if (data.type === "FORCE_TEST") {
    await setData(db, "lastDailyNotif", "reset");
    const tasks = (await getData(db, "tasks")) || [];
    await checkNotifications();
  }

  if (data.type === "GET_SW_STATUS") {
    const tasks = (await getData(db, "tasks")) || [];
    const lastSync = await getData(db, "lastSync");

    event.source.postMessage({
      type: "SW_STATUS_RESPONSE",
      status: "active",
      version: VERSION,
      lastSync: lastSync,
      taskCount: tasks.length,
    });
  }
});

// Listener de Push (Placeholder para evitar suspensão agressiva do navegador)
self.addEventListener("push", (event) => {
  console.log("[SW] Push Event");
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
