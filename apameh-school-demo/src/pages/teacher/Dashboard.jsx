import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, ClipboardCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Avatar from '../../components/Avatar';
import Card, { StatCard } from '../../components/Card';
import { StatusBadge } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import ProgressBar from '../../components/ProgressBar';
import { SkeletonList } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';
import { AnnouncementList } from '../shared/AnnouncementsFeed';

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { tx, nameOf } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.dashboard.teacher(user.id), [user.id]);
  const news = useAsync(() => api.announcements.list({ role: 'teacher' }), []);

  if (error) return <ErrorState onRetry={reload} />;

  return (
    <>
      <PageHeader title={t('teacher.dashboard.title')} description={t('common.welcomeBack', { name: nameOf(user) })} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} icon={BookOpen} label={t('teacher.dashboard.myClasses')} value={fmt.number(data?.classes.length)} />
        <StatCard loading={loading} icon={Users} tone="teal" label={t('teacher.dashboard.students')} value={fmt.number(data?.studentsCount)} />
        <StatCard loading={loading} icon={ClipboardCheck} tone="amber" label={t('teacher.dashboard.toReview')} value={fmt.number(data?.toReviewCount)} />
        <StatCard loading={loading} icon={CalendarCheck} tone="purple" label={t('teacher.dashboard.avgAttendance')} value={fmt.percent(data?.avgAttendance)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title={t('teacher.dashboard.myClasses')} action={<Link to="/teacher/classes" className="text-sm font-medium text-primary-700 hover:underline">{t('common.viewAll')}</Link>}>
            {loading ? (
              <SkeletonList rows={2} />
            ) : data.classes.length === 0 ? (
              <EmptyState compact icon={BookOpen} title={t('classes.empty')} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {data.classes.map((c) => (
                  <Link key={c.id} to={`/teacher/classes/${c.id}`} className="rounded-xl border border-slate-200 p-4 transition hover:border-primary-300 hover:bg-primary-50/30">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} aria-hidden="true" />
                      <p className="font-semibold text-slate-900">{c.name}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {t('classes.studentCount', { n: fmt.number(c.studentCount) })} · {t('classes.room', { room: fmt.number(Number(c.room)) })}
                    </p>
                    {c.nextSession && (
                      <p className="mt-2 text-xs text-slate-500">
                        {t('teacher.dashboard.nextSession')}: <span className="font-medium text-slate-700">{fmt.weekday(c.nextSession.start)} {fmt.time(c.nextSession.start)}</span>
                      </p>
                    )}
                    <ProgressBar className="mt-3" value={c.attendanceRate} label={t('classes.attendanceRate')} showLabel />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card title={t('teacher.dashboard.submissionsToReview')} action={<Link to="/teacher/submissions" className="text-sm font-medium text-primary-700 hover:underline">{t('common.viewAll')}</Link>} bodyClassName="p-0">
            {loading && <div className="p-5"><SkeletonList rows={4} /></div>}
            {!loading && data.toReview.length === 0 && <EmptyState compact icon={ClipboardCheck} title={t('teacher.dashboard.allReviewed')} />}
            {!loading && data.toReview.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {data.toReview.map((s) => (
                  <li key={s.id}>
                    <Link to={`/teacher/submissions/${s.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                      <Avatar person={s.student} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{nameOf(s.student)}</p>
                        <p className="truncate text-xs text-slate-500">{tx(s.assignment.title)} · {s.class.name}</p>
                      </div>
                      <div className="text-end">
                        <StatusBadge status={s.status} />
                        <p className="mt-1 text-xs text-slate-400">{fmt.relative(s.submittedAt)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title={t('announcements.title')} className="xl:self-start">
          {news.loading ? <SkeletonList rows={3} /> : <AnnouncementList items={news.data || []} limit={4} />}
        </Card>
      </div>
    </>
  );
}
