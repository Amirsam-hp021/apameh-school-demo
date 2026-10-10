import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, CalendarClock, Clock, DoorOpen, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Card, { StatCard } from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import { SkeletonList, Skeleton } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';
import { AnnouncementList } from '../shared/AnnouncementsFeed';
import { DeadlineList, RecentGradesList } from './widgets';

export default function StudentDashboard() {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.dashboard.student(user.id), [user.id]);
  const news = useAsync(() => api.announcements.list({ role: 'student' }), []);

  if (error) return <ErrorState onRetry={reload} />;

  return (
    <>
      <PageHeader title={t('student.dashboard.title')} description={t('common.welcomeBack', { name: nameOf(user) })} />

      {/* Next class hero */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 to-primary-950 p-6 text-white shadow-card">
        {loading ? (
          <div className="space-y-3"><Skeleton className="h-4 w-24 bg-white/20" /><Skeleton className="h-7 w-64 bg-white/20" /></div>
        ) : data.nextClass ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm text-accent-200"><CalendarClock className="h-4 w-4" aria-hidden="true" /> {t('student.dashboard.nextClass')}</p>
              <p className="mt-1 text-2xl font-semibold">{data.nextClass.name}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{fmt.weekday(data.nextClass.start)} · {fmt.time(data.nextClass.start)} – {fmt.time(data.nextClass.end)}</span>
                <span className="inline-flex items-center gap-1.5"><DoorOpen className="h-4 w-4" aria-hidden="true" />{t('classes.room', { room: fmt.number(Number(data.nextClass.room)) })}</span>
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{fmt.relative(data.nextClass.start)}</span>
              <Link to="/student/timetable" className="text-sm font-medium text-accent-200 hover:underline">{t('student.dashboard.openTimetable')}</Link>
            </div>
          </div>
        ) : (
          <p>{t('student.dashboard.noUpcomingClass')}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} icon={BookOpen} label={t('student.dashboard.myClasses')} value={fmt.number(data?.classesCount)} />
        <StatCard loading={loading} icon={CalendarClock} tone="amber" label={t('student.dashboard.dueSoon')} value={fmt.number(data?.upcoming.filter((a) => a.status === 'not_submitted').length)} />
        <StatCard loading={loading} icon={GraduationCap} tone="teal" label={t('student.dashboard.averageGrade')} value={fmt.decimal(data?.averageGrade)} />
        <StatCard loading={loading} icon={CalendarCheck} tone="purple" label={t('student.dashboard.attendance')} value={fmt.percent(data?.attendanceRate)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title={t('student.dashboard.upcomingDeadlines')} action={<Link to="/student/assignments" className="text-sm font-medium text-primary-700 hover:underline">{t('common.viewAll')}</Link>}>
          {loading ? <SkeletonList rows={3} /> : <DeadlineList items={data.upcoming} linkBase="/student/assignments" />}
        </Card>
        <Card title={t('student.dashboard.recentGrades')} action={<Link to="/student/grades" className="text-sm font-medium text-primary-700 hover:underline">{t('common.viewAll')}</Link>}>
          {loading ? <SkeletonList rows={3} /> : <RecentGradesList items={data.recentGrades} />}
        </Card>
        <Card title={t('announcements.title')} action={<Link to="/student/announcements" className="text-sm font-medium text-primary-700 hover:underline">{t('common.viewAll')}</Link>}>
          {news.loading ? <SkeletonList rows={3} /> : news.data?.length ? <AnnouncementList items={news.data} limit={3} /> : <EmptyState compact title={t('announcements.empty')} />}
        </Card>
      </div>
    </>
  );
}
