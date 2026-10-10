import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import fa from './fa.json';

// The active language lives in LanguageContext (React state only, no storage).
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes output
  returnNull: false,
});

export default i18n;
