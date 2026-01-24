/**
 * Componente de Matérias - Design Exato
 */

export const SubjectsConfig = {
  render(root, state, handlers) {
    const subjects = state.subjects || [];

    root.innerHTML = `
            <div class="animate-fade-in w-[98%] max-w-7xl mx-auto px-2 pb-32 md:px-8 pt-6">
                <div class="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                    ${subjects
                      .map(
                        (subject) => `
                        <div class="subject-border flex items-center justify-between bg-[var(--surface-card)] p-6 rounded-[var(--radius-xl)] shadow-card active:scale-[0.98] transition-transform" style="--subject-color: ${subject.color};">
                            <div class="flex flex-col">
                                <span class="text-lg font-bold text-[var(--text-primary)]">${subject.name}</span>
                                <span class="text-xs text-[var(--text-secondary)] font-medium">${state.tasks.filter((t) => t.subject_id === subject.id && t.status !== "done").length} tarefas ativas</span>
                            </div>
                            <span class="material-symbols-outlined text-white/20">chevron_right</span>
                        </div>
                    `,
                      )
                      .join("")}
                    
                    ${
                      subjects.length === 0
                        ? `
                        <div class="flex flex-col items-center justify-center py-16 text-center">
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
    root.querySelectorAll("[data-subject-id]").forEach((elem) => {
      elem.onclick = () => {
        const id = elem.dataset.subjectId;
        // handlers.onEditSubject(id);
      };
    });
  },
};
