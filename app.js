/**
 * ORGANIZER - Mobile First Application
 */

const App = {
  state: {
    tasks: [],
    subjects: [],
    currentPage: "tasks",
    filters: {
      search: "",
      status: "all",
      priority: "all",
      category: "upcoming", // This matches the chips
      viewMode: "list", // 'list' or 'kanban'
    },
    selectedCalendarDate: new Date().toISOString().split("T")[0],
    navStyle: localStorage.getItem("nav-style") || "docked",
  },

  async init() {
    this.initTheme();
    this.initAccentColor();
    this.initNavStyle();
    this.registerServiceWorker();
    this.bindGlobalEvents();
    await this.loadInitialData();

    // Initial check and setup periodic check
    this.checkTaskReminders();
    setInterval(() => this.checkTaskReminders(), 60000); // Check every minute

    this.router();
  },

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        this.swReg = await navigator.serviceWorker.register("sw.js");
        console.log("SW Registered", this.swReg);
      } catch (error) {
        console.error("SW Registration Failed", error);
      }
    }
  },

  bindGlobalEvents() {
    window.addEventListener("hashchange", () => this.router());

    // Navigation Buttons
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.onclick = () => {
        const target = btn.dataset.nav;
        window.location.hash = target;
      };
    });

    // Global FAB
    document.getElementById("global-add-btn").onclick = () =>
      this.showTaskForm();

    // Theme Toggle
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.onclick = () => this.toggleTheme();
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.className = savedTheme;
    this.updateThemeIcon(savedTheme);
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";
    document.documentElement.className = nextTheme;
    localStorage.setItem("theme", nextTheme);
    this.updateThemeIcon(nextTheme);
  },

  updateThemeIcon(theme) {
    const icon = document.querySelector(".theme-icon");
    if (icon) {
      icon.innerText = theme === "dark" ? "dark_mode" : "light_mode";
    }
  },

  initAccentColor() {
    const savedColor = localStorage.getItem("accent-color") || "#4285f4";
    this.setAccentColor(savedColor);
  },

  setAccentColor(color) {
    localStorage.setItem("accent-color", color);
    document.documentElement.style.setProperty("--color-primary", color);

    // Generate container colors based on the color
    // For simplicity, we just use the color itself or static variants
    document.documentElement.style.setProperty(
      "--color-primary-container",
      `${color}15`,
    ); // 10% opacity for container
    document.documentElement.style.setProperty(
      "--color-on-primary-container",
      color,
    );
  },

  initNavStyle() {
    const style = localStorage.getItem("nav-style") || "docked";
    this.setNavStyle(style);
  },

  setNavStyle(style) {
    localStorage.setItem("nav-style", style);
    this.state.navStyle = style;
    document.body.classList.remove("nav-floating", "nav-docked");
    document.body.classList.add(`nav-${style}`);
    this.renderNavigation();
  },

  renderNavigation() {
    const navContainer = document.getElementById("mobile-nav-container");
    if (!navContainer) return;

    const style = this.state.navStyle || "floating";
    const page = this.state.currentPage || "tasks";

    const getIcon = (nav, icon) => `
      <button data-nav="${nav}" class="nav-btn flex items-center justify-center w-11 h-11 transition-all active:scale-90 ${page === nav ? "text-primary bg-primary/10 rounded-xl" : "text-gray-400 dark:text-gray-500"}">
        <span class="material-symbols-outlined ${page === nav ? "filled active-tab" : ""} text-[22px]">${icon}</span>
      </button>
    `;

    if (style === "docked") {
      navContainer.className =
        "md:hidden fixed bottom-6 left-0 w-full z-50 animate-fade-in px-4";
      navContainer.innerHTML = `
        <div class="relative flex items-center justify-between bg-white/80 dark:bg-[#1A1B22]/80 backdrop-blur-xl rounded-[1.75rem] w-full max-w-[320px] mx-auto h-[60px] px-4 shadow-2xl border border-white/20 dark:border-white/5">
          <div class="flex items-center gap-1">
            ${getIcon("tasks", "dashboard")}
            ${getIcon("calendar", "calendar_month")}
          </div>
          
          <div class="w-10"></div> <!-- Space for FAB -->

          <div class="flex items-center gap-1">
            ${getIcon("subjects-config", "category")}
            ${getIcon("settings", "settings")}
          </div>

          <!-- Docked FAB -->
          <button onclick="App.showTaskForm()" class="absolute -top-5 left-1/2 -translate-x-1/2 w-[64px] h-[64px] bg-primary text-white rounded-full shadow-xl shadow-primary/40 flex items-center justify-center active:scale-90 transition-all border-[5px] border-gray-50/50 dark:border-background-dark/50 backdrop-blur-md">
            <span class="material-symbols-outlined text-white text-[28px]">add</span>
          </button>
        </div>
      `;
    } else {
      // Original Floating Style
      navContainer.className =
        "md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 w-max animate-fade-in";
      navContainer.innerHTML = `
        <nav class="flex items-center justify-center gap-1 bg-white/80 dark:bg-[#1A1B1F]/80 backdrop-blur-xl rounded-full px-2 h-[60px] shadow-2xl border border-white/20 dark:border-white/5">
          ${getIcon("tasks", "dashboard")}
          ${getIcon("calendar", "calendar_month")}
          ${getIcon("subjects-config", "category")}
          ${getIcon("settings", "settings")}
        </nav>
        <button onclick="App.showTaskForm()" class="flex items-center justify-center w-[64px] h-[64px] bg-primary rounded-[22px] shadow-xl shadow-primary/40 active:scale-95 transition-all outline-none">
          <span class="material-symbols-outlined text-white text-[32px]">add</span>
        </button>
      `;
    }

    // Bind events
    navContainer.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.onclick = () => {
        window.location.hash = btn.dataset.nav;
      };
    });
  },

  async loadInitialData() {
    try {
      if (window.supabaseClient) {
        this.state.subjects = await db.getSubjects();
        this.state.tasks = await db.getTasks();
      }
    } catch (error) {
      UI.notify("Erro ao carregar dados", "error");
    }
  },

  loadDemoData() {
    this.state.subjects = [];
    this.state.tasks = [];
  },

  router() {
    if (!window.location.hash || window.location.hash === "#") {
      window.location.hash = "#tasks";
      return;
    }
    const hash = window.location.hash;
    const page = hash.replace("#", "");
    this.state.currentPage = page;

    // Update Page Title (PC)
    const titles = {
      tasks: "Dashboard de Tarefas",
      "subjects-view": "Visão por Matérias",
      "subjects-config": "Gerenciar Categorias",
      calendar: "Calendário",
      settings: "Configurações",
    };
    const titleEl = document.getElementById("page-title");
    if (titleEl) titleEl.innerText = titles[page] || "Organizer";

    // Update Sidebar Active State (PC)
    document.querySelectorAll("aside .nav-btn").forEach((btn) => {
      const btnPage = btn.dataset.nav;
      const isActive = btnPage === page;
      const icon = btn.querySelector(".material-symbols-outlined");
      const label = btn.querySelector("span:not(.material-symbols-outlined)");

      if (isActive) {
        btn.classList.add("text-primary", "bg-primary/10");
        if (icon) {
          icon.classList.add("filled", "text-primary");
          icon.classList.remove("text-gray-500");
        }
        if (label) {
          label.classList.add("text-primary");
          label.classList.remove("text-gray-600");
        }
      } else {
        btn.classList.remove("text-primary", "bg-primary/10");
        if (icon) {
          icon.classList.remove("filled", "text-primary");
          icon.classList.add("text-gray-500");
        }
        if (label) {
          label.classList.remove("text-primary");
          label.classList.add("text-gray-600");
        }
      }
    });

    this.render(true);
    this.renderNavigation();
  },

  render(animate = false) {
    const root = document.getElementById("app-root");

    if (animate) {
      root.classList.remove("animate_page");
      void root.offsetWidth; // Trigger reflow
      root.classList.add("animate_page");
    }

    switch (this.state.currentPage) {
      case "tasks":
        this.renderTasksPage(root);
        break;
      case "subjects-view":
        this.renderBySubjectPage(root);
        break;
      case "subjects-config":
        this.renderSubjectsConfigPage(root);
        break;
      case "calendar":
        this.renderCalendarPage(root);
        break;
      case "settings":
        this.renderSettingsPage(root);
        break;
      default:
        this.renderTasksPage(root);
    }
  },

  renderTasksPage(root) {
    const filteredTasks = this.getFilteredTasks();
    const doneCount = filteredTasks.filter((t) => t.status === "done").length;

    root.innerHTML = `
            <div class="animate-fade-in flex flex-col w-full pb-60">
                <!-- Welcome Section (PC only) -->
                <div class="hidden md:flex flex-col gap-2 mb-10">
                    <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Eai, Meu Nobre!</h1>
                    <p class="text-gray-500 font-medium">Você tem <span id="welcome-count" class="text-primary font-bold">${filteredTasks.length - doneCount} tarefas</span> listadas.</p>
                </div>

                <!-- Stats Cards (PC only) -->
                <div class="hidden md:flex flex-wrap gap-4 mb-10">
                    <div class="flex-1 min-w-[200px] bg-white dark:bg-[#1A1B1E] p-6 rounded-[2rem] border border-outline/10 shadow-sm">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                        <p class="text-2xl font-black text-gray-900 dark:text-white">${this.state.tasks.length}</p>
                    </div>
                    <div class="flex-1 min-w-[200px] bg-white dark:bg-[#1A1B1E] p-6 rounded-[2rem] border border-outline/10 shadow-sm">
                        <p class="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Pendentes</p>
                        <p class="text-2xl font-black text-primary">${this.state.tasks.filter((t) => t.status !== "done").length}</p>
                    </div>
                    <div class="flex-1 min-w-[200px] bg-white dark:bg-[#1A1B1E] p-6 rounded-[2rem] border border-outline/10 shadow-sm">
                        <p class="text-[10px] font-black text-google-green uppercase tracking-widest mb-1">Concluídas</p>
                        <p class="text-2xl font-black text-google-green">${this.state.tasks.filter((t) => t.status === "done").length}</p>
                    </div>
                </div>

                <!-- Search & Filters Bar -->
                <div class="flex flex-wrap gap-4 mb-10 items-center justify-between">
                    <div class="relative flex-grow max-w-full md:max-w-md">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input type="text" id="task-search" placeholder="Pesquisar tarefas..." value="${this.state.filters.search}" class="w-full h-14 pl-12 pr-4 bg-white dark:bg-gray-800 border-outline/20 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary shadow-sm">
                    </div>

                    <div class="flex gap-2 overflow-x-auto no-scrollbar">
                        ${[
                          { id: "all", label: "TODOS" },
                          { id: "tomorrow", label: "AMANHÃ" },
                          { id: "upcoming", label: "PRÓXIMOS" },
                          { id: "done", label: "CONCLUÍDOS" },
                        ]
                          .map(
                            (cat) => `
                            <button data-cat="${cat.id}" class="chip flex h-11 items-center justify-center gap-2 rounded-2xl px-6 transition-all active:scale-95 border ${this.state.filters.category === cat.id ? "bg-primary text-white border-transparent shadow-md" : "border-outline/20 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}">
                                <span class="text-xs font-black uppercase tracking-widest whitespace-nowrap">${cat.label}</span>
                            </button>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <!-- Task Container -->
                <div class="flex flex-col gap-2 flex-grow">
                    <div class="flex items-center justify-between py-2 mb-2">
                        <div class="flex items-center gap-4">
                            <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-widest"><span id="search-results-count">${filteredTasks.length}</span> TAREFAS ENCONTRADAS</h2>
                            <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                <button id="view-list-btn" class="p-1.5 px-3 rounded-lg text-[10px] md:text-xs font-bold transition-all ${this.state.filters.viewMode === "list" ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-400"}">LISTA</button>
                                <button id="view-kanban-btn" class="p-1.5 px-3 rounded-lg text-[10px] md:text-xs font-bold transition-all ${this.state.filters.viewMode === "kanban" ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-400"}">KANBAN</button>
                            </div>
                        </div>
                        <div class="flex gap-2">
                             ${[
                               { id: "all", label: "Todas", color: "text-gray-400" },
                               { id: "high", label: "Alta", color: "text-[#EA4335]" },
                               { id: "medium", label: "Média", color: "text-[#FBBC05]" },
                               { id: "low", label: "Baixa", color: "text-[#34A853]" },
                             ]
                               .map(
                                 (p) => `
                                 <button data-priority="${p.id}" class="priority-filter-btn flex items-center justify-center h-8 px-3 rounded-xl transition-all active:scale-95 border ${this.state.filters.priority === p.id ? "bg-white dark:bg-gray-700 shadow-sm border-outline/20" : "border-transparent"}">
                                     <span class="text-[10px] font-bold ${this.state.filters.priority === p.id ? p.color : "text-gray-400"}">${p.label.toUpperCase()}</span>
                                 </button>
                             `,
                               )
                               .join("")}
                        </div>
                    </div>
                    
                    <div id="tasks-display-area">
                        ${
                          this.state.filters.viewMode === "list"
                            ? `
                            <div id="tasks-list-container" class="flex flex-wrap gap-6 pb-10">
                                ${
                                  filteredTasks.length
                                    ? filteredTasks
                                        .map(
                                          (t) =>
                                            `<div class="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex-shrink-0 min-w-[280px]">${UI.renderTaskCard(t, this.state.subjects)}</div>`,
                                        )
                                        .join("")
                                    : `
                                    <div class="w-full flex flex-col items-center justify-center py-24 text-center opacity-30">
                                        <span class="material-symbols-outlined text-8xl">task_alt</span>
                                        <p class="mt-4 font-black uppercase tracking-tighter text-2xl">Nada para mostrar</p>
                                    </div>
                                `
                                }
                            </div>
                        `
                            : this.renderKanbanHTML(filteredTasks)
                        }
                    </div>
                </div>
            </div>
        `;

    this.bindTasksPageEvents();
    if (this.state.filters.viewMode === "kanban") this.bindKanbanEvents();
  },

  bindTasksPageEvents() {
    const searchInput = document.getElementById("task-search");
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.state.filters.search = e.target.value;
        this.updateTasksDisplay();
      };
    }

    document.querySelectorAll(".chip").forEach((chip) => {
      chip.onclick = () => {
        this.state.filters.category = chip.dataset.cat;
        this.render();
      };
    });

    document.querySelectorAll(".priority-filter-btn").forEach((btn) => {
      btn.onclick = () => {
        this.state.filters.priority = btn.dataset.priority;
        this.render();
      };
    });

    const listBtn = document.getElementById("view-list-btn");
    const kanbanBtn = document.getElementById("view-kanban-btn");

    if (listBtn)
      listBtn.onclick = () => {
        this.state.filters.viewMode = "list";
        this.render();
      };

    if (kanbanBtn)
      kanbanBtn.onclick = () => {
        this.state.filters.viewMode = "kanban";
        this.render();
      };

    if (this.state.filters.viewMode === "kanban") this.bindKanbanEvents();
    this.bindTaskItemEvents();
  },

  updateTasksDisplay() {
    const displayArea = document.getElementById("tasks-display-area");
    const welcomeCount = document.getElementById("welcome-count");
    const searchResultsCount = document.getElementById("search-results-count");

    if (!displayArea) return;

    const filteredTasks = this.getFilteredTasks();
    const doneCount = filteredTasks.filter((t) => t.status === "done").length;

    // Update counts
    if (welcomeCount)
      welcomeCount.innerText = `${filteredTasks.length - doneCount} tarefas`;
    if (searchResultsCount) searchResultsCount.innerText = filteredTasks.length;

    // Render content
    if (this.state.filters.viewMode === "list") {
      displayArea.innerHTML = `
                <div id="tasks-list-container" class="flex flex-wrap gap-6 pb-10">
                    ${
                      filteredTasks.length
                        ? filteredTasks
                            .map(
                              (t) =>
                                `<div class="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] flex-shrink-0 min-w-[280px]">${UI.renderTaskCard(t, this.state.subjects)}</div>`,
                            )
                            .join("")
                        : `
                        <div class="w-full flex flex-col items-center justify-center py-24 text-center opacity-30">
                            <span class="material-symbols-outlined text-8xl">task_alt</span>
                            <p class="mt-4 font-black uppercase tracking-tighter text-2xl">Nada para mostrar</p>
                        </div>
                    `
                    }
                </div>
            `;
    } else {
      displayArea.innerHTML = this.renderKanbanHTML(filteredTasks);
      this.bindKanbanEvents();
    }

    this.bindTaskItemEvents();
  },

  bindTaskItemEvents() {
    document.querySelectorAll(".task-checkbox").forEach((cb) => {
      cb.onchange = (e) => {
        const id = cb.dataset.id;
        const status = e.target.checked ? "done" : "todo";
        this.handleUpdateStatus(id, status);
      };
    });

    document.querySelectorAll(".action-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.closest("[data-id]").dataset.id;
        const action = btn.dataset.action;
        const task = this.state.tasks.find((t) => t.id === id);
        if (action === "delete") this.handleDeleteTask(id);
        if (action === "edit") this.showTaskForm(task);
      };
    });
  },

  renderSubjectsConfigPage(root) {
    root.innerHTML = `
            <div class="animate-fade-in flex flex-col w-full pb-60">
                <div class="flex justify-between items-center mb-10">
                    <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Matérias</h2>
                    <button id="add-sub-btn" class="h-12 px-6 bg-primary text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20">NOVA MATÉRIA</button>
                </div>

                <!-- Subjects Task Overview (Merged View) -->
                <div class="mb-12">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Tarefas por Categoria</h3>
                    <div class="flex flex-wrap gap-6">
                        ${
                          this.state.subjects.length
                            ? this.state.subjects
                                .map((s) => {
                                  const tasks = this.state.tasks.filter(
                                    (t) => t.subject_id === s.id,
                                  );
                                  const pending = tasks.filter(
                                    (t) => t.status !== "done",
                                  ).length;
                                  return `
                                <div class="flex-1 min-w-[280px] bg-white dark:bg-[#1A1B1E] rounded-[2rem] p-6 border border-outline/10 shadow-sm">
                                    <div class="flex items-center justify-between mb-6">
                                        <div class="flex items-center gap-3">
                                            <div class="w-3 h-3 rounded-full" style="background-color: ${s.color}"></div>
                                            <div>
                                                <h4 class="font-bold text-gray-900 dark:text-white">${s.name}</h4>
                                                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">${tasks.length} Tarefas</p>
                                            </div>
                                        </div>
                                        <div class="flex gap-1">
                                            <button class="edit-sub p-2 text-gray-400 hover:text-primary transition-colors" data-id="${s.id}"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                                            <button class="delete-sub p-2 text-gray-400 hover:text-google-red transition-colors" data-id="${s.id}"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                                        </div>
                                    </div>

                                    <div class="space-y-3">
                                        ${tasks
                                          .filter((t) => t.status !== "done")
                                          .slice(0, 3)
                                          .map(
                                            (t) => `
                                            <div class="flex items-center gap-3 text-sm group">
                                                <div class="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></div>
                                                <span class="text-gray-600 dark:text-gray-400 font-medium truncate">${t.title}</span>
                                            </div>
                                        `,
                                          )
                                          .join("")}
                                        ${pending === 0 ? '<p class="text-xs text-gray-300 italic py-2">Nenhuma tarefa pendente</p>' : ""}
                                        ${pending > 3 ? `<p class="text-[10px] font-black text-primary uppercase mt-2">+ ${pending - 3} outras pendentes</p>` : ""}
                                    </div>
                                    
                                    ${
                                      tasks.length > 0
                                        ? `
                                        <div class="mt-6 pt-4 border-t border-outline/5 flex items-center justify-between">
                                            <div class="h-1.5 flex-1 bg-gray-100/50 dark:bg-white/5 rounded-full overflow-hidden mr-4">
                                                <div class="h-full bg-google-green" style="width: ${(tasks.filter((t) => t.status === "done").length / tasks.length) * 100}%"></div>
                                            </div>
                                            <span class="text-[10px] font-black text-google-green">${Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100)}%</span>
                                        </div>
                                    `
                                        : ""
                                    }
                                </div>
                            `;
                                })
                                .join("")
                            : `
                            <div class="w-full py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                <p class="text-gray-400 font-medium">Nenhuma matéria cadastrada ainda.</p>
                            </div>
                        `
                        }
                    </div>
                </div>
            </div>
        `;

    document.getElementById("add-sub-btn").onclick = () =>
      this.showSubjectForm();
    document.querySelectorAll(".edit-sub").forEach(
      (btn) =>
        (btn.onclick = (e) => {
          e.stopPropagation();
          this.showSubjectForm(
            this.state.subjects.find((s) => s.id === btn.dataset.id),
          );
        }),
    );
    document.querySelectorAll(".delete-sub").forEach(
      (btn) =>
        (btn.onclick = (e) => {
          e.stopPropagation();
          this.handleDeleteSubject(btn.dataset.id);
        }),
    );
  },

  renderBySubjectPage(root) {
    this.renderSubjectsConfigPage(root); // Redirect or alias for safety
  },

  renderKanbanHTML(filteredTasks) {
    const columns = [
      { id: "todo", title: "Para Fazer", dot: "bg-google-blue" },
      { id: "in_progress", title: "Em Progresso", dot: "bg-google-yellow" },
      { id: "done", title: "Concluído", dot: "bg-google-green" },
    ];

    return `
            <div class="flex flex-col w-full">
                <!-- Mobile instructions (pc hidden) -->
                <p class="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Arraste para mudar o status</p>

                <div class="flex flex-col md:flex-row gap-6 items-stretch pb-60">
                    ${columns
                      .map((col) => {
                        const colTasks = filteredTasks.filter(
                          (t) => t.status === col.id,
                        );
                        return `
                            <div class="flex-1 flex flex-col h-full">
                                <!-- Column Header -->
                                <div class="flex items-center justify-between mb-4 px-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-3 h-3 rounded-full ${col.dot}"></div>
                                        <h3 class="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">${col.title}</h3>
                                    </div>
                                    <span class="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">${colTasks.length}</span>
                                </div>

                                <!-- Column Body -->
                                <div class="kanban-column flex-1 flex flex-col gap-4 min-h-[400px] pb-10 transition-colors overflow-y-auto no-scrollbar" data-status="${col.id}">
                                    ${colTasks
                                      .map(
                                        (t) => `
                                        <div class="kanban-item cursor-grab active:cursor-grabbing" draggable="true" data-id="${t.id}">
                                            ${UI.renderTaskCard(t, this.state.subjects)}
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>
            </div>
        `;
  },

  bindKanbanEvents() {
    const columns = document.querySelectorAll(".kanban-column");
    columns.forEach((col) => {
      col.ondragover = (e) => {
        e.preventDefault();
        col.classList.add("bg-primary/5", "border-primary/20");
      };
      col.ondragleave = () => {
        col.classList.remove("bg-primary/5", "border-primary/20");
      };
      col.ondrop = (e) => {
        e.preventDefault();
        col.classList.remove("bg-primary/5", "border-primary/20");
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) this.handleUpdateStatus(taskId, col.dataset.status);
      };
    });

    document.querySelectorAll(".kanban-item").forEach((item) => {
      item.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", item.dataset.id);
        item.style.opacity = "0.4";
      };
      item.ondragend = () => (item.style.opacity = "1");
    });
  },

  renderCalendarPage(root) {
    root.innerHTML = this.renderCalendarHTML(this.state.tasks);
    this.bindCalendarEvents();
  },

  renderCalendarHTML(filteredTasks) {
    if (!this.state.calendarDate) this.state.calendarDate = new Date();
    const year = this.state.calendarDate.getFullYear();
    const month = this.state.calendarDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    let calendarRows = [];
    let week = Array(7).fill(null);

    for (let i = 0; i < firstDay; i++) week[i] = null;

    let currentDay = firstDay;
    for (let date = 1; date <= lastDate; date++) {
      if (currentDay === 7) {
        calendarRows.push(week);
        week = Array(7).fill(null);
        currentDay = 0;
      }
      week[currentDay] = date;
      currentDay++;
    }
    calendarRows.push(week);

    const selectedDateStr = this.state.selectedCalendarDate || new Date().toISOString().split('T')[0];
    const selectedDayTasks = this.state.tasks.filter(t => t.due_date === selectedDateStr);

    return `
            <div class="animate-fade-in flex flex-col gap-6 pb-60">
                <!-- Page Info (PC only) -->
                <div class="hidden md:flex flex-col gap-2 mb-4">
                    <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Calendário</h1>
                    <p class="text-gray-500 font-medium">Visualize sua jornada ao longo do mês.</p>
                </div>

                <div class="flex flex-col lg:flex-row gap-6 items-start">
                    <!-- Calendar Container -->
                    <div class="w-full lg:flex-1 bg-white dark:bg-[#1A1B1E] rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-outline/10 flex flex-col gap-6">
                        <!-- Calendar Header -->
                        <div class="flex items-center justify-between px-2">
                            <div class="flex items-center gap-4 text-xl md:text-3xl font-black text-gray-900 dark:text-white">
                                <span>${monthNames[month]}</span>
                                <span class="opacity-30">${year}</span>
                            </div>
                            <div class="flex gap-2">
                                <button id="cal-prev" class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl hover:text-primary transition-colors">
                                    <span class="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button id="cal-next" class="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-2xl hover:text-primary transition-colors">
                                    <span class="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <!-- Grid -->
                        <div class="grid grid-cols-7 gap-1 md:gap-3 border-t border-outline/5 pt-6">
                            ${dayNames.map(d => `<div class="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center py-2">${d}</div>`).join('')}
                            
                            ${calendarRows.map(row => row.map(d => {
                                if (d === null) return `<div class="aspect-square"></div>`;
                                
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const dayTasks = this.state.tasks.filter(t => t.due_date === dateStr);
                                const isToday = new Date().toISOString().split('T')[0] === dateStr;
                                const isSelected = selectedDateStr === dateStr;

                                return `
                                    <button data-date="${dateStr}" class="cal-day aspect-square md:aspect-auto md:min-h-[140px] w-full p-1 md:p-4 border border-outline/5 rounded-2xl md:rounded-3xl flex flex-col gap-1 md:gap-2 transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'bg-transparent'} ${isToday ? 'border-primary/50' : ''}">
                                        <span class="text-xs md:text-sm font-black ${isToday ? 'text-primary' : (isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-400')}">${d}</span>
                                        
                                        <!-- Desktop Tasks -->
                                        <div class="hidden md:flex flex-col gap-1.5 overflow-hidden w-full mt-2">
                                            ${dayTasks.map(t => {
                                                const sub = this.state.subjects.find(s => s.id === t.subject_id);
                                                const bgColor = sub ? `${sub.color}20` : 'var(--color-primary-container)';
                                                const textColor = sub ? sub.color : 'var(--color-primary)';
                                                return `<div class="text-[9px] font-bold px-2 py-1 rounded-lg truncate text-left" style="background-color: ${bgColor}; color: ${textColor}">${t.title}</div>`;
                                            }).join('')}
                                        </div>

                                        <!-- Mobile Indicator -->
                                        <div class="md:hidden flex flex-wrap gap-1 justify-center mt-auto pb-1">
                                            ${dayTasks.slice(0, 3).map(t => {
                                                const sub = this.state.subjects.find(s => s.id === t.subject_id);
                                                return `<div class="w-1.5 h-1.5 rounded-full shadow-sm" style="background-color: ${sub ? sub.color : 'var(--color-primary)'}"></div>`;
                                            }).join('')}
                                        </div>
                                    </button>
                                `;
                            }).join('')).join('')}
                        </div>
                    </div>

                    <!-- Side Agenda (Mobile/Selected Day Detail) -->
                    <div class="w-full lg:w-96 shrink-0 flex flex-col gap-6">
                        <div class="bg-primary/5 dark:bg-primary/15 p-8 rounded-[2.5rem] border border-primary/20 sticky top-4">
                            <h3 class="text-xs font-black text-primary uppercase tracking-widest mb-2">Agenda do Dia</h3>
                            <p class="text-2xl font-black text-gray-900 dark:text-white mb-6">${selectedDateStr.split('-').reverse().join('/')}</p>
                            
                            <div class="flex flex-col gap-4">
                                ${selectedDayTasks.length > 0 ? selectedDayTasks.map(t => {
                                    const sub = this.state.subjects.find(s => s.id === t.subject_id);
                                    return `
                                        <div class="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-outline/10 shadow-sm flex flex-col gap-3 group transition-all hover:translate-x-1" data-id="${t.id}">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center gap-3 min-w-0">
                                                    <div class="w-3 h-3 rounded-full shrink-0 shadow-sm" style="background-color: ${sub?.color || 'var(--color-primary)'}"></div>
                                                    <span class="text-sm font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">${t.title}</span>
                                                </div>
                                                <button class="action-btn text-gray-400 hover:text-primary transition-colors translate-x-1" data-action="edit">
                                                    <span class="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                            </div>
                                            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">${t.description || 'Sem descrição detalhada.'}</p>
                                        </div>
                                    `;
                                }).join('') : `
                                    <div class="py-12 flex flex-col items-center justify-center opacity-30 text-center">
                                        <span class="material-symbols-outlined text-5xl mb-3">event_available</span>
                                        <p class="text-xs font-black uppercase tracking-widest">Nenhuma tarefa agendada</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  },

  bindCalendarEvents() {
    const prev = document.getElementById("cal-prev");
    const next = document.getElementById("cal-next");

    if (prev)
      prev.onclick = () => {
        this.state.calendarDate.setMonth(this.state.calendarDate.getMonth() - 1);
        this.render();
      };

    if (next)
      next.onclick = () => {
        this.state.calendarDate.setMonth(this.state.calendarDate.getMonth() + 1);
        this.render();
      };

    document.querySelectorAll(".cal-day").forEach((btn) => {
      btn.onclick = () => {
        this.state.selectedCalendarDate = btn.dataset.date;
        this.render();
      };
    });

    this.bindTaskItemEvents();
  },

  getFilteredTasks() {
    return this.state.tasks
      .filter((t) => {
        const matchesSearch = t.title
          .toLowerCase()
          .includes(this.state.filters.search.toLowerCase());

        let matchesCategory = true;
        if (this.state.filters.category === "tomorrow") {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split("T")[0];
          matchesCategory = t.due_date === tomorrowStr;
        } else if (this.state.filters.category === "upcoming") {
          const today = new Date().toISOString().split("T")[0];
          matchesCategory = t.due_date > today;
        } else if (this.state.filters.category === "done") {
          matchesCategory = t.status === "done";
        }

        const matchesPriority =
          this.state.filters.priority === "all" ||
          t.priority === this.state.filters.priority;

        return matchesSearch && matchesCategory && matchesPriority;
      })
      .sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
  },

  async handleUpdatePriority(id, priority) {
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return;
    task.priority = priority;
    if (window.supabaseClient) await db.updateTask(id, { priority });
    UI.notify("Prioridade atualizada", "success");
    this.render();
  },

  async handleUpdateStatus(id, status) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card && status === "done") {
      card.classList.add("animate-complete");
      await new Promise((r) => setTimeout(r, 500));
    }

    const task = this.state.tasks.find((t) => t.id === id);
    task.status = status;
    if (window.supabaseClient) await db.updateTask(id, { status });
    UI.notify(
      status === "done" ? "Tarefa concluída! 🎉" : "Tarefa reaberta",
      "success",
    );
    this.render();
  },

  async handleDeleteTask(id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.classList.add("animate-delete");
      await new Promise((r) => setTimeout(r, 400));
    }

    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    if (window.supabaseClient) await db.deleteTask(id);
    UI.notify("Removido", "info");
    this.render();
  },

  showTaskForm(task = null) {
    const content = `
            <div class="flex flex-col gap-5">
                <input type="text" id="form-task-title" placeholder="O que precisa ser feito?" autocomplete="off" value="${task ? task.title : ""}" class="w-full text-lg font-bold border-0 border-b-2 border-outline/10 bg-transparent focus:ring-0 focus:border-primary pb-2 placeholder:text-gray-300 dark:text-white">
                
                <textarea id="form-task-desc" placeholder="Adicionar detalhes..." autocomplete="off" class="w-full text-sm border-0 border-b-2 border-outline/10 bg-transparent focus:ring-0 focus:border-primary pb-2 placeholder:text-gray-400 min-h-[80px] dark:text-white/80">${task ? task.description || "" : ""}</textarea>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-400 uppercase">Prioridade</label>
                        <select id="form-task-priority" class="bg-surface-variant dark:bg-gray-800 rounded-2xl border-none text-sm h-11 px-4">
                            <option value="low" ${task?.priority === "low" ? "selected" : ""}>Baixa</option>
                            <option value="medium" ${task?.priority === "medium" || !task ? "selected" : ""}>Média</option>
                            <option value="high" ${task?.priority === "high" ? "selected" : ""}>Alta</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-[10px] font-bold text-gray-400 uppercase">Data</label>
                        <input type="date" id="form-task-date" value="${task ? task.due_date : ""}" class="bg-surface-variant dark:bg-gray-800 rounded-2xl border-none text-sm h-11 px-4">
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase">Matéria</label>
                    <div class="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        ${this.state.subjects
                          .map(
                            (s) => `
                            <button class="sub-chip shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-outline dark:border-gray-700 transition-all ${task?.subject_id === s.id ? "bg-primary-container dark:bg-primary/20 border-primary text-primary" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"}" data-id="${s.id}">
                                <div class="w-2 h-2 rounded-full" style="background-color: ${s.color}"></div>
                                <span class="text-xs font-semibold">${s.name}</span>
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
      `<button id="save-task" class="h-14 bg-primary text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20">SALVAR TAREFA</button>`,
    );

    let selectedSubId = task?.subject_id || null;
    modal.querySelectorAll(".sub-chip").forEach((chip) => {
      chip.onclick = () => {
        modal.querySelectorAll(".sub-chip").forEach((c) => {
          c.classList.remove(
            "bg-primary-container",
            "dark:bg-primary/20",
            "border-primary",
            "text-primary",
          );
          c.classList.add(
            "bg-white",
            "dark:bg-gray-800",
            "text-gray-600",
            "dark:text-gray-400",
          );
        });
        chip.classList.remove(
          "bg-white",
          "dark:bg-gray-800",
          "text-gray-600",
          "dark:text-gray-400",
        );
        chip.classList.add(
          "bg-primary-container",
          "dark:bg-primary/20",
          "border-primary",
          "text-primary",
        );
        selectedSubId = chip.dataset.id;
      };
    });

    document.getElementById("save-task").onclick = async () => {
      const data = {
        title: document.getElementById("form-task-title").value,
        description: document.getElementById("form-task-desc").value,
        priority: document.getElementById("form-task-priority").value,
        due_date: document.getElementById("form-task-date").value,
        subject_id: selectedSubId,
      };

      if (!data.title) return UI.notify("Título obrigatório", "warning");

      if (task) {
        Object.assign(
          this.state.tasks.find((t) => t.id === task.id),
          data,
        );
        if (window.supabaseClient) await db.updateTask(task.id, data);
      } else {
        const nt = window.supabaseClient
          ? await db.createTask(data)
          : { id: Date.now().toString(), status: "todo", ...data };
        this.state.tasks.unshift(nt);
      }

      this.render();
      close();
      UI.notify("Salvo!", "success");
    };
  },

  showSubjectForm(subject = null) {
    const content = `
            <div class="flex flex-col gap-4">
                <input type="text" id="form-sub-name" placeholder="Nome da Matéria" value="${subject ? subject.name : ""}" class="h-12 bg-surface-variant dark:bg-gray-800 dark:text-white rounded-2xl px-4 border-none font-bold">
                <div class="flex items-center gap-4 px-2">
                    <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Cor:</span>
                    <input type="color" id="form-sub-color" value="${subject ? subject.color : "var(--color-primary)"}" class="h-10 grow border-none bg-transparent cursor-pointer">
                </div>
            </div>
        `;

    const { modal, close } = UI.showModal(
      subject ? "Editar Matéria" : "Nova Matéria",
      content,
      `<button id="save-sub" class="h-14 bg-gray-900 text-white rounded-2xl font-bold active:scale-95 transition-all">CONCLUIR</button>`,
    );

    const nameInput = document.getElementById("form-sub-name");

    document.getElementById("save-sub").onclick = async () => {
      const data = {
        name: nameInput.value,
        color: document.getElementById("form-sub-color").value,
      };
      if (!data.name) return;

      if (subject) {
        Object.assign(
          this.state.subjects.find((s) => s.id === subject.id),
          data,
        );
        if (window.supabaseClient) await db.updateSubject(subject.id, data);
      } else {
        const ns = window.supabaseClient
          ? await db.createSubject(data)
          : { id: Date.now().toString(), ...data };
        this.state.subjects.push(ns);
      }
      this.render();
      close();
    };
  },

  async handleDeleteSubject(id) {
    this.state.subjects = this.state.subjects.filter((s) => s.id !== id);
    if (window.supabaseClient) await db.deleteSubject(id);
    this.render();
  },

  renderSettingsPage(root) {
    const colors = [
      { name: "Google Blue", value: "#4285f4" },
      { name: "Red", value: "#EA4335" },
      { name: "Green", value: "#34A853" },
      { name: "Yellow", value: "#FBBC05" },
      { name: "Purple", value: "#A142F4" },
      { name: "Pink", value: "#F442A1" },
      { name: "Orange", value: "#F48542" },
      { name: "Teal", value: "#00BFA5" },
      { name: "Indigo", value: "#3F51B5" },
      { name: "Gray", value: "#5F6368" },
    ];

    const currentColor = localStorage.getItem("accent-color") || "#4285f4";

    root.innerHTML = `
            <div class="animate-fade-in flex flex-col gap-8 max-w-2xl mx-auto w-full px-4 pb-60">
                <div class="flex flex-col gap-2">
                    <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Configurações</h1>
                    <p class="text-gray-500 font-medium">Personalize a aparência do seu Organizer.</p>
                </div>

                <div class="bg-white dark:bg-[#1A1B1E] p-8 rounded-3xl border border-outline/10 shadow-sm">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">Cor de Destaque</h2>
                    <div class="grid grid-cols-5 gap-4 md:gap-6">
                        ${colors
                          .map(
                            (c) => `
                            <button 
                                onclick="App.setAccentColor('${c.value}'); App.render();"
                                class="w-12 h-12 rounded-full border-4 transition-all active:scale-95 hover:scale-110 ${currentColor === c.value ? "border-primary" : "border-transparent"}"
                                style="background-color: ${c.value}"
                                title="${c.name}"
                            ></button>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                <div class="bg-white dark:bg-[#1A1B1E] p-8 rounded-3xl border border-outline/10 shadow-sm">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Notificações</h2>
                    <p class="text-sm text-gray-500 mb-6">Receba alertas sobre suas tarefas diretamente no sistema.</p>
                    
                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-outline/5 mb-4">
                        <div class="flex flex-col">
                            <span class="text-sm font-bold text-gray-900 dark:text-white">Horário do Lembrete</span>
                            <span class="text-xs text-gray-500 italic">Resumo diário de tarefas</span>
                        </div>
                        <input 
                            type="time" 
                            id="notif-time" 
                            value="${localStorage.getItem("notif-time") || "12:00"}"
                            onchange="App.changeNotificationTime(this.value)"
                            class="bg-white dark:bg-gray-800 border-none rounded-lg text-sm font-bold text-primary focus:ring-2 focus:ring-primary"
                        >
                    </div>

                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-outline/5">
                        <div class="flex flex-col">
                            <span class="text-sm font-bold text-gray-900 dark:text-white">Permissão do Sistema</span>
                            <span id="notif-status" class="text-xs text-gray-500 italic">Verificando...</span>
                        </div>
                        <button 
                            onclick="App.requestNotificationPermission()"
                            class="h-10 px-4 bg-primary text-white text-xs font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
                        >Permitir</button>
                    </div>

                    <button 
                        onclick="App.sendTestNotification()"
                        class="mt-4 w-full h-12 border-2 border-primary/20 text-primary text-xs font-black rounded-xl hover:bg-primary/5 active:scale-95 transition-all uppercase tracking-widest"
                    >Enviar Notificação de Teste</button>
                </div>

                <div class="bg-white dark:bg-[#1A1B1E] p-8 rounded-3xl border border-outline/10 shadow-sm mb-10">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Estilo do Menu</h2>
                    <p class="text-sm text-gray-500 mb-6">Escolha como o menu principal aparece no seu dispositivo.</p>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <button 
                            onclick="App.setNavStyle('floating'); App.render();"
                            class="p-4 rounded-2xl border-2 transition-all ${this.state.navStyle === "floating" ? "border-primary bg-primary/5" : "border-outline/20 bg-gray-50 dark:bg-gray-800/50"} flex flex-col items-center gap-3"
                        >
                            <div class="w-16 h-8 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center gap-1 px-2">
                                <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                                <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                                <div class="w-4 h-4 bg-primary rounded-sm ml-2"></div>
                            </div>
                            <span class="text-xs font-bold ${this.state.navStyle === "floating" ? "text-primary" : "text-gray-500"}">Floating</span>
                        </button>
                        
                        <button 
                            onclick="App.setNavStyle('docked'); App.render();"
                            class="p-4 rounded-2xl border-2 transition-all ${this.state.navStyle === "docked" ? "border-primary bg-primary/5" : "border-outline/20 bg-gray-50 dark:bg-gray-800/50"} flex flex-col items-center gap-3"
                        >
                            <div class="relative w-16 h-8 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center">
                                <div class="absolute -top-2 w-5 h-5 bg-primary rounded-full border-2 border-white dark:border-gray-700"></div>
                            </div>
                            <span class="text-xs font-bold ${this.state.navStyle === "docked" ? "text-primary" : "text-gray-500"}">Docked</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

    this.updateNotificationStatus();
  },

  updateNotificationStatus() {
    const el = document.getElementById("notif-status");
    if (!el) return;

    if (!("Notification" in window)) {
      el.innerText = "Não suportado neste navegador";
      return;
    }

    const statusMap = {
      granted: "Ativada ✅",
      denied: "Bloqueada ❌",
      default: "Não solicitada ❓",
    };
    el.innerText = statusMap[Notification.permission] || "Desconhecido";
  },

  async requestNotificationPermission() {
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    this.updateNotificationStatus();

    if (permission === "granted") {
      UI.notify("Notificações ativadas! 🔔", "success");
    }
  },

  changeNotificationTime(time) {
    localStorage.setItem("notif-time", time);
    UI.notify(`Horário atualizado para ${time} 🕒`, "success");
  },

  async sendTestNotification() {
    if (Notification.permission === "granted") {
      const options = {
        body: "Isso é uma notificação em segundo plano! 🚀",
        icon: "assets/div.ico",
        badge: "assets/div.ico",
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1,
        },
      };

      if (this.swReg) {
        this.swReg.showNotification("Organizer", options);
      } else {
        new Notification("Organizer", options);
      }
    } else {
      UI.notify("Por favor, ative as notificações primeiro.", "warning");
    }
  },

  checkTaskReminders() {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const lastCheck = localStorage.getItem("last-notif-check");

    if (lastCheck === todayStr) return; // Already notified today

    const targetTime = localStorage.getItem("notif-time") || "12:00";
    const [targetHour, targetMin] = targetTime.split(":").map(Number);

    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    // Check if current time is past or equal to target time
    if (
      currentHour < targetHour ||
      (currentHour === targetHour && currentMin < targetMin)
    ) {
      return;
    }

    // Calculate counts
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    const today = new Date().toISOString().split("T")[0];

    const tasksTomorrow = this.state.tasks.filter(
      (t) => t.due_date === tomorrowStr && t.status !== "done",
    ).length;
    const tasksThisWeek = this.state.tasks.filter(
      (t) =>
        t.due_date >= today && t.due_date <= nextWeekStr && t.status !== "done",
    ).length;

    if (tasksThisWeek > 0 || tasksTomorrow > 0) {
      const body = `Você tem ${tasksThisWeek} tarefas nesta semana e ${tasksTomorrow} para amanhã.`;

      const options = {
        body: body,
        icon: "assets/div.ico",
        badge: "assets/div.ico",
        vibrate: [200, 100, 200],
      };

      if (this.swReg) {
        this.swReg.showNotification("Boas vindas!", options);
      } else {
        new Notification("Boas vindas!", options);
      }

      localStorage.setItem("last-notif-check", todayStr);
    }
  },
};

window.addEventListener("DOMContentLoaded", () => App.init());
window.App = App;
