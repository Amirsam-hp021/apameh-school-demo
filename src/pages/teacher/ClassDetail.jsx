import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, FileText, FolderOpen, GraduationCap, MessagesSquare, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Badge from '../../components/Badge';
import ErrorState from '../../components/ErrorState';
import ForumBoard from '../../components/ForumBoard';
import PageHeader from '../../components/PageHeader';
import ScheduleList from '../../components/ScheduleList';
import { Skeleton } from '../../components/Skeleton';
import Tabs from '../../components/Tabs';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';
import AssignmentsTab from './tabs/AssignmentsTab';
import AttendanceTab from './tabs/AttendanceTab';
import GradesTab from './tabs/GradesTab';
import MaterialsTab from './tabs/MaterialsTab';
import StudentsTab from './tabs/StudentsTab';

const TABS = [
  { key: 'students', icon: Users },
  { key: 'materials', icon: FolderOpen },
  { key: 'assignments', icon: FileText },
  { key: 'attendance', icon: CalendarCheck },
  { key: 'grades', icon: GraduationCap },
  { key: 'forum', icon: MessagesSquare },
];

/** Class page with tabs. The active tab is kept in the URL (?tab=...). */
export default function ClassDetail() {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { classId } = useParams();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((x) => x.key === params.get('tab')) ? params.get('tab') : 'students';
  const base = user.role === 'admin' ? '/admin/classes' : '/teacher/classes';
  const { data: cls, loading, error, reload } = useAsync(() => api.classes.get(classId), [classId]);

  if (error) return <ErrorState onRetry={reload} />;

  return (
    <>
      <Link to={base} className="btn-ghost -ms-2 mb-2">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t('classes.backToClasses')}
      </Link>
      {loading ? (
        <div className="mb-6 space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48" /></div>
      ) : (
        <PageHeader
          title={
            <span className="flex flex-wrap items-center gap-3">
              <span className="h-6 w-1.5 rounded-full" style={{ backgroundColor: cls.color }} aria-hidden="true" />
              {cls.name}
              <Badge tone="blue">{cls.level}</Badge>
            </span>
          }
          description={`${nameOf(cls.teacher)} · ${t('classes.room', { room: fmt.number(Number(cls.room)) })} · ${t('classes.studentCount', { n: fmt.number(cls.studentCount) })}`}
          actions={<ScheduleList schedule={cls.schedule} className="rounded-xl bg-white p-3 ring-1 ring-slate-200" />}
        />
      )}

      <Tabs
        tabs={TABS.map((x) => ({ ...x, label: t(`classes.tabs.${x.key}`) }))}
        active={tab}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
      />

      <div className="mt-6">
        {!cls ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            {tab === 'students' && <StudentsTab cls={cls} />}
            {tab === 'materials' && <MaterialsTab cls={cls} />}
            {tab === 'assignments' && <AssignmentsTab cls={cls} />}
            {tab === 'attendance' && <AttendanceTab cls={cls} />}
            {tab === 'grades' && <GradesTab cls={cls} />}
            {tab === 'forum' && <ForumBoard classes={[cls]} canModerate canCreateTopic />}
          </>
        )}
      </div>
    </>
  );
}
