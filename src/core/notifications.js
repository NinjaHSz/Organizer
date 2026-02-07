/**
 * Sistema de Notificações PWA e Lembretes - Versão Robusta Local
 */
import { state } from "./state.js";

export const Notifications = {
  _interval: null,

  async init() {
    console.log("🔔 [Notifications] Inicializando...");
    if (!("Notification" in window)) return;

    // Status atual
    console.log("📌 [Notifications] Permissão atual:", Notification.permission);

    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }

    this.setupDailyReminder();
  },

  async requestPermission() {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  setupDailyReminder() {
    // Limpa intervalo anterior se existir para evitar duplicidade
    if (this._interval) clearInterval(this._interval);

    console.log("⏰ [Notifications] Configurando verificador de lembretes...");

    const checkAll = () => {
      const isEnabled =
        localStorage.getItem("daily-reminders-enabled") !== "false";
      if (!isEnabled) return;

      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      // Gera string de data LOCAL (YYYY-MM-DD)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayLocalStr = `${year}-${month}-${day}`;

      // 1. Resumo Semanal (Dispara no horário configurado)
      const notifTime = localStorage.getItem("notif-time") || "09:00";
      const [targetH, targetM] = notifTime.split(":").map(Number);

      if (currentH === targetH && currentM === targetM) {
        const lastNotif = localStorage.getItem("last-daily-notif-date");
        if (lastNotif !== todayLocalStr) {
          console.log("🚀 [Notifications] Hora do resumo semanal atingida!");
          this.sendDailySummary();
          localStorage.setItem("last-daily-notif-date", todayLocalStr);
        }
      }

      // 2. Alertas de Aula (Apenas Seg-Sex)
      const dayOfWeek = now.getDay(); // 0=Dom, 1=Seg...
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        this.checkClassAlerts(now, todayLocalStr, dayOfWeek - 1);
      }
    };

    // Verifica a cada 30 segundos para maior precisão
    this._interval = setInterval(checkAll, 30000);
    checkAll();
  },

  checkClassAlerts(now, todayStr, dayIndex) {
    const timetable = [
      {
        horario: ["07:10", "07:55"],
        dias: ["Inglês", "Filosofia", "Etc", "Redação", "Espanhol"],
      },
      {
        horario: ["07:55", "08:40"],
        dias: ["Biologia", "Ed. Física", "Inglês", "", "Matemática"],
      },
      {
        horario: ["08:40", "09:25"],
        dias: ["Química", "Física", "Gramática", "Física", "Geografia"],
      },
      {
        horario: ["09:25", "09:45"],
        dias: ["INTERVALO", "INTERVALO", "INTERVALO", "INTERVALO", "INTERVALO"],
      },
      {
        horario: ["09:45", "10:30"],
        dias: ["Química", "Física", "Gramática", "História", "Literatura"],
      },
      {
        horario: ["10:30", "11:15"],
        dias: [
          "Matemática",
          "Sociologia",
          "Geografia",
          "História",
          "Literatura",
        ],
      },
      {
        horario: ["11:15", "12:00"],
        dias: [
          "Matemática",
          "Matemática",
          "Biologia",
          "Matemática",
          "Biologia",
        ],
      },
      { horario: ["12:00", "12:45"], dias: ["", "Artes", "", "", ""] },
    ];

    timetable.forEach((row) => {
      const subject = row.dias[dayIndex];
      if (!subject || subject === "INTERVALO") return;

      const [h, m] = row.horario[0].split(":").map(Number);
      const startTime = new Date(now.getTime());
      startTime.setHours(h, m, 0, 0);

      const diffMinutes = (startTime.getTime() - now.getTime()) / 60000;

      // Alerta entre 1 e 6 minutos antes da aula
      if (diffMinutes > 0 && diffMinutes <= 6) {
        const key = `alert-${todayStr}-${row.horario[0]}`;
        if (!localStorage.getItem(key)) {
          this.sendClassAlert(subject, row.horario[0]);
          localStorage.setItem(key, "sent");
        }
      }
    });
  },

  async test() {
    console.log("🧪 [Notifications] Executando teste manual...");
    const granted = await this.requestPermission();
    if (!granted) {
      alert("As notificações estão bloqueadas no seu navegador.");
      return;
    }
    this.showNativeNotification("Notificações Ativas! ✅", {
      body: "Este é o alerta de comunicação do Organizer. Tudo pronto para seus lembretes!",
      tag: "test-notif",
    });
  },

  async sendDailySummary() {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    // Busca no estado global
    const pending = state.tasks.filter(
      (t) =>
        t.status !== "done" &&
        ((t.due_date >= today && t.due_date <= nextWeekStr) || !t.due_date),
    );

    const title = "Resumo da Semana ☀️";
    const body =
      pending.length > 0
        ? `Você tem ${pending.length} tarefa${pending.length > 1 ? "s" : ""} pendente${pending.length > 1 ? "s" : ""} programada${pending.length > 1 ? "s" : ""}. Vamos focar!`
        : "Nada pendente para esta semana. Bom trabalho!";

    this.showNativeNotification(title, { body, tag: "daily-summary" });
  },

  async sendClassAlert(subject, time) {
    this.showNativeNotification("Próxima Aula 🏫", {
      body: `A aula de ${subject} começa às ${time}. Prepare seu material!`,
      tag: `class-${time}`,
    });
  },

  async showNativeNotification(title, options = {}) {
    if (Notification.permission !== "granted") return;

    const config = {
      icon: "/assets/div.ico",
      badge: "/assets/div.ico",
      vibrate: [200, 100, 200],
      requireInteraction: true,
      ...options,
    };

    console.log(`📤 [Notifications] Enviando: ${title}`);

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration) {
          registration.showNotification(title, config);
          return;
        }
      }
    } catch (e) {
      console.error("❌ [Notifications] Erro via SW, tentando direta:", e);
    }

    new Notification(title, config);
  },
};
