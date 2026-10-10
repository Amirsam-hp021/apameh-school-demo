import { useTranslation } from 'react-i18next';
import { gradeTone } from '../utils/grades';
import { useFormat } from '../utils/format';

const TONES = {
  green: 'text-emerald-700',
  blue: 'text-primary-700',
  amber: 'text-amber-700',
  red: 'text-red-600',
  gray: 'text-slate-400',
};

/** A grade number coloured by band, with an optional "projected" hint. */
export default function GradeValue({ value, partial = false, size = 'base' }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className={`font-semibold ${TONES[gradeTone(value)]} ${size === 'lg' ? 'text-3xl' : ''}`}>{fmt.decimal(value)}</span>
      {partial && value != null && <span className="text-xs text-slate-400">{t('grades.projected')}</span>}
    </span>
  );
}
