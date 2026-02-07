/**
 * Sistema de Notificações PWA - Sincronização com Background Engine
 */
import { state } from "./state.js";

export const Notifications = {
  _interval: null,

  async init() {
    console.log("🔔 [Notifications] Inicializando...");
    if (!("Notification" in window)) return;

    await Notification.requestPermission();

    // Sincroniza dados iniciais com o Service Worker
    this.syncWithSW();

    // Mantém um verificador leve no frontend também (enquanto o app estiver aberto)
    this.setupFrontendCheck();
  },

  setupFrontendCheck() {
    if (this._interval) clearInterval(this._interval);
    this._interval = setInterval(() => this.syncWithSW(), 300000); // Sincroniza a cada 5 min
  },

  async syncWithSW() {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      const settings = {
        dailyEnabled:
          localStorage.getItem("daily-reminders-enabled") !== "false",
        notifTime: localStorage.getItem("notif-time") || "09:00",
      };

      // Envia tarefas e configurações para o SW
      registration.active.postMessage({
        type: "SYNC_DATA",
        tasks: state.tasks,
        settings: settings,
      });
      console.log(
        "🔄 [Notifications] Dados sincronizados com Background Engine",
      );
    }
  },

  async test() {
    if (Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    // Teste via SW para garantir que o canal está aberto
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification("Organizer Ativo ✅", {
        body: "A comunicação com o motor de segundo plano está funcionando!",
        requireInteraction: true,
      });
    }
  },

  // Os métodos abaixo agora servem como atalhos para disparos imediatos se necessário
  async sendDailySummary() {
    // O SW agora cuida disso sozinho, mas mantemos para compatibilidade
    this.syncWithSW();
  },
};
