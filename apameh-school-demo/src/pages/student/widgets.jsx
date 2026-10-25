import { Link } from 'react-router-dom';
import { CalendarClock, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import GradeValue from '../../components/GradeValue';
import { useFormat, useLocalize } from '../../utils/format';

/** Days until a date, used for "due in x days" urgency colours. */
const daysUntil = (iso) => Math.ceil((new Date(iso) - Date.now()) / 86_400_000);

/**
 * Upcoming deadlines (shared by student and parent dashboards).
 * When `linkBase` is set each item links to the assignment page.
 */
export function DeadlineList({ items, linkBase }) {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  if (!items.length) return <EmptyState compact icon={CalendarClock} title={t('student.dashboard.noDeadlines')} />;

  return (
    <ul className="space-y-3">
      {items.map((a) => {
        const days = daysUntil(a.dueDate);
        const urgent = days <= 3 && a.status === 'not_submitted';
        const content = (
          <>
            <div className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-center ${urgent ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
              <span className="text-sm font-bold leading-none">{fmt.number(Math.max(0, days))}</span>
              <span className="text-[10px] leading-tight">{t('common.days')}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{tx(a.title)}</p>
              <p className="truncate text-xs text-slate-500">{a.class.name} · {fmt.dateTime(a.dueDate)}</p>
            </div>
            <StatusBadge status={a.status} />
          </>
        );
        return (
          <li key={a.id}>
            {linkBase ? (
              <Link to={`${linkBase}/${a.id}`} className="-mx-2 flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50">{content}</Link>
            ) : (
              <div className="flex items-center gap-3">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Latest graded work. */
export function RecentGradesList({ items }) {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  if (!items.length) return <EmptyState compact icon={GraduationCap} title={t('student.dashboard.noGrades')} />;
  return (
    <ul className="space-y-3">
      {items.map((g) => (
        <li key={g.id} className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{tx(g.title)}</p>
            <p className="truncate text-xs text-slate-500">{g.class.name} · {fmt.date(g.gradedAt)}</p>
          </div>
          <GradeValue value={g.score} />
        </li>
      ))}
    </ul>
  );
}
