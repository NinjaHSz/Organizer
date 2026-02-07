/**
 * Motor Global da Aplicação - Borderless + Mobile Optimized
 */
import { db } from "../api/database.js";
import { state, updateState } from "./state.js";
import { navStateManager } from "./nav-state.js";
import { UI } from "../components/ui.js";
import { Dashboard } from "../pages/dashboard.js";
import { CalendarModule } from "../pages/calendar.js";
import { Schedule } from "../pages/schedule.js";
import { SubjectsConfig } from "../pages/subjects-config.js";
import { Settings } from "../pages/settings.js";
import { MobileNav } from "../components/mobile-nav.js";
import { Notifications } from "./notifications.js";

export class AppEngine {
  constructor() {
    this.handlers = {
      onSearch: (val) => {
        updateState("filters", { ...state.filters, search: val });
        this.render();
      },
      onChangeViewMode: (mode) => {
        updateState("filters", { ...state.filters, viewMode: mode });
        localStorage.setItem("view-mode", mode);
        this.render();
      },
      onChangeFilter: (filterType, value) => {
        updateState("filters", { ...state.filters, [filterType]: value });
        this.render();
      },
      onToggleTask: async (id, done) => {
        const task = state.tasks.find((t) => t.id === id);
        if (task) {
          task.status = done ? "done" : "todo";
          await db.updateTask(id, { status: task.status });
          // UI.notify(done ? "Concluído! 🎉" : "Tarefa reaberta", "success");
          this.render();
        }
      },
      onEditTask: (id) =>
        this.showTaskForm(state.tasks.find((t) => t.id === id)),
      onDeleteTask: async (id) => {
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return;

        const { close } = UI.showModal(
          "Excluir Tarefa",
          `<p class="text-text-secondary">Tem certeza que deseja excluir a tarefa <strong>"${task.title}"</strong>? Esta ação não pode ser desfeita.</p>`,
          `
            <button id="confirm-delete" class="w-full bg-status-error text-white py-3 rounded-xl font-bold hover:bg-status-error/90 transition-all border-none">
              Excluir Tarefa
            </button>
            <button id="cancel-delete" class="w-full bg-surface-subtle text-text-secondary py-3 rounded-xl font-bold hover:bg-surface-subtle/80 transition-all border-none">
              Cancelar
            </button>
          `,
        );

        document.getElementById("confirm-delete").onclick = async () => {
          await db.deleteTask(id);
          updateState(
            "tasks",
            state.tasks.filter((t) => t.id !== id),
          );
          // UI.notify("Tarefa excluída com sucesso", "success");
          this.render();
          close();
        };

        document.getElementById("cancel-delete").onclick = close;
      },
      onSelectDate: (dateStr) => {
        updateState("selectedCalendarDate", dateStr);
        this.render();
      },
      onPrevMonth: () => {
        const d = new Date(state.calendarDate);
        d.setMonth(d.getMonth() - 1);
        updateState("calendarDate", d);
        this.render();
      },
      onNextMonth: () => {
        const d = new Date(state.calendarDate);
        d.setMonth(d.getMonth() + 1);
        updateState("calendarDate", d);
        this.render();
      },
      onToggleTheme: (theme) => {
        document.documentElement.className = theme;
        localStorage.setItem("theme", theme);
        this.render();
      },
      onChangeAccentColor: (color) => {
        localStorage.setItem("accent-color", color);
        this.applyAccentColor(color);
        this.render();
      },
      onChangeNotifTime: (time) => {
        localStorage.setItem("notif-time", time);
        Notifications.syncWithSW();
      },
      onToggleDailyReminders: (enabled) => {
        localStorage.setItem("daily-reminders-enabled", enabled);
        if (enabled && "Notification" in window) {
          Notification.requestPermission();
        }
        Notifications.syncWithSW();
        this.render();
      },
      onDeleteSubject: async (id) => {
        if (confirm("Tem certeza que deseja excluir esta matéria?")) {
          await db.deleteSubject(id);
          await this.loadData();
          this.render();
        }
      },
      onAddSubject: () => this.showSubjectForm(),
      onEditSubject: (id) =>
        this.showSubjectForm(state.subjects.find((s) => s.id === id)),
      onTestNotifications: () => Notifications.test(),
    };
  }

