import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Search, Upload, UserPlus, Users as UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Avatar from '../../components/Avatar';
import Badge, { StatusBadge } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import Table, { Pagination } from '../../components/Table';
import { useToast } from '../../context/ToastContext';
import { useAsync, useDebounce } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';
import BulkImportModal from './BulkImportModal';
import UserFormModal from './UserFormModal';

const ROLE_TONES = { admin: 'purple', teacher: 'teal', student: 'blue', parent: 'amber' };
const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { notify } = useToast();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new user
  const [importOpen, setImportOpen] = useState(false);
  const debounced = useDebounce(search);

  // Follow ?q= when arriving from the global search.
  useEffect(() => {
    setSearch(params.get('q') || '');
  }, [params]);

  // Go back to page 1 whenever filters change.
  useEffect(() => setPage(1), [debounced, role, status]);

  const { data, loading, error, reload } = useAsync(
    () => api.users.list({ search: debounced, role, status, page, pageSize: PAGE_SIZE }),
    [debounced, role, status, page],
  );

  const save = async (form) => {
    if (editing) {
      await api.users.update(editing.id, form);
      notify(t('admin.users.updated'));
    } else {
      await api.users.create(form);
      notify(t('admin.users.created'));
    }
    setEditing(undefined);
    reload({ silent: true });
  };

  const columns = [
    {
      key: 'name',
      header: t('admin.users.columns.name'),
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar person={u} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{nameOf(u)}</p>
            <p className="truncate text-xs text-slate-500" dir="ltr">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: t('admin.users.columns.role'), render: (u) => <Badge tone={ROLE_TONES[u.role]}>{t(`roles.${u.role}`)}</Badge> },
    { key: 'phone', header: t('admin.users.columns.phone'), render: (u) => <span dir="ltr" className="whitespace-nowrap">{u.phone}</span> },
    { key: 'status', header: t('admin.users.columns.status'), render: (u) => <StatusBadge status={u.status} /> },
    { key: 'createdAt', header: t('admin.users.columns.joined'), render: (u) => <span className="whitespace-nowrap">{fmt.date(u.createdAt)}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">{t('common.actions')}</span>,
      className: 'text-end',
      render: (u) => (
        <button type="button" className="btn-ghost btn-sm" onClick={() => setEditing(u)}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.edit')}
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t('admin.users.title')}
        description={t('admin.users.subtitle')}
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" aria-hidden="true" /> {t('admin.users.bulkImport')}
            </button>
            <button type="button" className="btn-primary" onClick={() => setEditing(null)}>
              <UserPlus className="h-4 w-4" aria-hidden="true" /> {t('admin.users.addUser')}
            </button>
          </>
        }
      />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              className="input ps-9"
              placeholder={t('admin.users.searchPlaceholder')}
              aria-label={t('admin.users.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input md:w-44" value={role} onChange={(e) => setRole(e.target.value)} aria-label={t('admin.users.filterRole')}>
            <option value="all">{t('admin.users.allRoles')}</option>
            {['admin', 'teacher', 'student', 'parent'].map((r) => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}
          </select>
          <select className="input md:w-44" value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('admin.users.filterStatus')}>
            <option value="all">{t('admin.users.allStatuses')}</option>
            {['active', 'inactive', 'suspended'].map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </select>
        </div>

        {error ? (
          <ErrorState onRetry={reload} />
        ) : (
          <>
            <Table
              columns={columns}
              rows={data?.items}
              loading={loading}
              skeletonRows={PAGE_SIZE}
              empty={<EmptyState icon={UsersIcon} title={t('admin.users.empty')} description={t('common.noResultsHint')} />}
            />
            {data && data.total > 0 && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onChange={setPage} />}
          </>
        )}
      </div>

      <UserFormModal open={editing !== undefined} user={editing} onClose={() => setEditing(undefined)} onSave={save} />
      <BulkImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
