import { useState } from 'react';
import { Bell, CalendarClock, CheckCheck, FolderOpen, GraduationCap, Megaphone, MessagesSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import { SkeletonList } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';

const TYPE_ICONS = {
  grade: { icon: GraduationCap, cls: 'bg-emerald-50 text-emerald-700' },
  deadline: { icon: CalendarClock, cls: 'bg-red-50 text-red-600' },
  announcement: { icon: Megaphone, cls: 'bg-accent-50 text-accent-700' },
  forum: { icon: MessagesSquare, cls: 'bg-violet-50 text-violet-700' },
  material: { icon: FolderOpen, cls: 'bg-primary-50 text-primary-700' },
};

export default function StudentNotifications() {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { refresh } = useNotifications();
  const [filter, setFilter] = useState('all');
  const { data, loading, error, reload, setData } = useAsync(() => api.notifications.list(user.id), [user.id]);
  const unreadCount = (data || []).filter((n) => !n.read).length;
  const visible = (data || []).filter((n) => filter === 'all' || !n.read);

  const markRead = async (n) => {
    if (n.read) return;
    setData((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    await api.notifications.markRead(n.id);
    refresh();
  };

  const markAll = async () => {
    setData((list) => list.map((x) => ({ ...x, read: true })));
    await api.notifications.markAllRead(user.id);
    refresh();
  };

  return (
    <>
      <PageHeader
        title={t('nav.notifications')}
        description={t('notifications.subtitle', { n: fmt.number(unreadCount) })}
        actions={
          <button type="button" className="btn-secondary" onClick={markAll} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" /> {t('notifications.markAllRead')}
          </button>
        }
      />
      <div className="card">
        <div className="flex gap-1.5 border-b border-slate-100 p-4">
          {['all', 'unread'].map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filter === f ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {t(`notifications.filters.${f}`)}
            </button>
          ))}
        </div>
        {error && <ErrorState onRetry={reload} />}
        {loading && <div className="p-5"><SkeletonList rows={6} /></div>}
        {!loading && !error && visible.length === 0 && (
          <EmptyState icon={Bell} title={filter === 'unread' ? t('notifications.allCaughtUp') : t('notifications.empty')} />
        )}
        {!loading && !error && visible.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {visible.map((n) => {
              const { icon: Icon, cls } = TYPE_ICONS[n.type] || TYPE_ICONS.announcement;
              return (
                <li key={n.id} className={n.read ? '' : 'bg-primary-50/40'}>
                  <div className="flex items-start gap-3 px-5 py-4">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cls}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                        {!n.read && <span className="me-2 inline-block h-2 w-2 rounded-full bg-accent-500 align-middle" aria-label={t('notifications.unread')} />}
                        {tx(n.title)}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">{tx(n.body)}</p>
                      <p className="mt-1 text-xs text-slate-400">{fmt.relative(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <button type="button" className="btn-ghost btn-sm shrink-0" onClick={() => markRead(n)}>{t('notifications.markRead')}</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
