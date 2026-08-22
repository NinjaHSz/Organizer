// Organizer Service Worker - High-Performance Auto-Updating PWA
const BUILD_ID = '__SW_BUILD_ID__';
const VERSION = BUILD_ID.startsWith('__') ? '2.0.0-dev' : BUILD_ID;
const CACHE_NAME = `organizer-cache-${VERSION}`;
const DB_NAME = 'organizer-sw-db';
const STORE_NAME = 'config';

// 1. Install Event: Skip waiting immediately to activate new version without user intervention
self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Instalando nova versão...`);
  self.skipWaiting();
});

// 2. Activate Event: Delete old caches & take control of open clients immediately
self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Ativando nova versão e limpando caches antigos...`);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Removendo cache antigo:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Smart Routing Strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip Supabase API and external dynamic endpoints
  if (url.hostname.includes('supabase.co')) return;

  // A. Navigation / Document Requests (HTML) -> NETWORK FIRST
  // This guarantees user always gets latest commit/HTML on refresh or page load
  const isNavigation =
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html') || caches.match('/');
          });
        })
    );
    return;
  }

  // B. Vite Hashed Assets (/assets/index-[hash].js, .css) -> CACHE FIRST
  // Immutable chunks with content hashes can be served from cache safely
  const isHashedAsset = url.pathname.includes('/assets/') && /\.[a-f0-9]{8,}\.(js|css)$/i.test(url.pathname);

  if (isHashedAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // C. Other Static Assets (manifest, icons, fonts) -> STALE WHILE REVALIDATE
  const isStaticSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');

  if (isStaticSameOrigin || isGoogleFont) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cacheCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// 4. IndexedDB Helpers for Sync
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getData = (db, key) => {
  return new Promise((resolve) => {
    const trans = db.transaction(STORE_NAME, 'readonly');
    const req = trans.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
};

const setData = (db, key, val) => {
  return new Promise((resolve) => {
    const trans = db.transaction(STORE_NAME, 'readwrite');
    const req = trans.objectStore(STORE_NAME).put(val, key);
    req.onsuccess = () => resolve();
  });
};

// 5. Message Listener
self.addEventListener('message', async (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (data.type === 'CLEAR_CACHE') {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    console.log('[SW] Todos os caches foram limpos.');
    return;
  }

  const db = await openDB();

  if (data.type === 'SYNC_DATA') {
    await setData(db, 'tasks', data.tasks);
    await setData(db, 'settings', data.settings);
    await setData(db, 'lastSync', Date.now());
    console.log('[SW] Dados sincronizados no IndexedDB');
  }

  if (data.type === 'GET_SW_STATUS') {
    const tasks = (await getData(db, 'tasks')) || [];
    const lastSync = await getData(db, 'lastSync');

    event.source.postMessage({
      type: 'SW_STATUS_RESPONSE',
      status: 'active',
      version: VERSION,
      lastSync: lastSync,
      taskCount: tasks.length,
    });
  }
});

// 6. Push Notifications (Server Web Push)
const showNotification = (title, options) => {
  return self.registration.showNotification(title, {
    icon: '/assets/div.ico',
    badge: '/assets/div.ico',
    vibrate: [200, 100, 200],
    ...options,
  });
};

self.addEventListener('push', (event) => {
  console.log('[SW] Mensagem de Push recebida!');
  if (event.data) {
    try {
      const payload = event.data.json();
      const promise = showNotification(payload.title || 'Organizer', {
        body: payload.body || 'Você tem novidades no seu organizador.',
        tag: payload.tag || 'push-notification',
        data: { url: payload.url || '/' },
      });
      event.waitUntil(promise);
    } catch (e) {
      console.error('[SW] Erro ao processar payload de push:', e);
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        if (list.length > 0) return list[0].focus();
        return clients.openWindow('/');
      })
  );
});
