/**
 * Sistema de Notificações PWA - Ponte de Sincronização e Diagnóstico
 */
import { state } from "./state.js";
import { UI } from "../components/ui.js";

export const Notifications = {
  _interval: null,

  async init() {
    console.log("🔔 [Notifications] Inicializando...");
    if (!("Notification" in window)) return;

    await Notification.requestPermission();

    // Listener para respostas do SW
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SW_STATUS_RESPONSE") {
          console.log("📊 [Notifications] SW Status:", event.data);
          this.onStatusReceived?.(event.data);
        }
      });
    }

    this.syncWithSW();
    this.setupFrontendCheck();
  },

  setupFrontendCheck() {
    if (this._interval) clearInterval(this._interval);
    this._interval = setInterval(() => this.syncWithSW(), 60000); // Sincroniza a cada 1 min para manter vivo
  },

  async syncWithSW() {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        const settings = {
          dailyEnabled:
            localStorage.getItem("daily-reminders-enabled") !== "false",
          notifTime: localStorage.getItem("notif-time") || "09:00",
        };

        registration.active.postMessage({
          type: "SYNC_DATA",
          tasks: state.tasks,
          settings: settings,
        });
        console.log("🔄 [Notifications] Sincronizado");
      }
    } catch (e) {
      console.warn("⚠️ [Notifications] Falha na sincronia:", e);
    }
  },

  async updateSW() {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    window.location.reload();
  },

  async getSWStatus(callback) {
    if (!("serviceWorker" in navigator)) return;
    this.onStatusReceived = callback;
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage({ type: "GET_SW_STATUS" });
    }
  },

  async test() {
    if (Notification.permission !== "granted") {
      const res = await Notification.requestPermission();
      if (res !== "granted") {
        UI.notify("Permissão negada pelo navegador", "error");
        return;
      }
    }

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification("Organizer Ativo ✅", {
        body: "A rota de notificações está aberta e pronta.",
        requireInteraction: true,
      });
    }
  },
};
