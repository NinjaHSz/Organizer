// Service Worker & PWA Auto-Update Manager

let registration: ServiceWorkerRegistration | null = null;
let isRefreshing = false;

export const initPwaManager = (onUpdateAvailable?: () => void) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // 1. Setup Chunk Load Error Recovery (Vite dynamic import hash changes)
  setupChunkErrorRecovery();

  // 2. Register Service Worker with cache disabled for the SW script itself
  navigator.serviceWorker
    .register('/sw.js', { updateViaCache: 'none' })
    .then((reg) => {
      registration = reg;
      console.log('✅ [PWA] Service Worker registrado com sucesso no escopo:', reg.scope);

      // Check for updates immediately upon launch
      reg.update().catch((err) => console.warn('⚠️ [PWA] Falha na verificação de atualização inicial:', err));

      // Periodic update check every 2 minutes while the app is active
      setInterval(() => {
        if (navigator.onLine) {
          reg.update().catch(() => {});
        }
      }, 2 * 60 * 1000);

      // Check for updates when user returns to the tab or app
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          reg.update().catch(() => {});
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const handleFocus = () => {
        if (navigator.onLine) {
          reg.update().catch(() => {});
        }
      };
      window.addEventListener('focus', handleFocus);

      // Check if there is already a waiting worker
      if (reg.waiting) {
        handleNewWorker(reg.waiting, onUpdateAvailable);
      }

      // Listen for new worker installation
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('⚡ [PWA] Nova versão detectada e instalada!');
            handleNewWorker(newWorker, onUpdateAvailable);
          }
        });
      });
    })
    .catch((err) => {
      console.warn('⚠️ [PWA] Falha ao registrar Service Worker:', err);
    });

  // 3. Listen for controller change -> Seamlessly reload so latest code runs
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (isRefreshing) return;
    isRefreshing = true;
    console.log('🔄 [PWA] Novo Service Worker assumiu o controle. Recarregando aplicação...');
    window.location.reload();
  });
};

/**
 * Tell new worker to skip waiting and activate immediately
 */
const handleNewWorker = (worker: ServiceWorker, onUpdateAvailable?: () => void) => {
  if (onUpdateAvailable) {
    onUpdateAvailable();
  }
  // Immediately post SKIP_WAITING to the worker so it takes over
  worker.postMessage({ type: 'SKIP_WAITING' });
};

/**
 * Handle Vite chunk loading failures caused by newly deployed hashes
 */
const setupChunkErrorRecovery = () => {
  const handleChunkError = (message?: string) => {
    if (!message) return;
    const isChunkFailure =
      message.includes('Loading chunk') ||
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('error loading dynamically imported module');

    if (isChunkFailure) {
      const KEY = 'organizer_last_chunk_reload';
      const last = sessionStorage.getItem(KEY);
      const now = Date.now();
      if (!last || now - parseInt(last, 10) > 8000) {
        sessionStorage.setItem(KEY, now.toString());
        console.warn('⚠️ [PWA] Falha ao carregar chunk de versão antiga. Atualizando página...');
        window.location.reload();
      }
    }
  };

  window.addEventListener('error', (e) => {
    handleChunkError(e.message || (e.error && e.error.message));
  });

  window.addEventListener('unhandledrejection', (e) => {
    handleChunkError(e.reason && (e.reason.message || String(e.reason)));
  });
};

/**
 * Manually check for updates (e.g., from Settings page)
 */
export const checkForAppUpdates = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const reg = registration || (await navigator.serviceWorker.getRegistration());
    if (!reg) return false;

    await reg.update();

    if (reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }

    return false;
  } catch (err) {
    console.warn('Erro ao verificar atualizações:', err);
    return false;
  }
};

/**
 * Force clear all SW caches and reload the application
 */
export const forceUpdateAndClearCache = async () => {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        if (reg.active) {
          reg.active.postMessage({ type: 'CLEAR_CACHE' });
        }
        await reg.update();
      }
    }
  } catch (e) {
    console.warn('Erro ao limpar caches:', e);
  } finally {
    window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
  }
};
