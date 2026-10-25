import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Shown when an API call fails. */
export default function ErrorState({ onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <AlertTriangle className="mb-2 h-8 w-8 text-amber-500" aria-hidden="true" />
      <p className="font-medium text-slate-700">{t('common.loadError')}</p>
      {onRetry && (
        <button type="button" className="btn-secondary mt-3" onClick={() => onRetry()}>
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
