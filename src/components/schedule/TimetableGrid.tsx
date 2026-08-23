import React, { useState, useEffect } from 'react';
import {
  DAYS_OF_WEEK,
  TIMETABLE_DATA,
  SUBJECT_METADATA,
  isTimeInRange,
} from './scheduleData';

export const TimetableGrid: React.FC = () => {
  const currentDayIndex = (() => {
    const day = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    return day >= 1 && day <= 5 ? day - 1 : 0;
  })();

  // Re-check current active class every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:block bg-[var(--surface-card)] rounded-lg shadow-xs overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Table Header */}
          <thead>
            <tr className="bg-[var(--surface-subtle)]/50">
              <th className="py-4 px-5 text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] w-28">
                Horário
              </th>
              {DAYS_OF_WEEK.map((day, idx) => {
                const isToday = currentDayIndex === idx;
                return (
                  <th
                    key={day}
                    className={`py-4 px-4 text-xs font-black tracking-wider uppercase ${
                      isToday
                        ? 'text-[var(--action-primary)] bg-[var(--action-primary)]/5'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{day}</span>
                      {isToday && (
                        <span className="size-2 rounded-full bg-[var(--action-primary)] animate-pulse" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {TIMETABLE_DATA.map((row, rowIdx) => {
              const isActiveSlot = isTimeInRange(row.horario);

              if (row.isInterval) {
                return (
                  <tr
                    key={rowIdx}
                    className={`bg-amber-500/10 ${
                      isActiveSlot ? 'ring-2 ring-amber-500/50' : ''
                    }`}
                  >
                    <td className="py-3 px-5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      {row.horario[0]} - {row.horario[1]}
                    </td>
                    <td
                      colSpan={5}
                      className="py-3 px-4 text-xs font-black text-amber-600 dark:text-amber-400 tracking-widest text-center uppercase"
                    >
                      ☕ {row.aula} ({row.horario[0]} às {row.horario[1]})
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={rowIdx}
                  className={`hover:bg-[var(--surface-subtle)]/40 transition-colors ${
                    isActiveSlot ? 'bg-[var(--action-primary)]/5' : ''
                  }`}
                >
                  {/* Time / Period */}
                  <td className="py-3.5 px-5 text-xs font-medium text-[var(--text-muted)]">
                    <div className="font-bold text-[var(--text-primary)]">{row.aula}</div>
                    <div className="text-[11px]">
                      {row.horario[0]} - {row.horario[1]}
                    </div>
                  </td>

                  {/* Day cells */}
                  {row.dias.map((code, colIdx) => {
                    const isToday = currentDayIndex === colIdx;
                    const isLive = isToday && isActiveSlot;
                    const meta = SUBJECT_METADATA[code];

                    if (!code) {
                      return (
                        <td
                          key={colIdx}
                          className={`py-3.5 px-4 text-xs text-[var(--text-muted)] italic ${
                            isToday ? 'bg-[var(--action-primary)]/5' : ''
                          }`}
                        >
                          -
                        </td>
                      );
                    }

                    return (
                      <td
                        key={colIdx}
                        className={`py-3 px-4 ${
                          isToday ? 'bg-[var(--action-primary)]/5' : ''
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl flex flex-col gap-0.5 transition-all ${
                            isLive
                              ? 'ring-2 ring-[var(--action-primary)] shadow-md scale-105'
                              : ''
                          }`}
                          style={{
                            backgroundColor: `${meta?.color || '#888'}15`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="text-xs font-bold truncate"
                              style={{ color: meta?.color || 'var(--text-primary)' }}
                            >
                              {meta?.name || code}
                            </span>
                            {isLive && (
                              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                            )}
                          </div>
                          <span className="text-[11px] text-[var(--text-muted)] font-semibold">
                            {code}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
