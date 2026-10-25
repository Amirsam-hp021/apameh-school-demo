import { Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import { SkeletonList } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';

/** Compact list used on dashboards. */
export function AnnouncementList({ items, limit }) {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  if (!items.length) return <EmptyState compact icon={Megaphone} title={t('announcements.empty')} />;
  return (
    <ul className="space-y-4">
      {items.slice(0, limit).map((a) => (
        <li key={a.id} className="flex gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
            <Megaphone className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{tx(a.title)}</p>
            <p className="line-clamp-2 text-sm text-slate-600">{tx(a.body)}</p>
            <p className="mt-1 text-xs text-slate-400">{fmt.relative(a.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Read-only announcements page for teachers, students and parents. */
export default function AnnouncementsFeed() {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.announcements.list({ role: user.role }), [user.role]);

  return (
    <>
      <PageHeader title={t('announcements.title')} description={t('announcements.subtitle')} />
      {error && <ErrorState onRetry={reload} />}
      {loading && <div className="card p-5"><SkeletonList rows={4} /></div>}
      {!loading && !error && data.length === 0 && <div className="card"><EmptyState icon={Megaphone} title={t('announcements.empty')} /></div>}
      {!loading && !error && data.length > 0 && (
        <div className="space-y-4">
          {data.map((a) => (
            <article key={a.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-slate-900">{tx(a.title)}</h2>
                {a.audience !== 'all' && <Badge tone="teal">{t(`audiences.${a.audience}`)}</Badge>}
              </div>
              <p className="mt-2 text-slate-600">{tx(a.body)}</p>
              <p className="mt-3 text-xs text-slate-400">{fmt.dateTime(a.createdAt)}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
