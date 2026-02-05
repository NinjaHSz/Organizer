import { UI } from "../components/ui.js";
import { getFilteredTasks } from "../core/utils.js";

export const Dashboard = {
  render(root, state, handlers) {
    const filteredTasks = getFilteredTasks(state);
    const pendingCount = state.tasks.filter((t) => t.status !== "done").length;
    const doneCount = state.tasks.length - pendingCount;

    root.innerHTML = `
            <div class="animate-fade-in flex flex-col w-[98%] max-w-7xl mx-auto px-2 pb-32 md:px-8">
                <!-- Estatísticas Compactas -->
                <div class="flex gap-4 py-6 md:grid md:grid-cols-3 md:gap-6">
                    <div class="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl p-3 bg-[var(--surface-card)] shadow-card">
                        <p class="text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-wider text-center">Total</p>
                        <p class="text-xl font-bold text-[var(--text-primary)]">${state.tasks.length}</p>
                    </div>
                    <div class="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl p-3 bg-[var(--surface-card)] shadow-card">
                        <p class="text-[var(--action-primary)] text-[8px] font-bold uppercase tracking-wider text-center">Pendentes</p>
                        <p class="text-xl font-bold text-[var(--action-primary)]">${pendingCount}</p>
                    </div>
                    <div class="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl p-3 bg-[var(--surface-card)] shadow-card">
                        <p class="text-[var(--status-success)] text-[8px] font-bold uppercase tracking-wider text-center">Concluídas</p>
                        <p class="text-xl font-bold text-[var(--status-success)]">${doneCount}</p>
                    </div>
                </div>

                <!-- Filtros de Categoria -->
                <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2 mt-6">
                    <button 
                        data-filter="all" 
                        class="filter-chip shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border-none ${state.filters.category === "all" ? "bg-action-primary text-white" : "bg-surface-card text-text-secondary"}"
                    >
                        <span class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">check_circle</span>
                            Todos
                        </span>
                    </button>
                    <button 
                        data-filter="upcoming" 
                        class="filter-chip shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border-none ${state.filters.category === "upcoming" ? "bg-action-primary text-white" : "bg-surface-card text-text-secondary"}"
                    >
                        <span class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">schedule</span>
                            Próximos
                        </span>
                    </button>
                    <button 
                        data-filter="done" 
                        class="filter-chip shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border-none ${state.filters.category === "done" ? "bg-action-primary text-white" : "bg-surface-card text-text-secondary"}"
                    >
                        <span class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">task_alt</span>
                            Concluídos
                        </span>
                    </button>
                    <button 
                        data-filter="overdue" 
                        class="filter-chip shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all border-none ${state.filters.category === "overdue" ? "bg-action-primary text-white" : "bg-surface-card text-text-secondary"}"
                    >
                        <span class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">warning</span>
                            Atrasados
                        </span>
                    </button>
                </div>

                <!-- Seção de Tarefas (Largura Total) -->
                <section class="mt-8">
                    <div class="flex items-center justify-between px-1 mb-6">
                        <div class="flex flex-col">
                            <h2 class="text-xl font-bold text-text-primary">
                                ${
                                  {
                                    all: "Todas as Tarefas",
                                    upcoming: "Próximas Tarefas",
                                    done: "Tarefas Concluídas",
                                    overdue: "Tarefas Atrasadas",
                                  }[state.filters.category] || "Tarefas"
                                }
                            </h2>
                        </div>
                    </div>

                    <div id="tasks-display-area" class="min-h-[300px]">
                        ${
                          state.filters.viewMode === "list"
                            ? `
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${
                                  filteredTasks.length
                                    ? filteredTasks
                                        .map((t) =>
                                          UI.renderTaskCard(t, state.subjects),
                                        )
                                        .join("")
                                    : `
                                    <div class="col-span-full py-20 flex flex-col items-center justify-center opacity-30 text-center">
                                        <span class="material-symbols-outlined text-5xl mb-3">task_alt</span>
                                        <p class="text-sm font-bold">Você está em dia com tudo!</p>
                                    </div>
                                `
                                }
                            </div>
                            `
                            : this.renderKanbanHTML(filteredTasks)
                        }
                    </div>
                </section>
            </div>
        `;

    this.bindEvents(root, state, handlers);
  },

  renderKanbanHTML(filteredTasks) {
    const columns = [
      { id: "todo", title: "Para Fazer", icon: "assignment" },
      { id: "in_progress", title: "Andamento", icon: "sync" },
      { id: "done", title: "Concluído", icon: "verified" },
    ];

    return `
            <div class="flex gap-6 overflow-x-auto no-scrollbar pb-8">
                ${columns
                  .map((col) => {
                    const colTasks = filteredTasks.filter(
                      (t) =>
                        t.status === col.id || (col.id === "todo" && !t.status),
                    );
                    return `
                        <div class="flex-none w-[300px] flex flex-col gap-4">
                            <div class="flex items-center justify-between px-2">
                                <div class="flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px] text-text-muted">${col.icon}</span>
                                    <h3 class="text-[10px] font-bold uppercase tracking-widest text-text-secondary">${col.title}</h3>
                                </div>
                                <span class="text-[10px] font-bold bg-surface-subtle px-2.5 py-1 rounded-lg text-text-muted">${colTasks.length}</span>
                            </div>
                            <div class="kanban-column flex flex-col gap-4 min-h-[450px]" data-status="${col.id}">
                                ${colTasks.map((t) => `<div class="kanban-item cursor-grab border-none active:cursor-grabbing" draggable="true" data-id="${t.id}">${UI.renderTaskCard(t, [])}</div>`).join("")}
                            </div>
                        </div>
                    `;
                  })
                  .join("")}
            </div>
        `;
  },

  bindEvents(root, state, handlers) {
    const listBtn = document.getElementById("view-list-btn");
    const kanbanBtn = document.getElementById("view-kanban-btn");

    if (listBtn) listBtn.onclick = () => handlers.onChangeViewMode("list");
    if (kanbanBtn)
      kanbanBtn.onclick = () => handlers.onChangeViewMode("kanban");

    // Filter chips
    root.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.onclick = () => {
        const filter = chip.dataset.filter;
        handlers.onChangeFilter("category", filter);
      };
    });

    root.querySelectorAll(".task-card").forEach((card) => {
      const id = card.dataset.id;
      const toggleArea = card.querySelector(".task-toggle-area");
      const expandContent = card.querySelector(".expand-content");

      if (toggleArea && expandContent) {
        toggleArea.onclick = (e) => {
          e.stopPropagation();
          const isExpanded = expandContent.classList.contains("max-h-96");

          // Fecha outros cards se necessário (opcional - UX preference)
          // root.querySelectorAll('.expand-content').forEach(el => {
          //     el.classList.remove('max-h-96', 'opacity-100', 'mt-4');
          //     el.classList.add('max-h-0', 'opacity-0');
          // });

          if (isExpanded) {
            expandContent.classList.remove("max-h-96", "opacity-100");
            expandContent.classList.add(
              "max-h-0",
              "opacity-0",
              "pointer-events-none",
            );
          } else {
            expandContent.classList.remove(
              "max-h-0",
              "opacity-0",
              "pointer-events-none",
            );
            expandContent.classList.add("max-h-96", "opacity-100");
          }
        };
      }

      card.onclick = (e) => {
        const btn = e.target.closest("button");
        if (btn) {
          const action = btn.dataset.action;
          if (action === "edit") {
            e.stopPropagation();
            handlers.onEditTask(id);
            return;
          }
          if (action === "delete") {
            e.stopPropagation();
            handlers.onDeleteTask(id);
            return;
          }
        }
        if (
          e.target.classList.contains("task-checkbox") ||
          e.target.closest("label")?.querySelector(".task-checkbox")
        ) {
          const checkbox = e.target.classList.contains("task-checkbox")
            ? e.target
            : e.target.closest("label").querySelector(".task-checkbox");
          handlers.onToggleTask(id, checkbox.checked);
          return;
        }
      };
    });
  },
};