  async init() {
    this.initTheme();
    await this.loadData();
    window.addEventListener("hashchange", () => this.router());
    this.router();
    this.bindStaticEvents();
    this.setupGlobalSearch();
    this.setupRealtime();
    Notifications.init();

    // Listener para o botão de adicionar no mobile (via CustomEvent do MobileNav)
    document.addEventListener("open-new-task-modal", () => this.showTaskForm());
  }

  setupRealtime() {
    // Sincroniza tarefas
    db.subscribeToTasks(async (payload) => {
      console.log("Realtime Task update:", payload);
      await this.loadData();
      Notifications.syncWithSW();
      this.render();
    });

    // Sincroniza matérias
    db.subscribeToSubjects(async (payload) => {
      console.log("Realtime Subject update:", payload);
      await this.loadData();
      this.render();
    });
  }

  setupGlobalSearch() {
    const searchBtn = document.getElementById("header-search-btn");
    if (!searchBtn) return;

    searchBtn.onclick = () => {
      // Cria e injeta o modal de busca
      const searchOverlay = document.createElement("div");
      searchOverlay.className =
        "fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 animate-fade-in";
      searchOverlay.innerHTML = `
        <div class="w-[90%] max-w-lg bg-[var(--surface-card)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-scale-in">
            <div class="flex items-center gap-3 p-4 border-b border-[var(--separator)]">
                <span class="material-symbols-outlined text-[var(--text-secondary)]">search</span>
                <input type="text" id="global-search-input" placeholder="Buscar tarefas..." class="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] font-medium text-lg placeholder:text-[var(--text-muted)] h-10">
                <button id="close-search" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-none bg-transparent">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div id="search-results" class="overflow-y-auto hidden flex-col">
                <!-- Resultados aqui -->
            </div>
            <div id="search-empty" class="hidden p-8 text-center text-[var(--text-muted)]">
                <span class="material-symbols-outlined text-4xl mb-2 opacity-50">content_paste_search</span>
                <p class="text-sm">Digite para pesquisar...</p>
            </div>
        </div>
      `;

      document.body.appendChild(searchOverlay);

      const input = searchOverlay.querySelector("#global-search-input");
      const resultsContainer = searchOverlay.querySelector("#search-results");
      const emptyState = searchOverlay.querySelector("#search-empty");
      const closeBtn = searchOverlay.querySelector("#close-search");

      input.focus();
      emptyState.classList.remove("hidden");

      const closeSearch = () => {
        searchOverlay.classList.add("opacity-0");
        setTimeout(() => searchOverlay.remove(), 200);
      };

      closeBtn.onclick = closeSearch;
      searchOverlay.onclick = (e) => {
        if (e.target === searchOverlay) closeSearch();
      };

      input.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        resultsContainer.innerHTML = "";

        if (!query) {
          resultsContainer.classList.add("hidden");
          emptyState.classList.remove("hidden");
          return;
        }

        const filtered = state.tasks.filter((t) =>
          t.title.toLowerCase().includes(query),
        );

        if (filtered.length === 0) {
          resultsContainer.classList.remove("hidden");
          resultsContainer.innerHTML = `
            <div class="p-6 text-center text-[var(--text-muted)]">
                <p>Nenhuma tarefa encontrada.</p>
            </div>
          `;
          emptyState.classList.add("hidden");
        } else {
          emptyState.classList.add("hidden");
          resultsContainer.classList.remove("hidden");
          resultsContainer.innerHTML = filtered
            .map((t) => {
              const sub = state.subjects.find((s) => s.id === t.subject_id);
              const isDone = t.status === "done";
              return `
                <button class="search-item w-full text-left p-4 hover:bg-[var(--surface-subtle)] transition-colors border-b border-[var(--separator)] last:border-0 flex items-center justify-between group" data-id="${t.id}">
                    <div class="flex items-center gap-3">
                        <div class="size-2 rounded-full shrink-0" style="background-color: ${sub ? sub.color : "#4285F4"}"></div>
                        <div class="flex flex-col min-w-0">
                            <span class="text-sm font-bold text-[var(--text-primary)] truncate ${isDone ? "line-through opacity-50" : ""}">${t.title}</span>
                            <span class="text-[10px] text-[var(--text-secondary)] uppercase font-bold">${sub ? sub.name : "Geral"}</span>
                        </div>
                    </div>
                    <span class="material-symbols-outlined text-[var(--text-muted)] group-hover:text-[var(--action-primary)] transition-colors text-lg">edit</span>
                </button>
            `;
            })
            .join("");

          // Bind click nos itens
          resultsContainer.querySelectorAll(".search-item").forEach((btn) => {
            btn.onclick = () => {
              this.showTaskForm(
                state.tasks.find((t) => t.id === btn.dataset.id),
              );
              closeSearch();
            };
          });
        }
      };
    };
  }

  initTheme() {
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.className = theme;
    const color = localStorage.getItem("accent-color") || "#4285F4";
    this.applyAccentColor(color);
  }

  applyAccentColor(color) {
    const root = document.documentElement;
    root.style.setProperty("--action-primary", color);

    // Converte hex para RGB para criar variações
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Aplica a cor em todas as variáveis relacionadas
    root.style.setProperty("--action-primary-rgb", `${r}, ${g}, ${b}`);
    root.style.setProperty(
      "--shadow-button-primary",
      `0 10px 20px -5px rgba(${r}, ${g}, ${b}, 0.4)`,
    );

    // Atualiza a cor da barra de status do sistema (FORÇADO)
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // Remove a meta tag existente
      metaThemeColor.remove();
    }
    // Cria uma nova meta tag com a cor atualizada
    metaThemeColor = document.createElement("meta");
    metaThemeColor.name = "theme-color";
    metaThemeColor.content = color;
    document.head.appendChild(metaThemeColor);
    console.log("✅ Barra de status FORÇADA para:", color);
  }

  async loadData() {
    try {
      const tasks = await db.getTasks();
      const subjects = await db.getSubjects();
      updateState({ tasks, subjects });
      console.log("✅ Data loaded successfully.");
    } catch (error) {
      console.error("❌ Failed to load data from Supabase:", error);
      UI.notify(
        "Erro de conexão: verifique as chaves no menu Ajustes.",
        "error",
      );
    }
  }

  router() {
    const hash = window.location.hash || "#tasks";
    const page = hash.replace("#", "");

    // Save state before navigation
    navStateManager.setCurrentRoute(page);

    updateState("currentPage", page);
    this.render();

    // Restore state after render
    requestAnimationFrame(() => {
      navStateManager.restoreState(page);
      MobileNav.render(document.getElementById("mobile-nav-root"), page);
      this.updateHeaderTitle(page);
    });
  }

  updateHeaderTitle(page) {
    const titles = {
      tasks: "Dashboard",
      calendar: "Minha Agenda",
      schedule: "Cronograma",
      "subjects-config": "Minhas Matérias",
      settings: "Ajustes",
    };
    const title = titles[page] || "Dashboard";
    const titleEl = document.getElementById("header-title");
    if (titleEl) titleEl.textContent = title;
  }

  render() {
    const root = document.getElementById("app-root");
    if (!root) return;

    // Add smooth scrolling class
    if (!root.classList.contains("smooth-scroll")) {
      root.classList.add("smooth-scroll");
    }

    this.updateNavigationUI();

    switch (state.currentPage) {
      case "tasks":
        Dashboard.render(root, state, this.handlers);
        break;
      case "calendar":
        CalendarModule.render(root, state, this.handlers);
        break;
      case "schedule":
        Schedule.render(root, state, this.handlers);
        break;
      case "subjects-config":
        SubjectsConfig.render(root, state, this.handlers);
        break;
      case "settings":
        Settings.render(root, state, this.handlers);
        break;
      default:
        Dashboard.render(root, state, this.handlers);
    }
  }

  updateNavigationUI() {
    const page = state.currentPage;
    const titleMap = {
      tasks: "Dashboard",
      calendar: "Agenda",
      "subjects-config": "Matérias",
      settings: "Ajustes",
    };
    const titleElem = document.getElementById("page-title");
    if (titleElem) titleElem.innerText = titleMap[page] || "Organizer";

    document.querySelectorAll(".nav-btn").forEach((btn) => {
      const isTarget = btn.dataset.nav === page;
      if (isTarget) {
        btn.classList.add("text-action-primary", "bg-action-primary/5");
        btn.classList.remove("text-text-secondary/50", "text-text-secondary");
        btn.querySelectorAll("span").forEach((s) => s.classList.add("filled"));
      } else {
        btn.classList.remove("text-action-primary", "bg-action-primary/5");
        btn.classList.add("text-text-secondary");
        btn
          .querySelectorAll("span")
          .forEach((s) => s.classList.remove("filled"));
      }
    });
  }

  bindStaticEvents() {
    // Cliques na Sidebar (Desktop)
    document.querySelectorAll("aside .nav-btn").forEach((btn) => {
      btn.onclick = () => {
        const tab = btn.dataset.nav;
        window.location.hash = tab === "tasks" ? "" : tab;
      };
    });

    // Botão de adicionar no Desktop
    const globalAdd = document.getElementById("global-add-btn");
    if (globalAdd) globalAdd.onclick = () => this.showTaskForm();
  }

  showTaskForm(task = null) {
    const content = `
          <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-1">
                  <label class="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Título</label>
                  <input type="text" id="form-task-title" placeholder="O que vamos fazer?" value="${task ? task.title : ""}" class="w-full text-xl font-bold bg-surface-card border-none rounded-xl px-5 py-4 text-text-primary outline-none focus:ring-0 shadow-sm">
              </div>

              <div class="flex flex-col gap-1">
                  <label class="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Descrição</label>
                  <textarea id="form-task-desc" placeholder="Adicione mais detalhes..." class="w-full h-32 text-sm bg-surface-card border-none rounded-xl px-5 py-4 text-text-primary outline-none focus:ring-0 shadow-sm resize-none">${task?.description || ""}</textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1">
                      <label class="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Prioridade</label>
                      <select id="form-task-priority" class="w-full bg-surface-card border-none rounded-xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:ring-0 appearance-none shadow-sm">
                          <option value="low" ${task?.priority === "low" ? "selected" : ""}>Baixa</option>
                          <option value="medium" ${task?.priority === "medium" || !task ? "selected" : ""}>Média</option>
                          <option value="high" ${task?.priority === "high" ? "selected" : ""}>Alta</option>
                      </select>
                  </div>
                  <div class="flex flex-col gap-1">
                      <label class="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Prazo</label>
                      <input type="date" id="form-task-date" value="${task ? task.due_date : ""}" class="w-full bg-surface-card border-none rounded-xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:ring-0 shadow-sm">
                  </div>
              </div>

              <div class="flex flex-col gap-3">
                  <label class="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Matéria</label>
                  <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                      <button class="sub-chip shrink-0 flex items-center gap-2 px-4 py-3 rounded-full transition-all border-none ${!task?.subject_id ? "bg-action-primary text-white shadow-lg" : "bg-surface-card text-text-secondary shadow-sm"}" data-id="null">
                          <span class="text-xs font-bold">Nenhuma</span>
                      </button>
                      ${state.subjects
                        .map(
                          (s) => `
                          <button class="sub-chip shrink-0 flex items-center gap-2 px-4 py-3 rounded-full transition-all border-none ${task?.subject_id === s.id ? "bg-action-primary text-white shadow-lg" : "bg-surface-card text-text-secondary shadow-sm"}" data-id="${s.id}">
                              <div class="size-2 rounded-full" style="background-color: ${task?.subject_id === s.id ? "#fff" : s.color}"></div>
                              <span class="text-xs font-bold">${s.name}</span>
                          </button>
                      `,
                        )
                        .join("")}
                  </div>
              </div>
          </div>
      `;

    const { modal, close } = UI.showModal(
      task ? "Editar Tarefa" : "Nova Tarefa",
      content,
      `<button id="save-task" class="h-14 bg-action-primary text-white text-sm rounded-xl font-bold border-none shadow-button-primary hover:scale-[1.02] active:scale-95 transition-all">SALVAR</button>`,
    );

    // Mapeamento do cronograma para sugestão de data inteligente
    const timetable = [
      { aula: "1", dias: ["ING", "FIL", "ETC", "RED", "ESP"] },
      { aula: "2", dias: ["BIO", "ED.FIS", "ING", "", "MAT"] },
      { aula: "3", dias: ["QUI", "FIS", "GRAM", "FIS", "GEO"] },
      { aula: "4", dias: ["QUI", "FIS", "GRAM", "HIST", "LIT"] },
      { aula: "5", dias: ["MAT", "SOC", "GEO", "HIST", "LIT"] },
      { aula: "6", dias: ["MAT", "MAT", "BIO", "MAT", "BIO"] },
      { aula: "7", dias: ["", "ARTE", "", "", ""] },
    ];

    const getNextClassDate = (subjectName) => {
      const dayMap = [
        "DOMINGO",
        "SEGUNDA",
        "TERÇA",
        "QUARTA",
        "QUINTA",
        "SEXTA",
        "SÁBADO",
      ];
      const mapping = {
        Artes: "ARTE",
        Literatura: "LIT",
        Matemática: "MAT",
        Biologia: "BIO",
        Geografia: "GEO",
        Filosofia: "FIL",
        Inglês: "ING",
        Química: "QUI",
        Gramática: "GRAM",
        História: "HIST",
        Redação: "RED",
        Física: "FIS",
        Sociologia: "SOC",
        Espanhol: "ESP",
        "Ed. Física": "ED.FIS",
      };

      const sigla = mapping[subjectName];
      if (!sigla) return null;

      const daysWithClass = [];
      timetable.forEach((row) => {
        row.dias.forEach((d, i) => {
          if (d === sigla && !daysWithClass.includes(i + 1))
            daysWithClass.push(i + 1);
        });
      });

      if (daysWithClass.length === 0) return null;

      const now = new Date();
      let nextDate = new Date();

      for (let i = 1; i <= 7; i++) {
        nextDate.setDate(now.getDate() + i);
        if (daysWithClass.includes(nextDate.getDay())) {
          return nextDate.toISOString().split("T")[0];
        }
      }
      return null;
    };

    let selectedSubId = task?.subject_id || null;
    modal.querySelectorAll(".sub-chip").forEach((chip) => {
      chip.onclick = () => {
        modal.querySelectorAll(".sub-chip").forEach((c) => {
          c.classList.remove("bg-action-primary", "text-white", "shadow-lg");
          c.classList.add("bg-surface-subtle", "text-text-secondary");
          const dot = c.querySelector("div");
          if (dot)
            dot.style.backgroundColor =
              state.subjects.find((s) => s.id === c.dataset.id)?.color ||
              "#94A3B8";
        });
        chip.classList.add("bg-action-primary", "text-white", "shadow-lg");
        chip.classList.remove("bg-surface-subtle", "text-text-secondary");
        const activeDot = chip.querySelector("div");
        if (activeDot) activeDot.style.backgroundColor = "#fff";
        selectedSubId = chip.dataset.id === "null" ? null : chip.dataset.id;

        // Sugestão de data baseada no cronograma (apenas se o campo estiver vazio)
        if (selectedSubId && !task) {
          const sub = state.subjects.find((s) => s.id === selectedSubId);
          if (sub) {
            const nextDate = getNextClassDate(sub.name);
            const dateInput = document.getElementById("form-task-date");
            if (nextDate && dateInput && !dateInput.value) {
              dateInput.value = nextDate;
              UI.notify(`Prazo sugerido: Próxima aula de ${sub.name}`, "info");
            }
          }
        }
      };
    });

    document.getElementById("save-task").onclick = async () => {
      const title = document.getElementById("form-task-title").value;
      const description = document.getElementById("form-task-desc").value;
      const priority = document.getElementById("form-task-priority").value;
      const due_date = document.getElementById("form-task-date").value;

      if (!title) {
        UI.notify("A tarefa precisa de um título!", "warning");
        return;
      }

      const data = {
        title,
        description,
        priority,
        due_date,
        subject_id: selectedSubId,
        status: task ? task.status : "todo",
      };

      try {
        if (task) {
          await db.updateTask(task.id, data);
          UI.notify("Tarefa atualizada!", "success");
        } else {
          await db.createTask(data);
          UI.notify("Tarefa criada com sucesso!", "success");
        }
        await this.loadData();
        this.render();
        close();
      } catch (error) {
        console.error("Primary save failed:", error);

        // Se o erro for de coluna inexistente (provavelmente a 'description'), tenta salvar sem ela
        if (
          error.code === "42703" ||
          (error.message && error.message.includes("description"))
        ) {
          console.warn(
            "Table might be missing 'description' column. Retrying without it...",
          );
          try {
            const fallbackData = { ...data };
            delete fallbackData.description;

            if (task) {
              await db.updateTask(task.id, fallbackData);
            } else {
              await db.createTask(fallbackData);
            }

            UI.notify(
              "Tarefa salva (sem descrição). Adicione a coluna 'description' no Supabase!",
              "warning",
            );
            await this.loadData();
            this.render();
            close();
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            UI.notify("Erro crítico ao salvar no banco.", "error");
          }
        } else {
          UI.notify("Erro ao conectar com o banco de dados.", "error");
        }
      }
    };
  }

  showSubjectForm(subject = null) {
    const content = `
        <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-1">
                <label class="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Nome da Matéria</label>
                <input type="text" id="sub-name" placeholder="Ex: Cálculo I" value="${subject ? subject.name : ""}" class="w-full text-xl font-bold bg-surface-subtle/50 border-none rounded-xl px-5 py-4 text-text-primary outline-none focus:ring-0">
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Cor</label>
                <input type="color" id="sub-color" value="${subject ? subject.color : "#4285F4"}" class="w-full h-14 bg-surface-subtle/50 border-none rounded-xl px-2 py-1 cursor-pointer">
            </div>
        </div>
      `;

    const { modal, close } = UI.showModal(
      subject ? "Editar Matéria" : "Nova Matéria",
      content,
      `<button id="save-sub" class="h-14 bg-action-primary text-white text-sm rounded-xl font-bold border-none shadow-button-primary hover:scale-[1.02] active:scale-95 transition-all">SALVAR MATÉRIA</button>`,
    );

    document.getElementById("save-sub").onclick = async () => {
      const name = document.getElementById("sub-name").value;
      const color = document.getElementById("sub-color").value;

      if (!name) return;

      const data = { name, color };

      if (subject) await db.updateSubject(subject.id, data);
      else await db.createSubject(data);

      await this.loadData();
      this.render();
      close();
    };
  }
}
