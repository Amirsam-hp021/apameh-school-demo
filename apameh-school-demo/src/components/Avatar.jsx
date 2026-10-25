import { personName } from '../utils/format';
import { useTranslation } from 'react-i18next';

const COLORS = ['bg-primary-100 text-primary-800', 'bg-accent-100 text-accent-800', 'bg-amber-100 text-amber-800', 'bg-violet-100 text-violet-800', 'bg-rose-100 text-rose-800', 'bg-sky-100 text-sky-800'];

/** Circle with the person's initials. */
export default function Avatar({ person, size = 'md' }) {
  const { i18n } = useTranslation();
  const name = personName(person, i18n.language);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join(i18n.language === 'fa' ? '‌' : '');
  const hash = [...(person?.id || '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const dims = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm';
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dims} ${COLORS[hash % COLORS.length]}`} aria-hidden="true">
      {initials.toUpperCase()}
    </span>
  );
}
