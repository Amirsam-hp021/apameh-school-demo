import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { StatusBadge } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import GradeValue from '../../components/GradeValue';
import PageHeader from '../../components/PageHeader';
import { SkeletonList } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';

const FILTERS = ['all', 'not_submitted', 'submitted', 'late', 'reviewed', 'returned'];

export default function StudentAssignments() {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const { data, loading, error, reload } = useAsync(() => api.assignments.forStudent(user.id), [user.id]);
  const visible = (data || []).filter((a) => filter === 'all' || a.status === filter);
  const countOf = (f) => (data || []).filter((a) => f === 'all' || a.status === f).length;

  return (
    <>
      <PageHeader title={t('nav.assignments')} description={t('student.assignments.subtitle')} />
      <div className="card">
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 p-4">
          {FILTERS.map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${filter === f ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f === 'all' ? t('common.all') : t(`status.${f}`)}
              {data && <span className="ms-1.5 opacity-70">{fmt.number(countOf(f))}</span>}
            </button>
          ))}
        </div>
        {error && <ErrorState onRetry={reload} />}
        {loading && <div className="p-5"><SkeletonList rows={4} /></div>}
        {!loading && !error && visible.length === 0 && <EmptyState icon={FileText} title={t('assignments.empty')} description={t('student.assignments.emptyHint')} />}
        {!loading && !error && visible.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {visible.map((a) => {
              const overdue = a.status === 'not_submitted' && new Date(a.dueDate) < new Date();
              return (
                <li key={a.id}>
                  <Link to={`/student/assignments/${a.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                    <span className="h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: a.class.color }} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{tx(a.title)}</p>
                      <p className="text-xs text-slate-500">
                        {a.class.name} · {t('student.assignments.due')}: <span className={overdue ? 'font-medium text-red-600' : ''}>{fmt.dateTime(a.dueDate)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {a.submission?.score != null && <GradeValue value={a.submission.score} />}
                      <StatusBadge status={a.status} />
                      <ChevronRight className="h-4 w-4 text-slate-300 rtl:rotate-180" aria-hidden="true" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
