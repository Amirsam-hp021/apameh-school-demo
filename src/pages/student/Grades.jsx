import { useTranslation } from 'react-i18next';
import GradesView from '../../components/GradesView';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';

export default function StudentGrades() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <>
      <PageHeader title={t('nav.grades')} description={t('student.grades.subtitle')} />
      <GradesView studentId={user.id} />
    </>
  );
}
