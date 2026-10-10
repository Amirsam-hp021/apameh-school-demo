import { useMemo, useState } from 'react';
import { BadgeCheck, CreditCard, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { StatusBadge } from '../../components/Badge';
import { StatCard } from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import { useToast } from '../../context/ToastContext';
import { useAsync, useDebounce } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';
import PayModal from './PayModal';

const STATUSES = ['verified', 'pending', 'failed', 'expired'];

export default function AdminPayments() {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { notify } = useToast();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [paying, setPaying] = useState(null);
  const debounced = useDebounce(search);

  const all = useAsync(() => api.payments.list(), []);
  const { data, loading, error, reload } = useAsync(() => api.payments.list({ status, search: debounced }), [status, debounced]);

  const totals = useMemo(() => {
    const items = all.data || [];
    const sum = (s) => items.filter((p) => p.status === s).reduce((n, p) => n + p.amount, 0);
    const count = (s) => items.filter((p) => p.status === s).length;
    return { verified: sum('verified'), pending: sum('pending'), pendingCount: count('pending'), failedCount: count('failed') + count('expired') };
  }, [all.data]);

  const refresh = () => {
    reload({ silent: true });
    all.reload({ silent: true });
  };

  const verify = async (p) => {
    await api.payments.verify(p.id);
    notify(t('admin.payments.verified'));
    refresh();
  };

  const columns = [
    { key: 'reference', header: t('admin.payments.columns.reference'), render: (p) => <span className="font-mono text-xs" dir="ltr">{p.reference}</span> },
    { key: 'student', header: t('admin.payments.columns.student'), render: (p) => <span className="font-medium text-slate-900">{nameOf(p.student)}</span> },
    { key: 'class', header: t('admin.payments.columns.class'), render: (p) => <span className="whitespace-nowrap">{p.class?.name}</span> },
    { key: 'amount', header: t('admin.payments.columns.amount'), render: (p) => <span className="whitespace-nowrap font-medium">{fmt.money(p.amount)}</span> },
    { key: 'method', header: t('admin.payments.columns.method'), render: (p) => t(`admin.payments.methods.${p.method}`) },
    { key: 'date', header: t('admin.payments.columns.date'), render: (p) => <span className="whitespace-nowrap">{fmt.dateTime(p.date)}</span> },
    { key: 'status', header: t('admin.payments.columns.status'), render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions',
      header: <span className="sr-only">{t('common.actions')}</span>,
      className: 'text-end',
      render: (p) => (
        <div className="flex justify-end gap-2">
          {p.status === 'pending' && (
            <button type="button" className="btn-secondary btn-sm" onClick={() => verify(p)}>
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t('admin.payments.verify')}
            </button>
          )}
          {p.status !== 'verified' && (
            <button type="button" className="btn-accent btn-sm" onClick={() => setPaying(p)}>
              <CreditCard className="h-3.5 w-3.5" aria-hidden="true" /> {t('admin.payments.pay')}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={t('admin.payments.title')} description={t('admin.payments.subtitle')} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard loading={all.loading} icon={BadgeCheck} tone="teal" label={t('admin.payments.totalVerified')} value={fmt.money(totals.verified)} />
        <StatCard loading={all.loading} icon={CreditCard} tone="amber" label={t('admin.payments.totalPending')} value={fmt.money(totals.pending)} hint={t('admin.payments.pendingHint', { n: fmt.number(totals.pendingCount) })} />
        <StatCard loading={all.loading} icon={CreditCard} tone="red" label={t('admin.payments.failedOrExpired')} value={fmt.number(totals.failedCount)} />
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" className="input ps-9" placeholder={t('admin.payments.searchPlaceholder')} aria-label={t('admin.payments.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['all', ...STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${status === s ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {s === 'all' ? t('common.all') : t(`status.${s}`)}
              </button>
            ))}
          </div>
        </div>
        {error ? (
          <ErrorState onRetry={reload} />
        ) : (
          <Table columns={columns} rows={data} loading={loading} minWidth={900} empty={<EmptyState icon={CreditCard} title={t('admin.payments.empty')} description={t('common.noResultsHint')} />} />
        )}
      </div>

      <PayModal payment={paying} onClose={() => setPaying(null)} onDone={refresh} />
    </>
  );
}
