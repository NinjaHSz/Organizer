import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CalendarGrid: React.FC = () => {
  const {
    calendarDate,
    setCalendarDate,
    selectedCalendarDate,
    setSelectedCalendarDate,
    tasks,
    completedTaskIds,
  } = useApp();

  const month = calendarDate.getMonth();
  const year = calendarDate.getFullYear();

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    const d = new Date(calendarDate);
    d.setMonth(d.getMonth() - 1);
    setCalendarDate(d);
  };

  const nextMonth = () => {
    const d = new Date(calendarDate);
    d.setMonth(d.getMonth() + 1);
    setCalendarDate(d);
  };

  // Build grid weeks
  const calendarRows: (number | null)[][] = [];
  let week: (number | null)[] = Array(7).fill(null);
  let currentPos = firstDayIndex;

  for (let day = 1; day <= daysInMonth; day++) {
    if (currentPos > 6) {
      calendarRows.push(week);
      week = Array(7).fill(null);
      currentPos = 0;
    }
    week[currentPos] = day;
    currentPos++;
  }
  calendarRows.push(week);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[var(--surface-card)] rounded-lg p-5 sm:p-7 shadow-xs">
      {/* Month & Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {monthNames[month]} {year}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Selecione um dia para ver ou programar tarefas
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[var(--surface-subtle)] rounded-lg p-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors"
            title="Mês Anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors"
            title="Próximo Mês"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 mb-3 text-center">
        {dayNames.map((name) => (
          <span
            key={name}
            className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] py-2"
          >
            {name}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarRows.map((row, rowIdx) =>
          row.map((dayNum, colIdx) => {
            if (dayNum === null) {
              return <div key={`${rowIdx}-${colIdx}`} className="h-14 sm:h-20 opacity-0" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedCalendarDate;

            const dayTasks = tasks.filter((t) => t.due_date === dateStr);
            const pendingTasks = dayTasks.filter((t) => !completedTaskIds.includes(t.id));
            const doneTasks = dayTasks.filter((t) => completedTaskIds.includes(t.id));

            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => setSelectedCalendarDate(dateStr)}
                className={`h-14 sm:h-20 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-between transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-[var(--action-primary)] ${
                  isSelected
                    ? 'bg-[var(--action-primary)]/10 shadow-md ring-2 ring-[var(--action-primary)]/40'
                    : 'hover:bg-[var(--surface-subtle)]/70'
                }`}
              >
                {/* Day number */}
                <span
                  className={`size-7 sm:size-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                    isToday
                      ? 'bg-[var(--action-primary)] text-white shadow-sm font-black'
                      : isSelected
                      ? 'text-[var(--action-primary)] font-black'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Task Indicators */}
                {dayTasks.length > 0 && (
                  <div className="flex items-center gap-1 mb-1">
                    {pendingTasks.length > 0 && (
                      <span className="size-1.5 sm:size-2 rounded-full bg-[var(--action-primary)]" />
                    )}
                    {doneTasks.length > 0 && (
                      <span className="size-1.5 sm:size-2 rounded-full bg-emerald-500" />
                    )}
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] hidden sm:inline">
                      {dayTasks.length}
                    </span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
