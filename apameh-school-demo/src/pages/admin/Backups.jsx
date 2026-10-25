import { useState } from 'react';
import { DatabaseBackup, Download, Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Badge, { StatusBadge } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat } from '../../utils/format';

export default function AdminBackups() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { notify } = useToast();
  const [creating, setCreating] = useState(false);
  const { data, loading, error, reload, setData } = useAsync(() => api.backups.list(), []);

  const create = async () => {
    setCreating(true);
    const backup = await api.backups.create();
    setData((list) => [backup, ...(list || [])]);
    setCreating(false);
    notify(t('admin.backups.created'));
  };

  const columns = [
    { key: 'name', header: t('admin.backups.columns.name'), render: (b) => <span className="font-mono text-xs" dir="ltr">{b.name}</span> },
    { key: 'type', header: t('admin.backups.columns.type'), render: (b) => <Badge tone={b.type === 'manual' ? 'purple' : 'gray'}>{t(`admin.backups.types.${b.type}`)}</Badge> },
    { key: 'createdAt', header: t('admin.backups.columns.date'), render: (b) => <span className="whitespace-nowrap">{fmt.dateTime(b.createdAt)}</span> },
    { key: 'size', header: t('admin.backups.columns.size'), render: (b) => (b.status === 'completed' ? <span dir="ltr">{fmt.bytes(b.size)}</span> : '—') },
    { key: 'status', header: t('admin.backups.columns.status'), render: (b) => <StatusBadge status={b.status} /> },
    {
      key: 'actions',
      header: <span className="sr-only">{t('common.actions')}</span>,
      className: 'text-end',
      render: (b) =>
        b.status === 'completed' && (
          <button type="button" className="btn-ghost btn-sm" onClick={() => notify(t('common.demoDownload'), 'info')}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.download')}
          </button>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t('admin.backups.title')}
        description={t('admin.backups.subtitle')}
        actions={
          <button type="button" className="btn-primary" onClick={create} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {creating ? t('admin.backups.creating') : t('admin.backups.create')}
          </button>
        }
      />
      <div className="card">
        {error ? (
          <ErrorState onRetry={reload} />
        ) : (
          <Table columns={columns} rows={data} loading={loading} empty={<EmptyState icon={DatabaseBackup} title={t('admin.backups.empty')} />} />
        )}
      </div>
    </>
  );
}
