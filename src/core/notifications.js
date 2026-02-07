/**
 * Sistema de Notificações PWA e Lembretes em Segundo Plano
 */
import { state } from "./state.js";

export const Notifications = {
  async init() {
    console.log("Inicializando sistema de notificações...");
    if (!("Notification" in window)) {
      console.error("Notificações não suportadas neste navegador.");
      return;
    }

    if (Notification.permission === "default") {
      console.log("Solicitando permissão de notificação...");
      await Notification.requestPermission();
    }

    console.log("Status da permissão:", Notification.permission);
    this.setupDailyReminder();
  },

  async requestPermission() {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    console.log("Permissão de notificação atualizada para:", permission);
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
      if (!isEnabled) {
        console.log("Lembretes desativados pelo usuário.");
        return;
      }

      const now = new Date();
      const currentStr = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dayIndex = now.getDay() - 1;

      console.log(
        `Verificando notificações... Hora atual: ${currentStr} | Dia index: ${dayIndex}`,
      );

      // 1. Resumo Semanal
      const notifTime = localStorage.getItem("notif-time") || "09:00";
      if (currentStr === notifTime) {
        const lastNotif = localStorage.getItem("last-daily-notif-date");
        const todayStr = now.toISOString().split("T")[0];
        if (lastNotif !== todayStr) {
          console.log("Disparando resumo semanal matinal...");
          this.sendDailySummary();
          localStorage.setItem("last-daily-notif-date", todayStr);
        }
      }

      // 2. Alertas de Aula (Apenas Seg-Sex)
      if (dayIndex >= 0 && dayIndex <= 4) {
        const todayStr = now.toISOString().split("T")[0];
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
              console.log(
                `Alerta de aula detectado: ${subject} às ${row.horario[0]}`,
              );
              this.sendClassAlert(subject, row.horario[0]);
              localStorage.setItem(key, "sent");
            }
          }
        });
      }
    };

    this.pingServiceWorker();
    setInterval(checkAll, 60000);
    checkAll();
  },

  async test() {
    console.log("🧪 Iniciando notificação de teste...");
    if (Notification.permission !== "granted") {
      const granted = await this.requestPermission();
      if (!granted) {
        alert(
          "Por favor, habilite as notificações no seu navegador para testar.",
        );
        return;
      }
    }
    this.showNativeNotification("Teste de Notificação ✅", {
      body: "Se você está vendo esta mensagem, as notificações estão funcionando corretamente!",
      tag: "test-notification",
    });
  },

  async pingServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log("Service Worker pronto para notificações (Ready)");
      } catch (e) {
        console.warn("Service Worker não responde:", e);
      }
    }
  },

  async sendDailySummary() {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    const weekTasks = state.tasks.filter(
      (t) =>
        t.status !== "done" &&
        ((t.due_date >= todayStr && t.due_date <= nextWeekStr) || !t.due_date),
    );

    const title = "Resumo da Semana";
    const body =
      weekTasks.length > 0
        ? `Você tem ${weekTasks.length} tarefa${weekTasks.length > 1 ? "s" : ""} pendente${weekTasks.length > 1 ? "s" : ""} nesta semana. Fique atento aos prazos!`
        : "Sua semana está livre de tarefas pendentes! Aproveite.";

    this.showNativeNotification(title, { body, tag: "daily-summary" });
  },

  async sendClassAlert(subject, time) {
    this.showNativeNotification("Próxima Aula", {
      body: `Aula de ${subject} às ${time}. Prepare-se!`,
      tag: `class-${time}`,
    });
  },

  async showNativeNotification(title, options = {}) {
    if (Notification.permission !== "granted") {
      console.warn("Notificação bloqueada: Sem permissão.");
      return;
    }

    const defaultOptions = {
      icon: "/assets/div.ico",
      badge: "/assets/div.ico",
      vibrate: [200, 100, 200],
      requireInteraction: true,
      ...options,
    };

    console.log(`Tentando exibir notificação: "${title}"`);

    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration) {
          console.log("Enviando via Service Worker...");
          registration.showNotification(title, defaultOptions);
          return;
        }
      } catch (e) {
        console.error("Erro no Service Worker:", e);
      }
    }

    console.log("Usando fallback de notificação nativa...");
    new Notification(title, defaultOptions);
  },
};
