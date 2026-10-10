import { BookOpen, DoorOpen, User } from 'lucide-react';
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

export default function StudentClasses() {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.classes.list({ studentId: user.id }), [user.id]);

  return (
    <>
      <PageHeader title={t('classes.myTitle')} description={t('student.classes.subtitle')} />
      {error && <ErrorState onRetry={reload} />}
      {loading && <SkeletonCards count={2} />}
      {!loading && !error && data.length === 0 && <div className="card"><EmptyState icon={BookOpen} title={t('classes.empty')} /></div>}
      {!loading && !error && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((cls) => (
            <article key={cls.id} className="card overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: cls.color }} aria-hidden="true" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">{cls.name}</h2>
                  <Badge tone="blue">{cls.level}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4 text-slate-400" aria-hidden="true" />{nameOf(cls.teacher)}</span>
                  <span className="inline-flex items-center gap-1.5"><DoorOpen className="h-4 w-4 text-slate-400" aria-hidden="true" />{t('classes.room', { room: fmt.number(Number(cls.room)) })}</span>
                </div>
                <ScheduleList schedule={cls.schedule} className="mt-3" />
                <ProgressBar className="mt-5" value={cls.progress} label={t('classes.courseProgress')} showLabel tone="teal" />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
