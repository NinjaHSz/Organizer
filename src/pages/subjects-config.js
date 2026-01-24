/**
 * Componente de Matérias - Design Exato
 */

export const SubjectsConfig = {
  render(root, state, handlers) {
    const subjects = state.subjects || [];

    root.innerHTML = `
            <div class="animate-fade-in w-[98%] max-w-7xl mx-auto px-2 pb-32 md:px-8 pt-6">
                <div class="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:items-start">
                    ${subjects
                      .map((subject) => {
                        const tasks = state.tasks.filter(
                          (t) => t.subject_id === subject.id,
                        );
                        return `
                        <div class="subject-container bg-[var(--surface-card)] rounded-[var(--radius-xl)] shadow-card overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <button class="w-full subject-border flex items-center justify-between p-6 text-left outline-none" style="--subject-color: ${subject.color};" data-subject-id="${subject.id}">
                                <div class="flex flex-col">
                                    <span class="text-lg font-bold text-[var(--text-primary)]">${subject.name}</span>
                                    <span class="text-xs text-[var(--text-secondary)] font-medium">${tasks.filter((t) => t.status !== "done").length} tarefas ativas</span>
                                </div>
                                <span class="material-symbols-outlined text-[var(--text-secondary)] transition-transform duration-300 chevron-icon">expand_more</span>
                            </button>
                            
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
                                            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer" onclick="document.querySelector('button[data-action=edit][data-id=${t.id}]')?.click()">
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
    root.querySelectorAll("[data-subject-id]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.dataset.subjectId;
        const list = document.getElementById(`tasks-list-${id}`);
        const chevron = btn.querySelector(".chevron-icon");

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
    });
  },
};
