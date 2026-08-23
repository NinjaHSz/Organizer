import React, { useState } from 'react';
import { Clock, Coffee } from 'lucide-react';
import {
  DAYS_OF_WEEK,
  TIMETABLE_DATA,
  SUBJECT_METADATA,
  isTimeInRange,
} from './scheduleData';

export const DayScheduleCard: React.FC = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    const day = new Date().getDay();
    return day >= 1 && day <= 5 ? day - 1 : 0;
  });

  const dayAbbreviations = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
  const todayDayIndex = new Date().getDay() >= 1 && new Date().getDay() <= 5 ? new Date().getDay() - 1 : null;

  return (
    <div className="md:hidden space-y-3">
      {/* Day Selector Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 pb-2.5 sticky top-0 bg-[var(--surface-page)]/95 ios-blur z-20 -mx-4 px-4 sm:mx-0 sm:px-0">
        {dayAbbreviations.map((abbr, idx) => {
          const isSelected = selectedDayIndex === idx;
          const isToday = todayDayIndex === idx;

          return (
            <button
              key={abbr}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 text-center relative cursor-pointer ${
                isSelected
                  ? 'bg-[var(--action-primary)] text-white shadow-md shadow-[var(--action-primary)]/20'
                  : 'bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div>{abbr}</div>
              {isToday && (
                <div
                  className={`text-[9px] font-black uppercase ${
                    isSelected ? 'text-white/80' : 'text-[var(--action-primary)]'
                  }`}
                >
                  Hoje
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Name */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          Aulas de {DAYS_OF_WEEK[selectedDayIndex]}
        </h3>
        {todayDayIndex === selectedDayIndex && (
          <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Hoje
          </span>
        )}
      </div>

      {/* Class Timeline */}
      <div className="space-y-2.5">
        {TIMETABLE_DATA.map((row, idx) => {
          const subjectCode = row.dias[selectedDayIndex];
          const isActive = todayDayIndex === selectedDayIndex && isTimeInRange(row.horario);
          const meta = SUBJECT_METADATA[subjectCode];

          if (row.isInterval) {
            return (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-amber-500/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Coffee size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      {row.aula}
                    </h4>
                    <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
                      {row.horario[0]} às {row.horario[1]}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-white uppercase tracking-wider animate-pulse">
                    Agora
                  </span>
                )}
              </div>
            );
          }

          if (!subjectCode) return null;

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg bg-[var(--surface-card)] transition-all ${
                isActive
                  ? 'ring-2 ring-[var(--action-primary)]/40 shadow-md shadow-[var(--action-primary)]/10 scale-[1.01]'
                  : 'shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Subject Color Pill */}
                  <div
                    className="size-10 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-inner"
                    style={{
                      backgroundColor: `${meta?.color || '#4285F4'}20`,
                      color: meta?.color || '#4285F4',
                    }}
                  >
                    {subjectCode}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        {row.aula}
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-black px-2 py-0.2 rounded-full bg-emerald-500 text-white uppercase animate-pulse">
                          Ao Vivo
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] truncate mt-0.5">
                      {meta?.name || subjectCode}
                    </h4>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] shrink-0 pl-2">
                  <Clock size={13} className="text-[var(--text-muted)]" />
                  <span>
                    {row.horario[0]} - {row.horario[1]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
