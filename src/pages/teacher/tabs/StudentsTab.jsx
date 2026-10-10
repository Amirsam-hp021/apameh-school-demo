import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api';
import Avatar from '../../../components/Avatar';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import GradeValue from '../../../components/GradeValue';
import ProgressBar from '../../../components/ProgressBar';
import Table from '../../../components/Table';
import { useAsync } from '../../../hooks/useAsync';
import { useFormat, useLocalize } from '../../../utils/format';

export default function StudentsTab({ cls }) {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { data, loading, error, reload } = useAsync(() => api.classes.students(cls.id), [cls.id]);

  const columns = [
    {
      key: 'name',
      header: t('common.student'),
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar person={s} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{nameOf(s)}</p>
            <p className="truncate text-xs text-slate-500" dir="ltr">{s.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'attendance', header: t('classes.attendanceRate'), render: (s) => <div className="w-40"><ProgressBar value={s.attendanceRate} showLabel tone="teal" /></div> },
    { key: 'homework', header: t('grades.components.homework'), render: (s) => fmt.decimal(s.grade.homework) },
    { key: 'midterm', header: t('grades.components.midterm'), render: (s) => fmt.decimal(s.grade.midterm) },
    { key: 'weighted', header: t('grades.weightedFinal'), render: (s) => <GradeValue value={s.grade.weighted} partial={s.grade.partial} /> },
  ];

  if (error) return <ErrorState onRetry={reload} />;
  return (
    <div className="card">
      <Table columns={columns} rows={data} loading={loading} empty={<EmptyState icon={Users} title={t('classes.noStudents')} />} />
    </div>
  );
}
