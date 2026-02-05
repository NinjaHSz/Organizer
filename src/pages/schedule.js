/**
 * Componente de Cronograma - School Schedule
 * Optimized for Premium Mobile Experience (Segmented Control)
 */

let activeDayIndex = Math.min(Math.max(new Date().getDay() - 1, 0), 4);

export const Schedule = {
  render(root, state, handlers) {
    const timetable = [
      {
        aula: "1ª AULA",
        horario: ["07:10", "07:55"],
        dias: ["ING", "FIL", "ETC", "RED", "ESP"],
      },
      {
        aula: "2ª AULA",
        horario: ["07:55", "08:40"],
        dias: ["BIO", "ED.FIS", "ING", "", "MAT"],
      },
      {
        aula: "3ª AULA",
        horario: ["08:40", "09:25"],
        dias: ["QUI", "FIS", "GRAM", "FIS", "GEO"],
      },
      {
        aula: "INTERVALO",
        horario: ["09:25", "09:45"],
        dias: ["INTERVALO", "INTERVALO", "INTERVALO", "INTERVALO", "INTERVALO"],
        isInterval: true,
      },
      {
        aula: "4ª AULA",
        horario: ["09:45", "10:30"],
        dias: ["QUI", "FIS", "GRAM", "HIST", "LIT"],
      },
      {
        aula: "5ª AULA",
        horario: ["10:30", "11:15"],
        dias: ["MAT", "SOC", "GEO", "HIST", "LIT"],
      },
      {
        aula: "6ª AULA",
        horario: ["11:15", "12:00"],
        dias: ["MAT", "MAT", "BIO", "MAT", "BIO"],
      },
      {
        aula: "7ª AULA",
        horario: ["12:00", "12:45"],
        dias: ["", "ARTE", "", "", ""],
      },
    ];

    const days = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"];

    const subjectData = {
      MAT: { name: "Matemática", color: "#4285f4" },
      BIO: { name: "Biologia", color: "#4CAF50" },
      QUI: { name: "Química", color: "#009688" },
      FIS: { name: "Física", color: "#2196F3" },
      ING: { name: "Inglês", color: "#3F51B5" },
      FIL: { name: "Filosofia", color: "#607D8B" },
      SOC: { name: "Sociologia", color: "#FF9800" },
      LIT: { name: "Literatura", color: "#E91E63" },
      GEO: { name: "Geografia", color: "#795548" },
      HIST: { name: "História", color: "#FF5722" },
      ARTE: { name: "Artes", color: "#FFC107" },
      RED: { name: "Redação", color: "#F44336" },
      GRAM: { name: "Gramática", color: "#00BCD4" },
      // Disciplinas extras não listadas no SQL
      ESP: { name: "Espanhol", color: "#FFD700" },
      "ED.FIS": { name: "Ed. Física", color: "#8BC34A" },
      ETC: { name: "Etc", color: "#9E9E9E" },
      INTERVALO: { name: "Intervalo", color: "#FFEB3B" },
    };

    const getSubjectStyle = (subject) => {
      if (!subject)
        return `background-color: transparent; border-color: transparent;`;
      const data = subjectData[subject] || { color: "#ffffff20" };
      return `background-color: ${data.color}15; color: ${data.color}; border-color: ${data.color}30;`;
    };

    const isNow = (timeRange) => {
      const now = new Date();
      const [h1, m1] = timeRange[0].split(":").map(Number);
      const [h2, m2] = timeRange[1].split(":").map(Number);
      const start = new Date().setHours(h1, m1, 0);
      const end = new Date().setHours(h2, m2, 0);
      const current = now.getTime();
      return current >= start && current <= end;
    };

    root.innerHTML = `
            <div class="animate-fade-in w-[98%] max-w-7xl mx-auto px-2 pb-32 md:px-8 pt-6">
                
                <!-- Day Selector (Mobile Only) -->
                <div class="md:hidden flex gap-2 overflow-x-auto no-scrollbar pb-6 sticky top-0 bg-[var(--surface-page)] z-20 py-2">
                    ${days
                      .map(
                        (day, i) => `
                        <button class="day-tab shrink-0 px-6 py-2.5 rounded-full text-xs font-bold transition-all border-none ${
                          activeDayIndex === i
                            ? "bg-[var(--action-primary)] text-white shadow-lg scale-105"
                            : "bg-[var(--surface-card)] text-[var(--text-secondary)]"
                        }" data-index="${i}">
                            ${day}
                        </button>
                    `,
                      )
                      .join("")}
                </div>

                <div class="bg-[var(--surface-card)] rounded-[var(--radius-xl)] shadow-card overflow-hidden border border-white/5">
                    <!-- Desktop View Table -->
                    <div class="hidden md:block overflow-x-auto no-scrollbar">
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="bg-white/5">
                                    <th class="p-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-white/5">Aula</th>
                                    <th class="p-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-white/5">Horário</th>
                                    ${days
                                      .map(
                                        (day) => `
                                        <th class="p-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-white/5">
                                            ${day}
                                        </th>
                                    `,
                                      )
                                      .join("")}
                                </tr>
                            </thead>
                            <tbody>
                                ${timetable
                                  .map(
                                    (row) => `
                                    <tr class="${row.isInterval ? "bg-[#FEF08A]/5" : "hover:bg-white/[0.02]"} transition-colors">
                                        <td class="p-4 border-b border-white/5 text-xs font-bold text-text-primary whitespace-nowrap">${
                                          row.aula
                                        }</td>
                                        <td class="p-4 border-b border-white/5 text-[10px] font-medium text-text-secondary whitespace-nowrap uppercase font-mono">${row.horario[0]}</td>
                                        ${row.dias
                                          .map(
                                            (subject) => `
                                            <td class="p-4 border-b border-white/5 text-center">
                                                <div class="inline-flex px-3 py-1.5 rounded-lg border text-[11px] font-bold" style="${getSubjectStyle(subject)}">
                                                    ${subject || "—"}
                                                </div>
                                            </td>
                                        `,
                                          )
                                          .join("")}
                                    </tr>
                                `,
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>

                    <!-- Mobile View (Timeline) -->
                    <div class="md:hidden">
                        <div class="flex flex-col">
                            ${timetable
                              .map((row) => {
                                const subject = row.dias[activeDayIndex];
                                const active = isNow(row.horario);
                                const style = getSubjectStyle(subject);

                                return `
                                <div class="relative flex gap-3 p-3 ${
                                  active ? "bg-[var(--action-primary)]/5" : ""
                                }">
                                    ${
                                      active
                                        ? '<div class="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--action-primary)]"></div>'
                                        : ""
                                    }
                                    
                                    <!-- Time Column -->
                                    <div class="flex flex-col items-center justify-center w-12 shrink-0">
                                        <span class="text-[11px] font-black text-text-primary ${
                                          active
                                            ? "text-[var(--action-primary)]"
                                            : ""
                                        }">${row.horario[0]}</span>
                                    </div>

                                    <!-- Content Card -->
                                    <div class="flex-1">
                                        <div class="flex flex-col gap-0.5 p-2.5 rounded-lg border shadow-sm backdrop-blur-sm" style="${style}">
                                            <div class="flex justify-between items-center">
                                                <span class="text-[8px] font-black uppercase tracking-tight opacity-70">${
                                                  row.aula
                                                }</span>
                                                ${
                                                  active
                                                    ? '<span class="flex items-center gap-1 text-[7px] font-black animate-pulse bg-current h-1.5 w-1.5 rounded-full"></span>'
                                                    : ""
                                                }
                                            </div>
                                            <h3 class="text-sm font-bold tracking-tight leading-tight">${
                                              subject || "—"
                                            }</h3>
                                        </div>
                                    </div>
                                </div>
                            `;
                              })
                              .join("")}
                        </div>
                    </div>
                </div>

            </div>
        `;

    this.bindEvents(root, state, handlers);
  },

  bindEvents(root, state, handlers) {
    root.querySelectorAll(".day-tab").forEach((btn) => {
      btn.onclick = () => {
        activeDayIndex = parseInt(btn.dataset.index);
        this.render(root, state, handlers);
        // Scroll back to top if needed
        root.scrollTo({ top: 0, behavior: "smooth" });
      };
    });
  },
};
