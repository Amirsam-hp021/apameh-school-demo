import { useSearchParams, useNavigate } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Avatar from '../../components/Avatar';
import { StatusBadge } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import GradeValue from '../../components/GradeValue';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';

const FILTERS = ['to_review', 'reviewed', 'returned', 'all'];

/** All submissions in the teacher's classes, filterable by status and class. */
export default function Submissions() {
  const { t } = useTranslation();
  const { tx, nameOf } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = FILTERS.includes(params.get('status')) ? params.get('status') : 'to_review';
  const classId = params.get('class') || '';

  const classes = useAsync(() => api.classes.list({ teacherId: user.id }), [user.id]);
  const { data, loading, error, reload } = useAsync(
    () => api.submissions.list({ teacherId: user.id, classId: classId || undefined, status }),
    [user.id, classId, status],
  );

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const columns = [
    {
      key: 'student',
      header: t('common.student'),
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar person={s.student} size="sm" />
          <span className="whitespace-nowrap font-medium text-slate-900">{nameOf(s.student)}</span>
        </div>
      ),
    },
    { key: 'assignment', header: t('common.assignment'), render: (s) => <div><p className="text-slate-800">{tx(s.assignment.title)}</p><p className="text-xs text-slate-500">{s.class.name}</p></div> },
    { key: 'submitted', header: t('submissions.submittedAt'), render: (s) => <span className="whitespace-nowrap">{fmt.dateTime(s.submittedAt)}</span> },
    { key: 'status', header: t('common.status'), render: (s) => <StatusBadge status={s.status} /> },
    { key: 'score', header: t('submissions.score'), render: (s) => (s.score != null ? <GradeValue value={s.score} /> : '—') },
    {
      key: 'action',
      header: <span className="sr-only">{t('common.actions')}</span>,
      className: 'text-end',
      render: (s) => (
        <span className="btn-secondary btn-sm">{s.status === 'submitted' || s.status === 'late' ? t('submissions.grade') : t('common.view')}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={t('submissions.title')} description={t('submissions.subtitle')} />
      <div className="card">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => update('status', f)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${status === f ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t(`submissions.filters.${f}`)}
              </button>
            ))}
          </div>
          <select className="input md:w-60" value={classId} onChange={(e) => update('class', e.target.value)} aria-label={t('common.class')}>
            <option value="">{t('common.allClasses')}</option>
            {classes.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {error ? (
          <ErrorState onRetry={reload} />
        ) : (
          <Table
            columns={columns}
            rows={data}
            loading={loading}
            minWidth={760}
            onRowClick={(s) => navigate(`/teacher/submissions/${s.id}`)}
            empty={<EmptyState icon={ClipboardCheck} title={t('submissions.empty')} description={t('submissions.emptyHint')} />}
          />
        )}
      </div>
    </>
  );
}
