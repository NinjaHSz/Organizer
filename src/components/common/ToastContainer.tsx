import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-0 right-0 z-50 flex flex-col items-center pointer-events-none px-4 space-y-2">
      {toasts.map((toast) => {
        const getStyle = () => {
          switch (toast.type) {
            case 'success':
              return {
                bg: 'bg-emerald-600 text-white',
                icon: <CheckCircle2 size={18} className="shrink-0" />,
              };
            case 'error':
              return {
                bg: 'bg-rose-600 text-white',
                icon: <AlertCircle size={18} className="shrink-0" />,
              };
            case 'warning':
              return {
                bg: 'bg-amber-500 text-white',
                icon: <AlertTriangle size={18} className="shrink-0" />,
              };
            default:
              return {
                bg: 'bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--border-subtle)]',
                icon: <Info size={18} className="text-[var(--action-primary)] shrink-0" />,
              };
          }
        };

        const { bg, icon } = getStyle();

        return (
          <div
            key={toast.id}
            className={`${bg} pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl max-w-md w-full animate-slide-up ios-blur`}
          >
            {icon}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
