import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Lock, Plus, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api';
import Badge, { StatusBadge } from '../../../components/Badge';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import Table from '../../../components/Table';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useAsync } from '../../../hooks/useAsync';
import { useFormat, useLocalize } from '../../../utils/format';
import AssignmentFormModal from './AssignmentFormModal';

export default function AssignmentsTab({ cls }) {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { notify } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const { data, loading, error, reload } = useAsync(() => api.assignments.list({ classId: cls.id }), [cls.id]);

  const create = async (form) => {
    await api.assignments.create(cls.id, form);
    setFormOpen(false);
    notify(form.status === 'draft' ? t('assignments.savedDraft') : t('assignments.publishedMsg'));
    reload({ silent: true });
  };

  const setStatus = async (a, status) => {
    await api.assignments.update(a.id, { status });
    notify(t(`assignments.statusChanged.${status}`));
    reload({ silent: true });
  };

  const columns = [
    {
      key: 'title',
      header: t('assignments.columns.title'),
      render: (a) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{tx(a.title)}</p>
          <p className="text-xs text-slate-500">
            {a.allowedTypes.map((x) => t(`fileTypes.${x}`)).join(t('common.listSeparator'))} · {t('assignments.maxSize', { n: fmt.number(a.maxSizeMb) })}
          </p>
        </div>
      ),
    },
    { key: 'due', header: t('assignments.columns.due'), render: (a) => <span className="whitespace-nowrap">{fmt.dateTime(a.dueDate)}</span> },
    { key: 'status', header: t('assignments.columns.status'), render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'subs',
      header: t('assignments.columns.submissions'),
      render: (a) => (
        <span className="whitespace-nowrap">
          {fmt.number(a.submissionCount)} / {fmt.number(a.studentCount)}
          {a.toReviewCount > 0 && <Badge tone="amber" className="ms-2">{t('assignments.toReview', { n: fmt.number(a.toReviewCount) })}</Badge>}
        </span>
      ),
    },
    { key: 'late', header: t('assignments.columns.late'), render: (a) => (a.allowLate ? t('common.yes') : t('common.no')) },
    {
      key: 'actions',
      header: <span className="sr-only">{t('common.actions')}</span>,
      className: 'text-end',
      render: (a) => (
        <div className="flex justify-end gap-2">
          {a.status === 'draft' && (
            <button type="button" className="btn-secondary btn-sm" onClick={() => setStatus(a, 'published')}>
              <Send className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" /> {t('assignments.publish')}
            </button>
          )}
          {a.status === 'published' && (
            <button type="button" className="btn-secondary btn-sm" onClick={() => setStatus(a, 'closed')}>
              <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {t('assignments.close')}
            </button>
          )}
          {user.role === 'teacher' && a.submissionCount > 0 && (
            <Link to={`/teacher/submissions?class=${cls.id}`} className="btn-ghost btn-sm">{t('assignments.viewSubmissions')}</Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
          <h2 className="font-semibold text-slate-900">{t('classes.tabs.assignments')}</h2>
          <button type="button" className="btn-primary" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('assignments.new')}
          </button>
        </div>
        {error ? (
          <ErrorState onRetry={reload} />
        ) : (
          <Table columns={columns} rows={data} loading={loading} minWidth={860} empty={<EmptyState icon={FileText} title={t('assignments.empty')} description={t('assignments.emptyHintTeacher')} />} />
        )}
      </div>
      <AssignmentFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={create} />
    </>
  );
}
