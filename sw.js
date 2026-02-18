const VERSION = "1.2.7";
const DB_NAME = "organizer-sw-db";
const STORE_NAME = "config";

const CACHE_NAME = `organizer-cache-v${VERSION}`;
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/div.ico",
  "/src/main.js",
  "/src/styles/main.css",
  "/src/api/database.js",
  "/src/api/ai-service.js",
  "/src/components/mobile-nav.js",
  "/src/components/ui.js",
  "/src/core/app-engine.js",
  "/src/core/nav-state.js",
  "/src/core/notifications.js",
  "/src/core/state.js",
  "/src/core/utils.js",
  "/src/pages/calendar.js",
  "/src/pages/dashboard.js",
  "/src/pages/schedule.js",
  "/src/pages/settings.js",
  "/src/pages/subjects-config.js",
  "/src/pages/subjects.js",
  "https://cdn.tailwindcss.com?plugins=forms,container-queries",
  "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
  "https://unpkg.com/@supabase/supabase-js@2",
];

let lastFiredDateKey = null;

// 1. Inicialização Global do Timer (Curto prazo enquanto ativo)
let checkInterval = null;

const startBackgroundCheck = () => {
  if (checkInterval) clearInterval(checkInterval);
  console.log(`[SW V${VERSION}] Verificação de fundo ativa.`);
  checkInterval = setInterval(async () => {
    // Versão 1.2.4 - Lógica local desativada em favor do Servidor (Web Push)
  }, 60000);
};

startBackgroundCheck();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Pre-caching assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Cleaning old cache:", key);
            return caches.delete(key);
          }
        }),
      );
    }),
  );
  event.waitUntil(clients.claim());
  startBackgroundCheck();
});

// Estratégia: Cache First para Ativos Estáticos, Network para API
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Se for API do Supabase, vai direto pra rede (offline handled in database.js)
  if (url.href.includes("supabase.co")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Se temos no cache, retorna imediatamente e tenta atualizar em background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Se não tem no cache, busca na rede
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, cacheCopy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback para navegação
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          // Fallback para imagens/icones se necessário (opcional)
          return new Response("Offline content not available", { status: 503 });
        });
    }),
  );
});

// Acordado pelo Sistema Operacional
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-check") {
    // A lógica de verificação diária foi removida na V1.2.4
    // Agora as notificações são gerenciadas 100% pelo servidor (Web Push)
    // para garantir funcionamento com app fechado e evitar duplicidade.
    console.log(
      "[SW] PeriodicSync 'daily-check' acionado, mas a lógica local foi desativada.",
    );
  }
});

// O disparo de notificações locais foi removido na V1.2.4
// Agora as notificações são gerenciadas 100% pelo servidor (Web Push)
// para garantir funcionamento com app fechado e evitar duplicidade.

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
    console.log("[SW] Dados Sincronizados");
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

// Listener de Push do Servidor (Supabase Edge Function)
self.addEventListener("push", (event) => {
  console.log("[SW] Mensagem de Push recebida!");

  if (event.data) {
    try {
      const payload = event.data.json();
      const promise = showNotification(payload.title || "Organizer", {
        body: payload.body || "Você tem novidades no seu organizador.",
        tag: payload.tag || "push-notification",
        data: { url: payload.url || "/" },
      });
      event.waitUntil(promise);
    } catch (e) {
      console.error("[SW] Erro ao processar payload de push:", e);
    }
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
