/**
 * UI Components - Borderless Edition
 */

export const UI = {
  notify(message, type = "info") {
    const root = document.getElementById("notifications-root");
    if (!root) return;
    const toast = document.createElement("div");

    const colors = {
      info: "bg-surface-card text-text-primary",
      success: "bg-status-success text-white",
      error: "bg-status-error text-white",
      warning: "bg-status-warning text-white",
    };

    toast.className = `${colors[type]} ios-blur px-6 py-3 rounded-xl shadow-lg mb-4 pointer-events-auto flex items-center justify-center transform transition-all duration-300 translate-y-[-20px] opacity-0 text-sm font-bold mx-4`;
    toast.innerHTML = `<span>${message}</span>`;

    root.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-20px)";
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },

  renderTaskCard(task, subjects = [], isDoneOverride = null) {
    const subject = subjects.find((s) => s.id === task.subject_id) || null;
    const isDone =
      isDoneOverride !== null ? isDoneOverride : task.status === "done";

    const priorityData = {
      high: { color: "var(--status-error)", label: "ALTA" },
      medium: { color: "var(--status-warning)", label: "MÉDIA" },
      low: { color: "var(--status-success)", label: "BAIXA" },
    };

    const p = priorityData[task.priority] || priorityData.medium;
    const dateDisplay = task.due_date
      ? new Date(task.due_date + "T12:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        })
      : "";

    return `
            <div 
                class="task-card priority-border group flex flex-col bg-[var(--surface-card)] p-4 md:p-6 rounded-[16px] shadow-card active:scale-[0.98] transition-all stagger-item cursor-pointer overflow-hidden" 
                style="--priority-color: ${p.color};"
                data-id="${task.id}"
            >
                <!-- Principal Content (Always Visible) -->
                <div class="flex items-center w-full">
                    <!-- Checkbox Area -->
                    <div class="shrink-0 pr-4">
                        <label class="relative flex items-center justify-center size-6 cursor-pointer">
                            <input type="checkbox" class="task-checkbox appearance-none size-6 border-2 border-white/50 bg-[var(--surface-page)] rounded-full checked:bg-[var(--status-success)] checked:border-[var(--status-success)] transition-colors cursor-pointer" ${isDone ? "checked" : ""} data-id="${task.id}">
                            <span class="material-symbols-outlined absolute text-white text-[16px] pointer-events-none opacity-0 ${isDone ? "opacity-100" : ""}">check</span>
                        </label>
                    </div>

                    <!-- Title Area -->
                    <div class="flex-1 flex flex-col min-w-0 task-toggle-area">
                        <span class="text-sm font-bold text-[var(--text-primary)] truncate ${isDone ? "line-through opacity-50" : ""}">${task.title}</span>
                        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                            ${dateDisplay ? `<span class="text-[10px] font-bold text-[var(--text-muted)] shrink-0">${dateDisplay}</span>` : ""}
                            <span class="text-[10px] font-medium truncate shrink-0" style="color: ${subject ? subject.color : "var(--text-secondary)"}">${dateDisplay ? "• " : ""}${subject ? subject.name : "Pessoal"}</span>
                        </div>
                    </div>

                    <!-- Actions Area -->
                    <div class="flex items-center gap-1 pl-2">
                        <button class="action-btn p-2 text-[var(--text-secondary)] hover:text-[var(--status-error)] transition-colors border-none cursor-pointer bg-transparent" data-action="delete" data-id="${task.id}" title="Excluir">
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        <button class="action-btn p-2 text-[var(--text-secondary)] hover:text-[var(--action-primary)] transition-colors border-none cursor-pointer bg-transparent" data-action="edit" data-id="${task.id}" title="Editar">
                            <span class="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                    </div>
                </div>

                <!-- Expanded Content (Hidden by default) -->
                <div class="expand-content max-h-0 opacity-0 transition-all duration-300 pointer-events-none">
                    <div class="pt-1 border-t border-white/5">
                        <p class="text-[10px] text-[var(--text-secondary)] leading-tight whitespace-pre-line">
                            ${task.description || "Nenhuma descrição adicional."}
                        </p>
                    </div>
                </div>
            </div>
        `;
  },

  showModal(title, content, actions = "") {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/20 ios-blur opacity-0 transition-opacity duration-300";
    modal.innerHTML = `
            <div class="bg-[var(--surface-card)] rounded-[var(--radius-xl)] w-full max-w-lg mx-4 flex flex-col max-h-[90vh] transform translate-y-10 transition-transform duration-300 shadow-2xl overflow-hidden border-none text-[var(--text-primary)]">
                <div class="px-6 pt-6 pb-2 shrink-0 flex justify-between items-center bg-[var(--surface-card)] z-10">
                    <h2 class="text-xl font-bold tracking-tight">${title}</h2>
                    <button class="close-modal text-[var(--text-muted)] hover:text-[var(--text-primary)] border-none bg-transparent cursor-pointer"><span class="material-symbols-outlined">close</span></button>
                </div>

                <div class="px-6 py-4 overflow-y-auto no-scrollbar flex-1">
                    ${content}
                </div>

                ${
                  actions
                    ? `
                    <div class="px-6 pb-6 pt-2 shrink-0 flex flex-col gap-3 bg-[var(--surface-card)] z-10">
                        ${actions}
                    </div>
                `
                    : ""
                }
            </div>
        `;

    const container = document.getElementById("modal-container");
    if (container) container.appendChild(modal);

    setTimeout(() => {
      modal.style.opacity = "1";
      modal.querySelector("div").style.transform = "translateY(0)";
    }, 10);

    const close = () => {
      modal.style.opacity = "0";
      modal.querySelector("div").style.transform = "translateY(20px)";
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector(".close-modal").onclick = close;
    modal.onclick = (e) => {
      if (e.target === modal) close();
    };

    return { modal, close };
  },

  showActionSheet(title, options) {
    const sheet = document.createElement("div");
    sheet.className =
      "fixed inset-0 z-[110] flex flex-col justify-end bg-black/40 opacity-0 transition-opacity duration-300 pointer-events-auto";
    sheet.innerHTML = `
            <div class="bg-[var(--surface-card)] rounded-t-[var(--radius-2xl)] w-full max-w-lg mx-auto transform translate-y-full transition-transform duration-300 shadow-2xl overflow-hidden border-none text-[var(--text-primary)]">
                <div class="px-6 py-4 border-b border-white/5 bg-white/5">
                    <p class="text-[10px] font-black text-center text-[var(--text-secondary)] uppercase tracking-[0.2em]">${title}</p>
                </div>
                <div class="flex flex-col p-2">
                    ${options
                      .map(
                        (opt, i) => `
                        <button class="action-sheet-item flex items-center gap-4 w-full p-4 rounded-xl hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer text-left" data-index="${i}">
                            <span class="material-symbols-outlined text-[var(--action-primary)]">${opt.icon}</span>
                            <div class="flex flex-col">
                                <span class="text-sm font-bold">${opt.label}</span>
                                <span class="text-[10px] text-[var(--text-secondary)]">${opt.desc}</span>
                            </div>
                        </button>
                    `,
                      )
                      .join("")}
                    <div class="h-2"></div>
                    <button class="close-sheet w-full p-4 rounded-xl bg-white/5 text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest border-none cursor-pointer mb-2">Cancelar</button>
                </div>
            </div>
        `;

    const container = document.getElementById("modal-container");
    if (container) container.appendChild(sheet);

    setTimeout(() => {
      sheet.style.opacity = "1";
      sheet.querySelector("div").style.transform = "translateY(0)";
    }, 10);

    const close = () => {
      sheet.style.opacity = "0";
      sheet.querySelector("div").style.transform = "translateY(100%)";
      setTimeout(() => sheet.remove(), 300);
    };

    sheet.querySelectorAll(".action-sheet-item").forEach((item) => {
      item.onclick = () => {
        const index = item.dataset.index;
        options[index].onClick();
        close();
      };
    });

    sheet.querySelector(".close-sheet").onclick = close;
    sheet.onclick = (e) => {
      if (e.target === sheet) close();
    };
  },
};
