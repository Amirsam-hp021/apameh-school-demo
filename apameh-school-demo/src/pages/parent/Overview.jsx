import { CalendarCheck, CalendarClock, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Card, { StatCard } from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import GradeValue from '../../components/GradeValue';
import PageHeader from '../../components/PageHeader';
import ProgressBar from '../../components/ProgressBar';
import { SkeletonList } from '../../components/Skeleton';
import Table from '../../components/Table';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';
import { DeadlineList, RecentGradesList } from '../student/widgets';
import ChildHeader from './ChildHeader';

/** Parent dashboard: read-only summary of the child's grades, attendance and deadlines. */
export default function ParentOverview() {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.dashboard.parent(user.id), [user.id]);

  if (error) return <ErrorState onRetry={reload} />;

  const columns = [
    { key: 'class', header: t('common.class'), render: (c) => <span className="font-medium text-slate-900">{c.class.name}</span> },
    { key: 'teacher', header: t('common.teacher'), render: (c) => nameOf(c.teacher) },
    { key: 'grade', header: t('grades.weightedFinal'), render: (c) => <GradeValue value={c.weighted} partial={c.partial} /> },
    { key: 'attendance', header: t('classes.attendanceRate'), render: (c) => <div className="w-40"><ProgressBar value={c.attendance.rate} showLabel tone="teal" /></div> },
  ];

  return (
    <>
      <PageHeader title={t('parent.overview.title')} description={t('common.welcomeBack', { name: nameOf(user) })} />
      {loading ? <div className="card mb-6 p-5"><SkeletonList rows={1} /></div> : <ChildHeader child={data.child} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard loading={loading} icon={GraduationCap} label={t('student.dashboard.averageGrade')} value={fmt.decimal(data?.averageGrade)} />
        <StatCard loading={loading} icon={CalendarCheck} tone="teal" label={t('student.dashboard.attendance')} value={fmt.percent(data?.attendanceRate)} />
        <StatCard loading={loading} icon={CalendarClock} tone="amber" label={t('parent.overview.upcoming')} value={fmt.number(data?.upcoming.length)} />
      </div>

      <Card className="mt-6" title={t('parent.overview.byClass')} bodyClassName="p-0">
        <Table columns={columns} rows={data?.classes.map((c) => ({ ...c, id: c.class.id }))} loading={loading} skeletonRows={2} empty={<EmptyState compact title={t('classes.empty')} />} />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title={t('student.dashboard.upcomingDeadlines')}>
          {loading ? <SkeletonList rows={3} /> : <DeadlineList items={data.upcoming} />}
        </Card>
        <Card title={t('student.dashboard.recentGrades')}>
          {loading ? <SkeletonList rows={3} /> : <RecentGradesList items={data.recentGrades} />}
        </Card>
      </div>
    </>
  );
}
