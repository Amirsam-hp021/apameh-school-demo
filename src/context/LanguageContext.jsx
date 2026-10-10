import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

export const LANGUAGES = [
  { code: 'en', dir: 'ltr', label: 'English' },
  { code: 'fa', dir: 'rtl', label: 'فارسی' },
];

/**
 * Holds the active language. Switching to Farsi sets dir="rtl" and lang="fa"
 * on <html>, which flips the layout and switches to the Vazirmatn font.
 */
export function LanguageProvider({ children }) {
  const { i18n, t } = useTranslation();
  const [lang, setLang] = useState(i18n.language || 'en');
  const dir = LANGUAGES.find((l) => l.code === lang)?.dir || 'ltr';

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
    document.title = t('app.documentTitle');
  }, [lang, dir, t]);

  const setLanguage = useCallback(
    (code) => {
      i18n.changeLanguage(code);
      setLang(code);
    },
    [i18n],
  );

  const value = useMemo(() => ({ lang, dir, isRtl: dir === 'rtl', setLanguage }), [lang, dir, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
