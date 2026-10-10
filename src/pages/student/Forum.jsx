import { MessagesSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import ForumBoard from '../../components/ForumBoard';
import PageHeader from '../../components/PageHeader';
import { SkeletonList } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';

/** Students read topics in their classes and post replies. */
export default function StudentForum() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.classes.list({ studentId: user.id }), [user.id]);

  return (
    <>
      <PageHeader title={t('nav.forum')} description={t('student.forum.subtitle')} />
      {error && <ErrorState onRetry={reload} />}
      {loading && <div className="card p-5"><SkeletonList rows={4} /></div>}
      {!loading && !error && data.length === 0 && <div className="card"><EmptyState icon={MessagesSquare} title={t('forum.empty')} /></div>}
      {!loading && !error && data.length > 0 && <ForumBoard classes={data} />}
    </>
  );
}
