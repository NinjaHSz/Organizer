/**
 * Componente de Ajustes - Novo Design
 */

export const Settings = {
  render(root, state, handlers) {
    const accentColor = localStorage.getItem("accent-color") || "#4285F4";
    const theme = localStorage.getItem("theme") || "dark";
    const notifTime = localStorage.getItem("notif-time") || "09:00";
    const isDailyNotifEnabled =
      localStorage.getItem("daily-reminders-enabled") !== "false";

    root.innerHTML = `
            <div class="animate-fade-in w-[98%] max-w-7xl mx-auto px-2 pb-32 md:px-8 space-y-6 mt-4 md:grid md:grid-cols-2 md:gap-8 md:space-y-0 md:items-start">
                    <!-- Aparência -->
                    <section>
                        <h2 class="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3 ml-1">Aparência</h2>
                        <div class="bg-[var(--surface-card)] rounded-[var(--radius-xl)] overflow-hidden">
                            <div class="flex items-center justify-between p-4 px-5">
                                <div class="flex items-center gap-4">
                                    <span class="material-symbols-outlined text-[var(--text-secondary)]">dark_mode</span>
                                    <div>
                                        <p class="text-[var(--text-primary)] text-sm font-medium">Modo Escuro</p>
                                        <p class="text-[var(--text-secondary)] text-[11px]">Sempre usar tema escuro</p>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" ${theme === "dark" ? "checked" : ""} id="theme-toggle-check">
                                    <div class="ios-toggle-bg border-none">
                                        <div class="ios-toggle-dot"></div>
                                    </div>
                                </label>
                            </div>
                            <div class="h-[1px] bg-[var(--separator)] mx-5"></div>
                            <div class="flex items-center justify-between p-4 px-5">
                                <div class="flex items-center gap-4">
                                    <span class="material-symbols-outlined text-[var(--text-secondary)]">palette</span>
                                    <p class="text-[var(--text-primary)] text-sm font-medium">Temas automáticos</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer">
                                    <div class="ios-toggle-bg border-none" style="background-color: rgba(255, 255, 255, 0.1);">
                                        <div class="ios-toggle-dot"></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>

                    <!-- Personalização -->
                    <section>
                        <h2 class="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3 ml-1">Personalização</h2>
                        <div class="bg-[var(--surface-card)] rounded-[var(--radius-xl)] overflow-hidden">
                            <div class="p-5">
                                <div class="flex items-center gap-4 mb-4">
                                    <span class="material-symbols-outlined text-[var(--text-secondary)]">format_paint</span>
                                    <div>
                                        <p class="text-[var(--text-primary)] text-sm font-medium">Cor de Destaque</p>
                                        <p class="text-[var(--text-secondary)] text-[11px]">Define a cor principal do app</p>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center pt-2">
                                    ${[
                                      "#4285F4",
                                      "#EA4335",
                                      "#FBBC05",
                                      "#34A853",
                                      "#A142F4",
                                      "#F43F5E",
                                    ]
                                      .map(
                                        (color) => `
                                        <button class="size-8 rounded-full border-2 ${accentColor === color ? "border-white ring-2" : "border-transparent"}" style="background-color: ${color}; ${accentColor === color ? `box-shadow: 0 0 0 2px ${color}33;` : ""}">
                                            <input type="radio" class="hidden" name="accent-color" value="${color}" ${accentColor === color ? "checked" : ""}>
                                        </button>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            </div>
                        </div>
                    </section>

 
                    <!-- Notificações -->
                    <section>
                        <h2 class="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3 ml-1">Notificações</h2>
                        <div class="bg-[var(--surface-card)] rounded-[var(--radius-xl)] overflow-hidden">
                            <div class="flex items-center justify-between p-4 px-5">
                                <div class="flex items-center gap-4">
                                    <span class="material-symbols-outlined text-[var(--text-secondary)]">notifications_active</span>
                                    <div>
                                        <p class="text-[var(--text-primary)] text-sm font-medium">Lembretes Diários</p>
                                        <p class="text-[var(--text-secondary)] text-[11px]">Resumo matinal de tarefas</p>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" ${isDailyNotifEnabled ? "checked" : ""} id="daily-notif-toggle">
                                    <div class="ios-toggle-bg border-none">
                                        <div class="ios-toggle-dot"></div>
                                    </div>
                                </label>
                            </div>
                            <div class="h-[1px] bg-[var(--separator)] mx-5"></div>
                            <div class="flex items-center justify-between p-4 px-5">
                                <div class="flex items-center gap-4">
                                    <span class="material-symbols-outlined text-[var(--text-secondary)]">schedule</span>
                                    <p class="text-[var(--text-primary)] text-sm font-medium">Horário do Lembrete</p>
                                </div>
                                <div class="bg-white/5 px-3 py-1.5 rounded-lg">
                                    <input id="notif-time-input" class="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-16 text-center text-[var(--action-primary)]" type="time" value="${notifTime}"/>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Rodapé -->
                    <section class="pt-4 flex flex-col items-center gap-2">
                        <p class="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">Organizer PWA v2.4.0</p>
                    </section>
                </main>
            </div>
        `;

    this.bindEvents(root, handlers);
  },

  bindEvents(root, handlers) {
    const themeToggle = document.getElementById("theme-toggle-check");
    if (themeToggle) {
      themeToggle.onchange = (e) =>
        handlers.onToggleTheme(e.target.checked ? "dark" : "light");
    }
    root.querySelectorAll('input[name="accent-color"]').forEach((radio) => {
      radio.parentElement.onclick = (e) => {
        radio.checked = true;
        handlers.onChangeAccentColor(radio.value);
      };
    });

    const notifTime = document.getElementById("notif-time-input");
    if (notifTime) {
      notifTime.onchange = (e) => handlers.onChangeNotifTime(e.target.value);
    }

    const dailyNotifToggle = document.getElementById("daily-notif-toggle");
    if (dailyNotifToggle) {
      dailyNotifToggle.onchange = (e) =>
        handlers.onToggleDailyReminders(e.target.checked);
    }
  },
};
