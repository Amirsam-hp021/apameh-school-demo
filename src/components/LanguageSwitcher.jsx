import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, useLanguage } from '../context/LanguageContext';

/** English / فارسی toggle. `variant="dark"` is for dark backgrounds. */
export default function LanguageSwitcher({ variant = 'light' }) {
  const { t } = useTranslation();
  const { lang, setLanguage } = useLanguage();
  const dark = variant === 'dark';

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={`inline-flex items-center gap-1 rounded-lg p-1 ${dark ? 'bg-white/10' : 'bg-slate-100'}`}
    >
      <Languages className={`mx-1 hidden h-4 w-4 sm:block ${dark ? 'text-white/70' : 'text-slate-400'}`} aria-hidden="true" />
      {LANGUAGES.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            aria-pressed={active}
            onClick={() => setLanguage(l.code)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              active
                ? dark
                  ? 'bg-white text-primary-900'
                  : 'bg-white text-primary-800 shadow-sm'
                : dark
                  ? 'text-white/80 hover:text-white'
                  : 'text-slate-500 hover:text-slate-800'
            }`}
            style={l.code === 'fa' ? { fontFamily: 'Vazirmatn, sans-serif' } : undefined}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
