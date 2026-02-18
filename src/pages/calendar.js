/**
 * Componente de Calendário - Borderless
 */

export const CalendarModule = {
  render(root, state, handlers) {
    const calendarDate = state.calendarDate || new Date();
    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();

    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarRows = [];
    let week = Array(7).fill(null);
    let currentDayPos = firstDay;

    for (let date = 1; date <= daysInMonth; date++) {
      if (currentDayPos > 6) {
        calendarRows.push(week);
        week = Array(7).fill(null);
        currentDayPos = 0;
      }
      week[currentDayPos] = date;
      currentDayPos++;
    }
    calendarRows.push(week);

    const selectedDateStr =
      state.selectedCalendarDate || new Date().toISOString().split("T")[0];
    const selectedDayTasks = state.tasks.filter(
      (t) => t.due_date === selectedDateStr,
    );
    const monthTasksCount = state.tasks.filter((t) =>
      t.due_date?.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`),
    ).length;

    root.innerHTML = `
            <div class="animate-fade-in flex flex-col calendar-font w-[98%] max-w-7xl mx-auto px-2 pb-40 md:px-8">
                <!-- Cabeçalho -->
                <header class="flex items-center pt-2 pb-8 justify-between">
                    <div class="flex flex-col">
                        <h1 class="text-text-primary text-2xl md:text-3xl font-bold tracking-tight">${monthNames[month]} ${year}</h1>
                        <p class="text-text-secondary text-sm font-medium">${monthTasksCount} tarefas programadas</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="cal-prev" class="size-11 flex items-center justify-center rounded-xl bg-surface-card hover:bg-surface-subtle transition-all shadow-sm border-none"><span class="material-symbols-outlined">chevron_left</span></button>
                        <button id="cal-next" class="size-11 flex items-center justify-center rounded-xl bg-surface-card hover:bg-surface-subtle transition-all shadow-sm border-none"><span class="material-symbols-outlined">chevron_right</span></button>
                    </div>
                </header>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <!-- Calendário Grid -->
                    <main class="lg:col-span-8">
                        <div class="bg-surface-card rounded-2xl p-6 md:p-8 shadow-card border-none">
                            <!-- Dias da Semana -->
                            <div class="grid grid-cols-7 mb-6">
                                ${dayNames.map((d) => `<p class="text-text-muted text-[10px] font-black uppercase tracking-widest text-center">${d}</p>`).join("")}
                            </div>

                            <!-- Datas -->
                            <div class="grid grid-cols-7 gap-1 md:gap-3">
                                ${calendarRows
                                  .map((row) =>
                                    row
                                      .map((d) => {
                                        if (d === null)
                                          return `<div class="h-16 md:h-24 opacity-10"></div>`;

                                        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                                        const isToday =
                                          new Date()
                                            .toISOString()
                                            .split("T")[0] === dateStr;
                                        const isSelected =
                                          selectedDateStr === dateStr;
                                        const dayTasks = state.tasks.filter(
                                          (t) => t.due_date === dateStr,
                                        );

                                        return `
                                        <button data-date="${dateStr}" class="cal-day h-16 md:h-24 flex flex-col items-center justify-start p-2 relative transition-all rounded-xl border-none ${isSelected ? "bg-action-primary/10 shadow-inner" : "hover:bg-surface-subtle"}">
                                            <span class="text-sm md:text-lg font-bold ${isToday ? "size-8 md:size-9 flex items-center justify-center bg-action-primary text-white rounded-full" : isSelected ? "text-action-primary" : "text-text-primary"}">
                                                ${d}
                                            </span>
                                            
                                            <div class="hidden md:flex flex-col gap-1 w-full mt-2 overflow-hidden">
                                                ${dayTasks
                                                  .slice(0, 2)
                                                  .map((t) => {
                                                    const sub =
                                                      state.subjects.find(
                                                        (s) =>
                                                          s.id === t.subject_id,
                                                      );
                                                    return `
                                                        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/50 border-none shadow-sm">
                                                            <div class="size-1.5 rounded-full shrink-0" style="background-color: ${sub ? sub.color : "#4285F4"}"></div>
                                                            <span class="text-[9px] font-bold text-text-secondary truncate uppercase">${t.title}</span>
                                                        </div>
                                                    `;
                                                  })
                                                  .join("")}
                                            </div>

                                            <div class="md:hidden flex gap-1 mt-auto pb-1">
                                                ${dayTasks
                                                  .slice(0, 3)
                                                  .map((t) => {
                                                    const sub =
                                                      state.subjects.find(
                                                        (s) =>
                                                          s.id === t.subject_id,
                                                      );
                                                    return `<div class="size-1 rounded-full" style="background-color: ${sub ? sub.color : "#4285F4"}"></div>`;
                                                  })
                                                  .join("")}
                                            </div>
                                        </button>
                                    `;
                                      })
                                      .join(""),
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </main>

                    <!-- Agenda Lateral (Visível em Mobile/Tablet/Desktop) -->
                    <aside class="lg:col-span-4 flex flex-col gap-6">
                        <div class="bg-surface-card rounded-2xl p-6 md:p-8 shadow-card border-none min-h-[300px] lg:h-[600px] flex flex-col">
                            <h3 class="text-xl font-bold text-text-primary mb-6 md:mb-8">
                                Agenda de ${
                                  selectedDateStr.split("-")[2]
                                }/${selectedDateStr.split("-")[1]}
                            </h3>
                            <div class="flex-1 overflow-y-auto space-y-4 ${
                              selectedDayTasks.length > 3
                                ? "pr-2 custom-scrollbar"
                                : ""
                            }">
                                ${
                                  selectedDayTasks.length
                                    ? selectedDayTasks
                                        .map((t) => {
                                          const sub = state.subjects.find(
                                            (s) => s.id === t.subject_id,
                                          );
                                          const isDone =
                                            state.completedTaskIds.includes(
                                              t.id,
                                            );
                                          return `
                                        <div class="p-5 rounded-xl bg-surface-subtle/30 hover:bg-surface-subtle transition-all border-none group cursor-pointer" onclick="document.querySelector('button[data-action=edit][data-id=${t.id}]')?.click()">
                                            <div class="flex items-center justify-between mb-2">
                                                 <div class="flex items-center gap-2">
                                                    <div class="size-2 rounded-full" style="background-color: ${sub ? sub.color : "#4285F4"}"></div>
                                                    <span class="text-[10px] font-black text-text-muted uppercase tracking-widest">${sub ? sub.name : "Geral"}</span>
                                                 </div>
                                            </div>
                                            <p class="text-sm font-bold text-text-primary ${isDone ? "line-through opacity-40" : ""}">${t.title}</p>
                                        </div>
                                    `;
                                        })
                                        .join("")
                                    : `<div class="py-10 md:py-20 text-center opacity-20 flex flex-col items-center">
                                         <span class="material-symbols-outlined text-4xl mb-2">event_available</span>
                                         <p class="text-xs font-black uppercase">Nada para este dia</p>
                                       </div>`
                                }
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;

    this.bindEvents(root, state, handlers);
  },

  bindEvents(root, state, handlers) {
    const prevBtn = document.getElementById("cal-prev");
    const nextBtn = document.getElementById("cal-next");
    if (prevBtn) prevBtn.onclick = () => handlers.onPrevMonth();
    if (nextBtn) nextBtn.onclick = () => handlers.onNextMonth();
    root.querySelectorAll(".cal-day").forEach((btn) => {
      btn.onclick = () => handlers.onSelectDate(btn.dataset.date);
    });
  },
};
