import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, info: Info, error: XCircle };
const STYLES = {
  success: 'border-accent-200 bg-white text-slate-800 [&_svg.toast-icon]:text-accent-600',
  info: 'border-primary-200 bg-white text-slate-800 [&_svg.toast-icon]:text-primary-600',
  error: 'border-red-200 bg-white text-slate-800 [&_svg.toast-icon]:text-red-600',
};

/** Small toast notifications: call `notify(message, type)` from `useToast()`. */
export function ToastProvider({ children }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((x) => x.id !== id)), []);

  const notify = useCallback(
    (message, type = 'success') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 end-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <div key={toast.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-lg animate-toast ${STYLES[toast.type]}`}>
              <Icon className="toast-icon mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm">{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} className="text-slate-400 hover:text-slate-600" aria-label={t('common.close')}>
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
