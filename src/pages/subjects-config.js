/**
 * Componente de Matérias - Design Exato
 */

export const SubjectsConfig = {
  render(root, state, handlers) {
    const subjects = state.subjects || [];

    root.innerHTML = `
            <div class="animate-fade-in w-[98%] max-w-7xl mx-auto px-2 pb-32 md:px-8 pt-6">
                <!-- Header Actions -->
                <div class="flex items-center justify-between mb-8 px-1">
                    <h2 class="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Gerenciar Matérias</h2>
                    <button id="add-subject-btn" class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--action-primary)] text-white text-xs font-bold shadow-button-primary hover:scale-105 transition-all border-none">
                        <span class="material-symbols-outlined text-[18px]">add</span>
                        ADICIONAR MATÉRIA
                    </button>
                </div>

                <div class="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:items-start">
                    ${subjects
                      .map((subject) => {
                        const tasks = state.tasks.filter(
                          (t) => t.subject_id === subject.id,
                        );
                        return `
                        <div class="subject-container bg-[var(--surface-card)] rounded-[var(--radius-xl)] shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div class="w-full subject-border flex items-center justify-between p-6 text-left outline-none" style="--subject-color: ${subject.color};" data-subject-id="${subject.id}">
                                <div class="flex flex-col flex-1 cursor-pointer" id="subject-info-${subject.id}">
                                    <span class="text-lg font-bold text-[var(--text-primary)]">${subject.name}</span>
                                    <span class="text-xs text-[var(--text-secondary)] font-medium">${tasks.filter((t) => t.status !== "done").length} tarefas ativas</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <button class="edit-sub-btn p-2 rounded-lg hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--action-primary)] transition-all border-none" data-edit-id="${subject.id}">
                                        <span class="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button class="delete-sub-btn p-2 rounded-lg hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--status-error)] transition-all border-none" data-delete-id="${subject.id}">
                                        <span class="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                    <span class="material-symbols-outlined text-[var(--text-secondary)] transition-transform duration-300 chevron-icon cursor-pointer ml-2">expand_more</span>
                                </div>
                            </div>
                            
                            <!-- Lista de Tarefas Expandida -->
                            <div id="tasks-list-${subject.id}" class="hidden bg-[var(--surface-subtle)]/30">
                                <div class="p-2 space-y-1">
                                    ${
                                      tasks.length
                                        ? tasks
                                            .map((t) => {
                                              const isDone =
                                                t.status === "done";
                                              return `
                                            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer task-item-link" data-task-id="${t.id}">
                                                <div class="size-2 rounded-full shrink-0" style="background-color: ${subject.color}"></div>
                                                <span class="flex-1 text-sm font-bold text-[var(--text-primary)] truncate ${isDone ? "line-through opacity-50" : ""}">${t.title}</span>
                                                ${
                                                  isDone
                                                    ? '<span class="material-symbols-outlined text-[16px] text-[var(--status-success)]">check</span>'
                                                    : ""
                                                }
                                            </div>
                                        `;
                                            })
                                            .join("")
                                        : `
                                        <div class="py-6 text-center opacity-40">
                                            <span class="text-xs font-bold uppercase text-[var(--text-secondary)]">Sem tarefas</span>
                                        </div>
                                    `
                                    }
                                </div>
                            </div>
                        </div>
                    `;
                      })
                      .join("")}
                    
                    ${
                      subjects.length === 0
                        ? `
                        <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
                            <span class="material-symbols-outlined text-[var(--text-secondary)] text-6xl mb-4">folder_off</span>
                            <p class="text-[var(--text-secondary)] text-sm">Nenhuma matéria cadastrada</p>
                            <p class="text-[var(--text-muted)] text-xs mt-1">Clique no botão + para adicionar</p>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;

    this.bindEvents(root, handlers);
  },

  bindEvents(root, handlers) {
    // Botão Adicionar
    const addBtn = document.getElementById("add-subject-btn");
    if (addBtn) addBtn.onclick = () => handlers.onAddSubject();

    // Expansão do Card
    root.querySelectorAll("[data-subject-id]").forEach((container) => {
      const id = container.dataset.subjectId;
      const infoArea = document.getElementById(`subject-info-${id}`);
      const chevron = container.querySelector(".chevron-icon");
      const list = document.getElementById(`tasks-list-${id}`);

      if (infoArea) {
        infoArea.onclick = () => {
          const isHidden = list.classList.contains("hidden");
          if (isHidden) {
            list.classList.remove("hidden");
            list.classList.add("animate-fade-in");
            chevron.style.transform = "rotate(180deg)";
          } else {
            list.classList.add("hidden");
            chevron.style.transform = "rotate(0deg)";
          }
        };
      }
      if (chevron) {
        chevron.onclick = (e) => {
          e.stopPropagation();
          infoArea.onclick();
        };
      }
    });

    // Botão Editar Matéria
    root.querySelectorAll(".edit-sub-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        handlers.onEditSubject(btn.dataset.editId);
      };
    });

    // Botão Excluir Matéria
    root.querySelectorAll(".delete-sub-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        handlers.onDeleteSubject(btn.dataset.deleteId);
      };
    });

    // Clique nas tarefas da lista expandida
    root.querySelectorAll(".task-item-link").forEach((link) => {
      link.onclick = (e) => {
        e.stopPropagation();
        const taskId = link.dataset.taskId;
        handlers.onEditTask(taskId);
      };
    });
  },
};
