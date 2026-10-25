import { useTranslation } from 'react-i18next';
import ErrorState from '../../components/ErrorState';
import GradesView from '../../components/GradesView';
import PageHeader from '../../components/PageHeader';
import { SkeletonCards } from '../../components/Skeleton';
import ChildHeader from './ChildHeader';
import { useChild } from './useChild';

export default function ParentGrades() {
  const { t } = useTranslation();
  const { data: child, loading, error, reload } = useChild();
  return (
    <>
      <PageHeader title={t('parent.grades.title')} description={t('parent.grades.subtitle')} />
      {error && <ErrorState onRetry={reload} />}
      {loading ? <SkeletonCards count={2} /> : child && (
        <>
          <ChildHeader child={child} />
          <GradesView studentId={child.id} />
        </>
      )}
    </>
  );
}
