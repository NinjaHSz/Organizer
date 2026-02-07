/**
 * Sistema de Notificações PWA e Lembretes em Segundo Plano
 */
import { state } from "./state.js";

export const Notifications = {
  async init() {
    if (!("Notification" in window)) return;

    // Solicita permissão se ainda não foi pedida
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

    const checkAll = () => {
      const isEnabled =
        localStorage.getItem("daily-reminders-enabled") !== "false";
      if (!isEnabled) return;

      const now = new Date();
      const currentStr = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dayIndex = now.getDay() - 1; // 0 = Segunda, 4 = Sexta

      // 1. Resumo Diário
      const notifTime = localStorage.getItem("notif-time") || "09:00";
      if (currentStr === notifTime) {
        const lastNotif = localStorage.getItem("last-daily-notif-date");
        const todayStr = now.toISOString().split("T")[0];
        if (lastNotif !== todayStr) {
          this.sendDailySummary();
          localStorage.setItem("last-daily-notif-date", todayStr);
        }
      }

      // 2. Alertas de Aula (5 minutos antes)
      if (dayIndex >= 0 && dayIndex <= 4) {
        timetable.forEach((row) => {
          const subject = row.dias[dayIndex];
          if (!subject || subject === "INTERVALO") return;

          const [h, m] = row.horario[0].split(":").map(Number);
          const start = new Date();
          start.setHours(h, m, 0);

          const diff = (start.getTime() - now.getTime()) / 60000;

          if (diff > 0 && diff <= 5) {
            const key = `alert-${todayStr}-${row.horario[0]}`;
            if (!localStorage.getItem(key)) {
              this.sendClassAlert(subject, row.horario[0]);
              localStorage.setItem(key, "sent");
            }
          }
        });
      }
    };

    setInterval(checkAll, 60000);
    checkAll();
  },

  async sendDailySummary() {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Calcula o fim da "semana" (próximos 7 dias)
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    // Filtra tarefas pendentes para a semana (ou sem data)
    const weekTasks = state.tasks.filter(
      (t) =>
        t.status !== "done" &&
        ((t.due_date >= todayStr && t.due_date <= nextWeekStr) || !t.due_date),
    );

    const title = "Bom dia! ☀️";
    const body =
      weekTasks.length > 0
        ? `Você tem ${weekTasks.length} tarefa${weekTasks.length > 1 ? "s" : ""} pendente${weekTasks.length > 1 ? "s" : ""} nesta semana. Confira seus prazos!`
        : "Sua semana está livre de tarefas pendentes! Aproveite o descanso.";

    this.showNativeNotification(title, { body, tag: "daily-summary" });
  },

  async sendClassAlert(subject, time) {
    this.showNativeNotification("Próxima Aula 🏫", {
      body: `A aula de ${subject} começa em breve às ${time}. Prepare seu material!`,
      tag: `class-${time}`,
    });
  },

  async showNativeNotification(title, options = {}) {
    if (Notification.permission !== "granted") return;

    const defaultOptions = {
      icon: "/assets/div.ico",
      badge: "/assets/div.ico",
      vibrate: [200, 100, 200],
      ...options,
    };

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        registration.showNotification(title, defaultOptions);
        return;
      }
    }
    new Notification(title, defaultOptions);
  },
};
