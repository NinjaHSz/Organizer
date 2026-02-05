export const MobileNav = {
  render(rootElement, activeTab = "tasks") {
    if (!rootElement) return;

    // Se a navbar já existe, apenas atualiza os estados ativos
    if (rootElement.querySelector(".mobile-nav-container")) {
      this.updateActiveState(rootElement, activeTab);
      return;
    }

    rootElement.innerHTML = `
      <div class="mobile-nav-container lg:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none fade-in-up">
        <div class="pointer-events-auto bg-[var(--surface-card)] rounded-full shadow-2xl flex items-center p-2 pl-6 pr-2 gap-2 border border-white/5 backdrop-blur-xl">
          
          <!-- Navigation Icons -->
          <div class="flex items-center gap-6 mr-4">
            ${this.renderNavItem("tasks", "dashboard", activeTab)}
            ${this.renderNavItem("calendar", "calendar_today", activeTab)}
            ${this.renderNavItem("schedule", "schedule", activeTab)}
            ${this.renderNavItem("subjects-config", "book", activeTab)}
            ${this.renderNavItem("settings", "settings", activeTab)}
          </div>

          <!-- Vertical Separator -->
          <div class="h-8 w-[1px] bg-white/10"></div>

          <!-- FAB (Integrated) -->
          <button
            id="mobile-fab-btn"
            class="flex items-center justify-center size-12 rounded-full bg-[var(--action-primary)] text-white shadow-lg active:scale-90 transition-transform ml-1"
          >
            <span class="material-symbols-outlined text-[28px]">add</span>
          </button>

        </div>
      </div>
    `;

    this.bindEvents(rootElement);
  },

  renderNavItem(tabName, icon, activeTab) {
    const isActive = tabName === activeTab;
    const activeClass = isActive
      ? "text-[var(--action-primary)] active"
      : "text-[var(--text-secondary)]";
    const opacityClass = isActive ? "opacity-100" : "opacity-0";

    return `
      <button 
        data-nav="${tabName}" 
        class="nav-btn group relative flex flex-col items-center justify-center ${activeClass} hover:text-[var(--action-primary)] transition-colors"
      >
        <span class="material-symbols-outlined text-[24px]" style="${isActive && tabName === "tasks" ? 'font-variation-settings: "FILL" 1' : ""}">${icon}</span>
        <span class="absolute -bottom-2 w-1 h-1 rounded-full bg-[var(--action-primary)] ${opacityClass} group-[.active]:opacity-100 transition-opacity"></span>
      </button>
    `;
  },

  updateActiveState(rootElement, activeTab) {
    const buttons = rootElement.querySelectorAll(".nav-btn");
    buttons.forEach((btn) => {
      const tab = btn.dataset.nav;
      const isActive = tab === activeTab;
      const indicator = btn.querySelector("span.absolute");
      const icon = btn.querySelector(".material-symbols-outlined");

      if (isActive) {
        btn.classList.add("text-[var(--action-primary)]", "active");
        btn.classList.remove("text-[var(--text-secondary)]");
        indicator.classList.remove("opacity-0");
        indicator.classList.add("opacity-100");
        if (tab === "tasks") icon.style.fontVariationSettings = '"FILL" 1';
      } else {
        btn.classList.remove("text-[var(--action-primary)]", "active");
        btn.classList.add("text-[var(--text-secondary)]");
        indicator.classList.add("opacity-0");
        indicator.classList.remove("opacity-100");
        if (tab === "tasks") icon.style.fontVariationSettings = '"FILL" 0';
      }
    });
  },

  bindEvents(rootElement) {
    // Navigation Clicks
    rootElement.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.onclick = () => {
        const tab = btn.dataset.nav;
        window.location.hash = tab === "tasks" ? "" : tab;
      };
    });

    // FAB Click
    const fabBtn = rootElement.querySelector("#mobile-fab-btn");
    if (fabBtn) {
      fabBtn.onclick = () => {
        document.dispatchEvent(new CustomEvent("open-new-task-modal"));
      };
    }
  },
};
