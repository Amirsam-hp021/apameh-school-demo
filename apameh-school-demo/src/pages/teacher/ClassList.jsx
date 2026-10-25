import { Link } from 'react-router-dom';
import { BookOpen, DoorOpen, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import ProgressBar from '../../components/ProgressBar';
import ScheduleList from '../../components/ScheduleList';
import { SkeletonCards } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';

/** Class cards. Teachers see their own classes; the Super Admin sees all classes. */
export default function ClassList() {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const base = isAdmin ? '/admin/classes' : '/teacher/classes';
  const { data, loading, error, reload } = useAsync(() => api.classes.list(isAdmin ? {} : { teacherId: user.id }), [user.id]);

  return (
    <>
      <PageHeader title={isAdmin ? t('classes.allTitle') : t('classes.myTitle')} description={t('classes.subtitle')} />
      {error && <ErrorState onRetry={reload} />}
      {loading && <SkeletonCards count={isAdmin ? 6 : 2} />}
      {!loading && !error && data.length === 0 && <div className="card"><EmptyState icon={BookOpen} title={t('classes.empty')} /></div>}
      {!loading && !error && data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((cls) => (
            <Link key={cls.id} to={`${base}/${cls.id}`} className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: cls.color }} aria-hidden="true" />
                  <div>
                    <h2 className="font-semibold text-slate-900 group-hover:text-primary-700">{cls.name}</h2>
                    {isAdmin && <p className="text-sm text-slate-500">{nameOf(cls.teacher)}</p>}
                  </div>
                </div>
                <Badge tone="blue">{cls.level}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-slate-400" aria-hidden="true" />{t('classes.studentCount', { n: fmt.number(cls.studentCount) })}</span>
                <span className="inline-flex items-center gap-1.5"><DoorOpen className="h-4 w-4 text-slate-400" aria-hidden="true" />{t('classes.room', { room: fmt.number(Number(cls.room)) })}</span>
              </div>
              <ScheduleList schedule={cls.schedule} className="mt-3" />
              <div className="mt-auto space-y-3 pt-5">
                <ProgressBar value={cls.progress} label={t('classes.courseProgress')} showLabel tone="blue" />
                <ProgressBar value={cls.attendanceRate} label={t('classes.attendanceRate')} showLabel tone="teal" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
