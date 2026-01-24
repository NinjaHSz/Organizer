/**
 * Componente de Matérias - Borderless
 */

export const Subjects = {
  renderConfig(root, state, handlers) {
    root.innerHTML = `
            <div class="animate-fade-in flex flex-col w-full pb-32">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div class="flex flex-col gap-1">
                        <p class="text-[10px] font-bold text-action-primary uppercase tracking-[0.3em]">Gestão de Categorias</p>
                        <h1 class="text-3xl font-bold text-text-primary tracking-tighter">Matérias</h1>
                    </div>
                    <button id="add-sub-btn" class="h-14 px-8 bg-action-primary text-white rounded-xl font-bold active:scale-95 transition-all shadow-button-primary border-none flex items-center gap-3">
                        <span class="material-symbols-outlined font-bold">add</span>
                        NOVA MATÉRIA
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${
                      state.subjects.length
                        ? state.subjects
                            .map((s) => {
                              const tasks = state.tasks.filter(
                                (t) => t.subject_id === s.id,
                              );
                              const pending = tasks.filter(
                                (t) => t.status !== "done",
                              ).length;
                              const completion =
                                tasks.length > 0
                                  ? Math.round(
                                      (tasks.filter((t) => t.status === "done")
                                        .length /
                                        tasks.length) *
                                        100,
                                    )
                                  : 0;

                              return `
                            <div class="flex flex-col bg-surface-card rounded-2xl p-8 shadow-card group transition-all hover:shadow-lg border-none relative overflow-hidden">
                                <!-- Barra de Cor Superior - Shadow em vez de Border -->
                                <div class="absolute top-0 left-0 right-0 h-1.5" style="background-color: ${s.color}"></div>
                                
                                <div class="flex items-center justify-between mb-8">
                                    <div class="flex items-center gap-3">
                                        <h4 class="text-xl font-bold text-text-primary tracking-tight">${s.name}</h4>
                                    </div>
                                    <div class="flex gap-1">
                                        <button class="edit-sub p-2 text-text-muted hover:text-action-primary transition-all border-none" data-id="${s.id}">
                                            <span class="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button class="delete-sub p-2 text-text-muted hover:text-status-error transition-all border-none" data-id="${s.id}">
                                            <span class="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div class="flex flex-col gap-3 mb-8 min-h-[100px]">
                                    <p class="text-[9px] font-bold text-text-muted uppercase tracking-widest">Pendências (${pending})</p>
                                    ${tasks
                                      .filter((t) => t.status !== "done")
                                      .slice(0, 3)
                                      .map(
                                        (t) => `
                                        <div class="flex items-center gap-2">
                                            <div class="size-1.5 rounded-full" style="background-color: ${s.color}40"></div>
                                            <span class="text-xs font-medium text-text-secondary truncate">${t.title}</span>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                    ${tasks.length === 0 ? `<p class="text-xs text-text-muted italic opacity-50">Nenhuma tarefa.</p>` : ""}
                                </div>
                                
                                ${
                                  tasks.length > 0
                                    ? `
                                    <div class="mt-auto pt-6 bg-surface-subtle/10 -mx-8 -mb-8 p-8">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-[9px] font-bold text-text-muted uppercase tracking-widest">Progresso</span>
                                            <span class="text-[10px] font-bold text-text-primary">${completion}%</span>
                                        </div>
                                        <div class="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden">
                                            <div class="h-full bg-action-primary rounded-full transition-all duration-1000" style="width: ${completion}%"></div>
                                        </div>
                                    </div>
                                `
                                    : ""
                                }
                            </div>
                        `;
                            })
                            .join("")
                        : `
                        <div class="col-span-full py-20 text-center bg-surface-subtle/10 rounded-2xl border-none">
                            <span class="material-symbols-outlined text-4xl text-text-muted/20 mb-4">category</span>
                            <p class="text-text-muted font-bold text-sm uppercase">Nenhuma matéria criada</p>
                        </div>
                    `
                    }
                </div>
            </div>
        `;

    this.bindConfigEvents(root, handlers);
  },

  bindConfigEvents(root, handlers) {
    const addBtn = document.getElementById("add-sub-btn");
    if (addBtn) addBtn.onclick = () => handlers.onAddSubject();
    root.querySelectorAll(".edit-sub").forEach((btn) => {
      btn.onclick = () => handlers.onEditSubject(btn.dataset.id);
    });
    root.querySelectorAll(".delete-sub").forEach((btn) => {
      btn.onclick = () => handlers.onDeleteSubject(btn.dataset.id);
    });
  },
};
