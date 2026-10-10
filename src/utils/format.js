import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Locale-aware formatting. In Farsi, numbers use Persian digits and dates
 * use the Solar Hijri calendar (handled by Intl with the fa-IR locale).
 */
export function useFormat() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return useMemo(() => {
    const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
    const num = new Intl.NumberFormat(locale);
    const dec = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const dateFmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    const dateTimeFmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const timeFmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
    const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const monthFmt = new Intl.DateTimeFormat(locale, { month: 'short' });
    const rel = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    const units = [
      ['year', 31_536_000],
      ['month', 2_592_000],
      ['week', 604_800],
      ['day', 86_400],
      ['hour', 3_600],
      ['minute', 60],
    ];

    return {
      locale,
      number: (n) => (n == null ? '—' : num.format(n)),
      decimal: (n) => (n == null ? '—' : dec.format(n)),
      percent: (n) => (n == null ? '—' : `${dec.format(n)}${lang === 'fa' ? '٪' : '%'}`),
      money: (n) => t('common.moneyValue', { amount: num.format(n) }),
      /** Short money value for tight spaces, e.g. "17.2M Toman". */
      moneyCompact: (n) =>
        t('common.moneyValue', { amount: new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n) }),
      date: (v) => (v ? dateFmt.format(new Date(v)) : '—'),
      dateTime: (v) => (v ? dateTimeFmt.format(new Date(v)) : '—'),
      time: (v) => timeFmt.format(new Date(v)),
      weekday: (v) => weekdayFmt.format(new Date(v)),
      /** Weekday name from a JS day number (0 = Sunday). */
      weekdayOf: (day) => weekdayFmt.format(new Date(2023, 0, 1 + day)),
      /** Format an "HH:MM" clock string in the current locale. */
      clock: (hhmm) => {
        const [h, m] = hhmm.split(':').map(Number);
        return timeFmt.format(new Date(2023, 0, 1, h, m));
      },
      month: (v) => monthFmt.format(new Date(v)),
      relative: (v) => {
        const seconds = (new Date(v).getTime() - Date.now()) / 1000;
        for (const [unit, size] of units) {
          if (Math.abs(seconds) >= size) return rel.format(Math.round(seconds / size), unit);
        }
        return rel.format(0, 'minute');
      },
      bytes: (b) => {
        if (b == null) return '—';
        if (b >= 1024 ** 3) return `${dec.format(b / 1024 ** 3)} GB`;
        if (b >= 1024 ** 2) return `${dec.format(b / 1024 ** 2)} MB`;
        return `${dec.format(Math.max(1, b / 1024))} KB`;
      },
    };
  }, [lang, t]);
}

/** Pick the right language from a `{ en, fa }` value (plain strings pass through). */
export function localize(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.en || '';
}

/** Display name of a person in the current language. */
export function personName(person, lang) {
  if (!person) return '—';
  return lang === 'fa' ? person.nameFa || person.nameEn : person.nameEn;
}

/** Convenience hook returning `tx` (localize) and `nameOf` bound to the current language. */
export function useLocalize() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  return useMemo(
    () => ({
      lang,
      tx: (value) => localize(value, lang),
      nameOf: (person) => personName(person, lang),
    }),
    [lang],
  );
}
