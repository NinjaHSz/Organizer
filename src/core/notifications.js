/**
 * Sistema de Notificações PWA - Ponte de Sincronização e Diagnóstico
 */
import { state } from "./state.js";
import { UI } from "../components/ui.js";
import { db } from "../api/database.js";

const VAPID_PUBLIC_KEY =
  "BCzt6hcNxLDdrJAsahoERLY4N99GL74Bs5qlNk8CgMAZVRABe7V08v2IjpM8peRzseEPFHeDG5ETe7yBzVo2ec8";

export const Notifications = {
  _interval: null,

  async init() {
    console.log("[Notifications] Inicializando...");
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      this.subscribeToPush();
    }

    // Listener para respostas do SW (Mantido para diagnóstico local)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SW_STATUS_RESPONSE") {
          console.log("[Notifications] SW Status:", event.data);
          this.onStatusReceived?.(event.data);
        }
      });
    }

    this.syncWithSW();
    this.setupFrontendCheck();
    this.registerPeriodicSync();
  },

  async subscribeToPush() {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;

      // Verifica se já existe uma inscrição
      let subscription = await registration.pushManager.getSubscription();

      const settings = {
        dailyEnabled:
          localStorage.getItem("daily-reminders-enabled") !== "false",
        notifTime: localStorage.getItem("notif-time") || "09:00",
      };

      if (!subscription) {
        // Cria uma nova inscrição
        const convertedVapidKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });

        console.log("[Notifications] Nova inscrição de Push criada.");
        await db.savePushSubscription(subscription, settings);
      } else {
        console.log("[Notifications] Usuário já inscrito no Push.");
      }
    } catch (e) {
      console.warn("[Notifications] Falha ao inscrever no Push:", e);
    }
  },

  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  async registerPeriodicSync() {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      if ("periodicSync" in registration) {
        // Solicita ao navegador para acordar a cada 24 horas (ou o mínimo permitido)
        // Isso garante que mesmo fechado, uma vez por dia ele verifique o banco local.
        await registration.periodicSync.register("daily-check", {
          minInterval: 12 * 60 * 60 * 1000, // 12 horas (mínimo conservador)
        });
        console.log("🔋 [Notifications] Periodic Sync registrado!");
      }
    } catch (e) {
      console.warn(
        "⚠️ [Notifications] Periodic Sync não suportado ou bloqueado:",
        e,
      );
    }
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

        // Sincroniza com o servidor para agendamento offline
        db.updatePushSettings(settings).catch((e) =>
          console.warn(
            "[Notifications] Falha ao sincronizar ajustes no servidor:",
            e,
          ),
        );

        console.log("[Notifications] Sincronizado");
      }
    } catch (e) {
      console.warn("[Notifications] Falha na sincronia:", e);
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
      if (registration.active) {
        // 1. Testa a rota local (App Aberto)
        registration.active.postMessage({ type: "FORCE_TEST" });

        // 2. Testa a rota de Produção (App Fechado)
        // Chamando a Edge Function do Supabase que acabamos de criar
        UI.notify("Solicitando sinal ao servidor (Web Push)...", "info");
        try {
          await fetch(
            "https://sywueeqbijwdjjleyzbo.supabase.co/functions/v1/send-daily-reminders",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("supabase_key")}`,
              },
            },
          );
        } catch (e) {
          console.warn("Falha ao chamar servidor:", e);
        }
      }
    }
  },
};
