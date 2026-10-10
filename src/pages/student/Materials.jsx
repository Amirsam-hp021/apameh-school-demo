import { useState } from 'react';
import { Download, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import MaterialIcon from '../../components/MaterialIcon';
import PageHeader from '../../components/PageHeader';
import { SkeletonList } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat } from '../../utils/format';

const TYPES = ['all', 'pdf', 'video', 'image'];

export default function StudentMaterials() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { user } = useAuth();
  const { notify } = useToast();
  const [classId, setClassId] = useState('all');
  const [type, setType] = useState('all');
  const classes = useAsync(() => api.classes.list({ studentId: user.id }), [user.id]);
  const { data, loading, error, reload } = useAsync(() => api.materials.list({ studentId: user.id }), [user.id]);

  const visible = (data || []).filter((m) => (classId === 'all' || m.classId === classId) && (type === 'all' || m.type === type));

  const download = async (m) => {
    await api.materials.download(m.id);
    notify(t('materials.downloadStarted', { name: m.name }), 'info');
  };

  return (
    <>
      <PageHeader title={t('nav.materials')} description={t('student.materials.subtitle')} />
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <select className="input sm:w-64" value={classId} onChange={(e) => setClassId(e.target.value)} aria-label={t('common.class')}>
            <option value="all">{t('common.allClasses')}</option>
            {classes.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((x) => (
              <button key={x} type="button" onClick={() => setType(x)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${type === x ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {x === 'all' ? t('common.all') : t(`fileTypes.${x}`)}
              </button>
            ))}
          </div>
        </div>
        {(error || classes.error) && <ErrorState onRetry={() => { classes.reload(); reload(); }} />}
        {loading && !error && <div className="p-5"><SkeletonList rows={5} /></div>}
        {!loading && !error && visible.length === 0 && <EmptyState icon={FolderOpen} title={t('materials.empty')} description={t('student.materials.emptyHint')} />}
        {!loading && !error && visible.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {visible.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <MaterialIcon type={m.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800" dir="ltr">{m.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {m.class.name} · {t(`fileTypes.${m.type}`)} · <span dir="ltr">{fmt.bytes(m.size)}</span> · {fmt.date(m.uploadedAt)}
                  </p>
                </div>
                <button type="button" className="btn-secondary btn-sm" onClick={() => download(m)}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> <span className="hidden sm:inline">{t('common.download')}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
