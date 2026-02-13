/**
 * Componente de Ajustes - Novo Design com Diagnóstico de Notificações
 */
import { Notifications } from "../core/notifications.js";
import { UI } from "../components/ui.js";

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
                            <div class="h-[1px] bg-[var(--separator)] mx-5"></div>
                            <div class="p-4 px-5 space-y-3">
                                <button id="test-notif-btn" class="w-full py-2.5 rounded-xl bg-[var(--action-primary)]/10 text-[var(--action-primary)] text-xs font-bold hover:bg-[var(--action-primary)]/20 transition-all border-none">
                                    Testar Notificação Agora
                                </button>
                                
                                <div id="sw-diagnostic-panel" class="mt-4 pt-4 border-t border-white/5 space-y-2">
                                    <p class="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Diagnóstico PWA</p>
                                    <div class="flex justify-between text-[11px]">
                                        <span class="text-[var(--text-secondary)]">Motor de Segundo Plano:</span>
                                        <span id="sw-status-val" class="text-orange-400 font-bold">Verificando...</span>
                                    </div>
                                    <div class="flex justify-between text-[11px]">
                                        <span class="text-[var(--text-secondary)]">Modo de Entrega:</span>
                                        <span class="text-blue-400 font-bold uppercase">Web Push (Servidor)</span>
                                    </div>
                                    <div class="flex justify-between text-[11px]">
                                        <span class="text-[var(--text-secondary)]">Tarefas Sincronizadas:</span>
                                        <span id="sw-tasks-val" class="text-[var(--text-primary)]">--</span>
                                    </div>
                                    <div class="flex justify-between text-[11px]">
                                        <span class="text-[var(--text-secondary)]">Última Sincronia:</span>
                                        <span id="sw-sync-val" class="text-[var(--text-primary)]">--</span>
                                    </div>
                                    <button id="force-update-sw-btn" class="w-full mt-2 py-1.5 rounded-lg bg-white/5 text-[var(--text-secondary)] text-[10px] font-bold hover:bg-white/10 transition-all border-none">
                                        Reiniciar e Atualizar Sistema
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>


                    <!-- Inteligência Artificial -->
                    <section>
                        <h2 class="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-3 ml-1">Inteligência Artificial</h2>
                        <div class="bg-[var(--surface-card)] rounded-[var(--radius-xl)] overflow-hidden">
                            <div class="p-5 space-y-4">
                                <div class="flex items-center gap-4">
                                    <span class="material-symbols-outlined text-blue-400">rocket_launch</span>
                                    <div>
                                        <p class="text-[var(--text-primary)] text-sm font-medium">OpenRouter API Key</p>
                                        <p class="text-[var(--text-secondary)] text-[11px]">Acesso a múltiplos modelos de IA</p>
                                    </div>
                                </div>
                                <div class="relative">
                                    <input type="password" id="openrouter-key-input" 
                                           class="w-full bg-white/5 border-none rounded-xl px-4 py-3 text-xs font-mono text-white/80 focus:ring-1 focus:ring-blue-500 transition-all"
                                           placeholder="sk-or-v1-..."
                                           value="${localStorage.getItem("openrouter_api_key") || "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"}">
                                    <button class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all">
                                        <span class="material-symbols-outlined text-sm">visibility</span>
                                    </button>
                                </div>
                                <div class="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                   <p class="text-[10px] text-blue-300 leading-relaxed font-medium">
                                       <span class="font-black uppercase">Dica:</span> Use o modelo <code class="bg-blue-900/40 px-1 rounded">gemini-2.0-flash</code> para melhor custo-benefício.
                                   </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Rodapé -->
                    <section class="pt-4 flex flex-col items-center gap-2">
                        <p class="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em]">Organizer PWA v2.6.0</p>
                    </section>
                </main>
            </div>
        `;

    this.bindEvents(root, handlers);
    this.startDiagnostics();
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

    const testNotifBtn = document.getElementById("test-notif-btn");
    if (testNotifBtn) {
      testNotifBtn.onclick = () => handlers.onTestNotifications();
    }

    const updateBtn = document.getElementById("force-update-sw-btn");
    if (updateBtn) {
      updateBtn.onclick = () => Notifications.updateSW();
    }

    const openrouterInput = document.getElementById("openrouter-key-input");
    if (openrouterInput) {
      openrouterInput.onchange = (e) => {
        localStorage.setItem("openrouter_api_key", e.target.value.trim());
        UI.notify("Chave do OpenRouter atualizada!", "success");
      };

      // Lógica de visibilidade
      const toggleBtn = openrouterInput.nextElementSibling;
      if (toggleBtn) {
        toggleBtn.onclick = () => {
          const type =
            openrouterInput.getAttribute("type") === "password"
              ? "text"
              : "password";
          openrouterInput.setAttribute("type", type);
          toggleBtn.querySelector("span").textContent =
            type === "password" ? "visibility" : "visibility_off";
        };
      }
    }
  },

  startDiagnostics() {
    const statusEl = document.getElementById("sw-status-val");
    const tasksEl = document.getElementById("sw-tasks-val");
    const syncEl = document.getElementById("sw-sync-val");

    if (!statusEl) return;

    Notifications.getSWStatus((data) => {
      statusEl.textContent = `Ativo (V${data.version})`;
      statusEl.classList.remove("text-orange-400");
      statusEl.classList.add("text-green-400");

      tasksEl.textContent = `${data.taskCount} tarefas`;

      if (data.lastSync) {
        const date = new Date(data.lastSync);
        syncEl.textContent = date.toLocaleTimeString();
      } else {
        syncEl.textContent = "Nunca";
      }
    });

    // Se em 3 segundos não responder, indica inativo
    setTimeout(() => {
      if (statusEl.textContent === "Verificando...") {
        statusEl.textContent = "Inativo / Aguardando Sync";
        statusEl.classList.add("text-red-400");
      }
    }, 3000);
  },
};
