import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

const MONTH_NAMES = [
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

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecione a data',
  className = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view month/year based on value or today
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, 1);
      }
    }
    return new Date();
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format display value
  const getFormattedDisplay = () => {
    if (!value) return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3) return value;

    const d = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const rawWeekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const cleanWeekday =
      rawWeekday.replace('.', '').charAt(0).toUpperCase() +
      rawWeekday.replace('.', '').slice(1);
    const dayMonthYear = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `${cleanWeekday}, ${dayMonthYear}`;
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Calendar Grid Calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(
      d
    ).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(
      2,
      '0'
    )}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Next month leading days (fill up to 35 or 42 grid cells)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(
      d
    ).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Quick shortcut selection
  const selectQuickDate = (daysAhead: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const dateStr = target.toISOString().split('T')[0];
    onChange(dateStr);
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    setIsOpen(false);
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-2 text-xs rounded-xl'
      : 'px-4 py-2.5 sm:py-3 text-sm rounded-xl';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 bg-[var(--surface-subtle)] text-[var(--text-primary)] font-medium outline-none border border-[var(--border-subtle)] hover:border-[var(--action-primary)]/40 focus:border-[var(--action-primary)] transition-all cursor-pointer shadow-xs select-none ${sizeClasses} ${
          isOpen ? 'ring-2 ring-[var(--action-primary)]/20 border-[var(--action-primary)]' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 truncate flex-1">
          <Calendar
            size={size === 'sm' ? 14 : 16}
            className={`shrink-0 ${
              value ? 'text-[var(--action-primary)]' : 'text-[var(--text-muted)]'
            }`}
          />
          {value ? (
            <span className="truncate font-semibold text-[var(--text-primary)]">
              {getFormattedDisplay()}
            </span>
          ) : (
            <span className="text-[var(--text-muted)] font-normal truncate">
              {placeholder}
            </span>
          )}
        </div>

        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Limpar data"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      {/* Floating Interactive Date Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-[var(--surface-card)]/95 ios-blur border border-[var(--border-subtle)] rounded-xl shadow-2xl p-3.5 w-72 sm:w-80 animate-scale-in">
          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-[var(--separator)] overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => selectQuickDate(0)}
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--action-primary)]/10 hover:text-[var(--action-primary)] text-[11px] font-bold text-[var(--text-secondary)] transition-all shrink-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => selectQuickDate(1)}
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--action-primary)]/10 hover:text-[var(--action-primary)] text-[11px] font-bold text-[var(--text-secondary)] transition-all shrink-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
            >
              Amanhã
            </button>
            <button
              type="button"
              onClick={() => selectQuickDate(7)}
              className="px-2.5 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--action-primary)]/10 hover:text-[var(--action-primary)] text-[11px] font-bold text-[var(--text-secondary)] transition-all shrink-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
            >
              +7 Dias
            </button>
          </div>

          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[var(--text-primary)]">
              {MONTH_NAMES[month]} {year}
            </h4>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                title="Mês Anterior"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
                title="Próximo Mês"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEK_DAYS.map((w, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold uppercase text-[var(--text-muted)] py-0.5"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              const isSelected = d.dateStr === value;
              const isToday = d.dateStr === todayStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(d.dateStr);
                    setIsOpen(false);
                  }}
                  className={`size-8.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[var(--action-primary)] text-white font-black shadow-sm shadow-[var(--action-primary)]/30'
                      : isToday
                      ? 'bg-[var(--action-primary)]/15 text-[var(--action-primary)] font-bold'
                      : d.isCurrentMonth
                      ? 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                      : 'text-[var(--text-muted)] opacity-35 hover:bg-[var(--surface-subtle)]'
                  }`}
                >
                  <span>{d.dayNum}</span>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 size-1 rounded-full bg-[var(--action-primary)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
