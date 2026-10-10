import { CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { StatusBadge } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import GradeValue from '../../components/GradeValue';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';
import ChildHeader from './ChildHeader';
import { useChild } from './useChild';

/** All of the child's assignments with due dates and status (read only). */
export default function ParentDeadlines() {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const child = useChild();
  const childId = child.data?.id;
  const { data, loading, error, reload } = useAsync(
    () => (childId ? api.assignments.forStudent(childId) : Promise.resolve(null)),
    [childId],
  );

  const columns = [
    { key: 'title', header: t('common.assignment'), render: (a) => <div><p className="font-medium text-slate-900">{tx(a.title)}</p><p className="text-xs text-slate-500">{a.class.name}</p></div> },
    {
      key: 'due',
      header: t('assignments.columns.due'),
      render: (a) => {
        const upcoming = new Date(a.dueDate) > new Date();
        return (
          <div className="whitespace-nowrap">
            <p>{fmt.dateTime(a.dueDate)}</p>
            <p className={`text-xs ${upcoming ? 'text-accent-700' : 'text-slate-400'}`}>{fmt.relative(a.dueDate)}</p>
          </div>
        );
      },
    },
    { key: 'status', header: t('common.status'), render: (a) => <StatusBadge status={a.status} /> },
    { key: 'score', header: t('submissions.score'), render: (a) => (a.submission?.score != null ? <GradeValue value={a.submission.score} /> : '—') },
  ];

  return (
    <>
      <PageHeader title={t('parent.deadlines.title')} description={t('parent.deadlines.subtitle')} />
      {(error || child.error) && <ErrorState onRetry={() => { child.reload(); reload(); }} />}
      {child.data && <ChildHeader child={child.data} />}
      <div className="card">
        <Table
          columns={columns}
          rows={data}
          loading={child.loading || loading || !data}
          empty={<EmptyState icon={CalendarClock} title={t('student.dashboard.noDeadlines')} />}
        />
      </div>
    </>
  );
}
