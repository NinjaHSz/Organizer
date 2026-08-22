import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  color?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção',
  className = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-2 text-xs rounded-xl'
      : 'px-4 py-2.5 sm:py-3 text-sm rounded-xl';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 bg-[var(--surface-subtle)] text-[var(--text-primary)] font-medium outline-none border border-[var(--border-subtle)] hover:border-[var(--action-primary)]/40 focus:border-[var(--action-primary)] transition-all cursor-pointer shadow-xs select-none ${sizeClasses} ${
          isOpen ? 'ring-2 ring-[var(--action-primary)]/20 border-[var(--action-primary)]' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1 text-left">
          {selectedOption ? (
            <>
              {selectedOption.color && (
                <span
                  className="size-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: selectedOption.color }}
                />
              )}
              {selectedOption.icon && (
                <selectedOption.icon size={15} className="shrink-0 text-[var(--action-primary)]" />
              )}
              <span className="truncate text-[var(--text-primary)] font-semibold">
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span className="text-[var(--text-muted)] font-normal truncate">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          size={15}
          className={`shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--action-primary)]' : ''
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[var(--surface-card)]/95 ios-blur border border-[var(--border-subtle)] rounded-xl shadow-xl p-1 max-h-60 overflow-y-auto no-scrollbar animate-scale-in">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const Icon = opt.icon;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left select-none ${
                  isSelected
                    ? 'bg-[var(--action-primary)]/10 text-[var(--action-primary)] font-bold'
                    : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate flex-1">
                  {opt.color && (
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  {Icon && <Icon size={14} className="shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </div>

                {isSelected && (
                  <Check size={14} className="shrink-0 text-[var(--action-primary)] stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
