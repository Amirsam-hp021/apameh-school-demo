import { useEffect, useState } from 'react';
import { RotateCcw, ScrollText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { ACTIONS } from '../../api/audit';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import Table, { Pagination } from '../../components/Table';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';

const PAGE_SIZE = 10;
const EMPTY_FILTERS = { action: 'all', userId: 'all', from: '', to: '' };

/** Tone for an action (failures in red, security-relevant in amber). */
function actionTone(action) {
  if (action.includes('failed')) return 'red';
  if (action.startsWith('login') || action === 'logout') return 'gray';
  if (action.startsWith('settings') || action.startsWith('backup') || action.startsWith('user')) return 'amber';
  return 'blue';
}

export default function AdminAuditLogs() {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const actors = useAsync(() => api.audit.actors(), []);
  const { data, loading, error, reload } = useAsync(() => api.audit.list({ ...filters, page, pageSize: PAGE_SIZE }), [filters, page]);

  useEffect(() => setPage(1), [filters]);

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const columns = [
    { key: 'date', header: t('admin.audit.columns.date'), render: (l) => <span className="whitespace-nowrap">{fmt.dateTime(l.date)}</span> },
    {
      key: 'user',
      header: t('admin.audit.columns.user'),
      render: (l) => (
        <div className="flex items-center gap-2">
          <Avatar person={l.user} size="sm" />
          <div>
            <p className="whitespace-nowrap font-medium text-slate-800">{nameOf(l.user)}</p>
            <p className="text-xs text-slate-500">{t(`roles.${l.user?.role}`)}</p>
          </div>
        </div>
      ),
    },
    { key: 'action', header: t('admin.audit.columns.action'), render: (l) => <Badge tone={actionTone(l.action)}>{t(`audit.actions.${l.action.replace('.', '_')}`)}</Badge> },
    { key: 'ip', header: t('admin.audit.columns.ip'), render: (l) => <span className="font-mono text-xs" dir="ltr">{l.ip}</span> },
  ];

  return (
    <>
      <PageHeader title={t('admin.audit.title')} description={t('admin.audit.subtitle')} />
      <div className="card">
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label" htmlFor="f-action">{t('admin.audit.columns.action')}</label>
            <select id="f-action" className="input" value={filters.action} onChange={set('action')}>
              <option value="all">{t('admin.audit.allActions')}</option>
              {ACTIONS.map((a) => <option key={a} value={a}>{t(`audit.actions.${a.replace('.', '_')}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-user">{t('admin.audit.columns.user')}</label>
            <select id="f-user" className="input" value={filters.userId} onChange={set('userId')}>
              <option value="all">{t('admin.audit.allUsers')}</option>
              {actors.data?.map((u) => <option key={u.id} value={u.id}>{nameOf(u)}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-from">{t('admin.audit.from')}</label>
            <input id="f-from" type="date" className="input" value={filters.from} onChange={set('from')} />
          </div>
          <div>
            <label className="label" htmlFor="f-to">{t('admin.audit.to')}</label>
            <input id="f-to" type="date" className="input" value={filters.to} onChange={set('to')} />
          </div>
          <div className="flex items-end">
            <button type="button" className="btn-secondary w-full" onClick={() => setFilters(EMPTY_FILTERS)}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {t('common.resetFilters')}
            </button>
          </div>
        </div>
        {error ? (
          <ErrorState onRetry={reload} />
        ) : (
          <>
            <Table columns={columns} rows={data?.items} loading={loading} skeletonRows={PAGE_SIZE} empty={<EmptyState icon={ScrollText} title={t('admin.audit.empty')} description={t('common.noResultsHint')} />} />
            {data && data.total > 0 && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onChange={setPage} />}
          </>
        )}
      </div>
    </>
  );
}
