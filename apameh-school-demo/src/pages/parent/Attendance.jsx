import { CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { StatusBadge } from '../../components/Badge';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import ProgressBar from '../../components/ProgressBar';
import { SkeletonCards } from '../../components/Skeleton';
import Table from '../../components/Table';
import { useAsync } from '../../hooks/useAsync';
import { useFormat } from '../../utils/format';
import ChildHeader from './ChildHeader';
import { useChild } from './useChild';

export default function ParentAttendance() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const child = useChild();
  const childId = child.data?.id;
  const { data, loading, error, reload } = useAsync(
    () => (childId ? api.attendance.forStudent(childId) : Promise.resolve(null)),
    [childId],
  );
  const busy = child.loading || loading || !data;

  const columns = [
    { key: 'date', header: t('attendance.date'), render: (r) => <span className="whitespace-nowrap">{fmt.weekday(`${r.date}T12:00:00`)} · {fmt.date(`${r.date}T12:00:00`)}</span> },
    { key: 'class', header: t('common.class'), render: (r) => r.class.name },
    { key: 'mark', header: t('common.status'), render: (r) => <StatusBadge status={r.mark} /> },
  ];

  return (
    <>
      <PageHeader title={t('parent.attendance.title')} description={t('parent.attendance.subtitle')} />
      {(error || child.error) && <ErrorState onRetry={() => { child.reload(); reload(); }} />}
      {child.data && <ChildHeader child={child.data} />}
      {busy && !error ? (
        <SkeletonCards count={2} />
      ) : (
        data && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {data.perClass.map((c) => (
                <div key={c.class.id} className="card p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.class.color }} aria-hidden="true" />
                    <h2 className="font-semibold text-slate-900">{c.class.name}</h2>
                  </div>
                  <ProgressBar className="mt-4" value={c.rate} label={t('classes.attendanceRate')} showLabel tone="teal" />
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {['present', 'late', 'absent'].map((k) => (
                      <div key={k} className="rounded-lg bg-slate-50 py-2">
                        <dt className="text-xs text-slate-500">{t(`status.${k}`)}</dt>
                        <dd className="text-lg font-semibold text-slate-900">{fmt.number(c[k])}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            <Card className="mt-6" title={t('parent.attendance.recent')} bodyClassName="p-0">
              <Table
                columns={columns}
                rows={data.recent.map((r) => ({ ...r, id: `${r.date}-${r.class.id}` }))}
                empty={<EmptyState compact icon={CalendarCheck} title={t('parent.attendance.empty')} />}
                minWidth={480}
              />
            </Card>
          </>
        )
      )}
    </>
  );
}
