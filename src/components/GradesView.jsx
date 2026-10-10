import { useState } from 'react';
import { GraduationCap, MessageSquareQuote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useFormat, useLocalize } from '../utils/format';
import { StatusBadge } from './Badge';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import GradeValue from './GradeValue';
import Modal from './Modal';
import { SkeletonCards } from './Skeleton';
import Table from './Table';

/**
 * Grades per class with the weighted final grade and assignment feedback.
 * Used by the Student "Grades" page and the read-only Parent view.
 */
export default function GradesView({ studentId }) {
  const { t } = useTranslation();
  const { tx, nameOf } = useLocalize();
  const fmt = useFormat();
  const [feedbackFor, setFeedbackFor] = useState(null);
  const { data, loading, error, reload } = useAsync(() => api.grades.forStudent(studentId), [studentId]);

  if (error) return <ErrorState onRetry={reload} />;
  if (loading) return <SkeletonCards count={2} />;
  if (data.classes.length === 0) return <div className="card"><EmptyState icon={GraduationCap} title={t('grades.empty')} /></div>;

  const columns = [
    { key: 'title', header: t('common.assignment'), render: (a) => <span className="font-medium text-slate-800">{tx(a.title)}</span> },
    { key: 'due', header: t('assignments.columns.due'), render: (a) => <span className="whitespace-nowrap">{fmt.date(a.dueDate)}</span> },
    { key: 'status', header: t('common.status'), render: (a) => <StatusBadge status={a.status} /> },
    { key: 'score', header: t('submissions.score'), render: (a) => (a.score != null ? <GradeValue value={a.score} /> : '—') },
    {
      key: 'feedback',
      header: t('grading.feedback'),
      className: 'text-end',
      render: (a) =>
        a.feedback ? (
          <button type="button" className="btn-ghost btn-sm" onClick={() => setFeedbackFor(a)}>
            <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden="true" /> {t('grades.viewFeedback')}
          </button>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {data.classes.map((c) => (
        <section key={c.class.id} className="card overflow-hidden">
          <header className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: c.class.color }} aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-slate-900">{c.class.name}</h2>
                <p className="text-sm text-slate-500">{nameOf(c.teacher)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              {['homework', 'midterm', 'final'].map((k) => (
                <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[11px] text-slate-500">{t(`grades.components.${k}`)} · {fmt.percent(data.weights[k])}</p>
                  <p className="font-semibold text-slate-800">{fmt.decimal(c[k])}</p>
                </div>
              ))}
              <div className="rounded-lg bg-primary-50 px-3 py-2">
                <p className="text-[11px] text-primary-800/80">{t('grades.weightedFinal')}</p>
                <GradeValue value={c.weighted} />
              </div>
            </div>
          </header>
          {c.partial && <p className="bg-amber-50/60 px-5 py-2 text-xs text-amber-800">{t('grades.partialExplain')}</p>}
          <Table columns={columns} rows={c.assignments} empty={<EmptyState compact title={t('assignments.empty')} />} />
        </section>
      ))}

      <Modal open={Boolean(feedbackFor)} onClose={() => setFeedbackFor(null)} title={feedbackFor ? tx(feedbackFor.title) : ''} size="sm">
        {feedbackFor && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-sm text-slate-500">{t('submissions.score')}</span>
              <GradeValue value={feedbackFor.score} size="lg" />
            </div>
            <blockquote className="border-s-4 border-accent-400 ps-4 text-slate-700" dir="auto">{feedbackFor.feedback}</blockquote>
            {feedbackFor.gradedAt && <p className="text-xs text-slate-400">{t('grades.gradedOn', { date: fmt.date(feedbackFor.gradedAt) })}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
