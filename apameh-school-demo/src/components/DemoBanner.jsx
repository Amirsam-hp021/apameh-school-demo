import { FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Thin strip shown on every page so nobody mistakes the demo for production. */
export default function DemoBanner() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-2 bg-accent-700 px-4 py-1.5 text-center text-xs font-medium text-white">
      <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{t('demo.banner')}</span>
    </div>
  );
}
