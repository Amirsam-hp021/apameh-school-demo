import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Calculator, ExternalLink, FileText, RotateCcw, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Avatar from '../../components/Avatar';
import Badge, { StatusBadge } from '../../components/Badge';
import Card from '../../components/Card';
import ErrorState from '../../components/ErrorState';
import GradeValue from '../../components/GradeValue';
import MaterialIcon from '../../components/MaterialIcon';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { detectType } from '../../utils/files';
import { useFormat, useLocalize } from '../../utils/format';
import { average, weightedFinal } from '../../utils/grades';

/**
 * Grade one submission. The weighted final grade preview updates live
 * while the teacher types a score.
 */
export default function GradeSubmission() {
  const { t } = useTranslation();
  const { tx, nameOf } = useLocalize();
  const fmt = useFormat();
  const { notify } = useToast();
  const { submissionId } = useParams();
  const { data: sub, loading, error, reload } = useAsync(() => api.submissions.get(submissionId), [submissionId]);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (sub) {
      setScore(sub.score ?? '');
      setFeedback(sub.feedback || '');
    }
  }, [sub]);

  const numericScore = score === '' ? null : Number(score);
  const scoreValid = numericScore === null || (numericScore >= 0 && numericScore <= 100);

  // Live weighted-grade calculation.
  const preview = useMemo(() => {
    if (!sub) return null;
    const { otherHomeworkScores, midterm, final, weights } = sub.gradeContext;
    const hwScores = scoreValid && numericScore !== null ? [...otherHomeworkScores, numericScore] : otherHomeworkScores;
    const homework = average(hwScores);
    return { homework, hwCount: hwScores.length, ...weightedFinal({ homework, midterm, final }, weights), weights };
  }, [sub, numericScore, scoreValid]);

  const save = async (status) => {
    if (numericScore === null || !scoreValid) return;
    setSaving(status);
    await api.submissions.grade(sub.id, { score: numericScore, feedback: feedback.trim(), status });
    setSaving(null);
    notify(status === 'returned' ? t('grading.returnedMsg') : t('grading.savedMsg'));
    reload({ silent: true });
  };

  if (error) return <ErrorState onRetry={reload} />;

  const isLate = sub && new Date(sub.submittedAt) > new Date(sub.assignment.dueDate);

  return (
    <>
      <Link to="/teacher/submissions" className="btn-ghost -ms-2 mb-2">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t('grading.back')}
      </Link>

      {loading || !sub ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          <PageHeader title={tx(sub.assignment.title)} description={sub.assignment.class.name}>
            <div className="mb-2"><StatusBadge status={sub.status} /></div>
          </PageHeader>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card title={t('grading.submission')}>
                <div className="flex items-center gap-3">
                  <Avatar person={sub.student} />
                  <div>
                    <p className="font-medium text-slate-900">{nameOf(sub.student)}</p>
                    <p className="text-xs text-slate-500" dir="ltr">{sub.student.email}</p>
                  </div>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-slate-500">{t('submissions.submittedAt')}</dt><dd className="font-medium text-slate-800">{fmt.dateTime(sub.submittedAt)}</dd></div>
                  <div><dt className="text-slate-500">{t('assignments.columns.due')}</dt><dd className="font-medium text-slate-800">{fmt.dateTime(sub.assignment.dueDate)}</dd></div>
                </dl>
                {isLate && (
                  <p className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" /> {t('grading.lateWarning')}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <MaterialIcon type={detectType(sub.fileName) || 'doc'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800" dir="ltr">{sub.fileName}</p>
                    <p className="text-xs text-slate-500" dir="ltr">{fmt.bytes(sub.fileSize)}</p>
                  </div>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => setPreviewOpen(true)}>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> {t('grading.openFile')}
                  </button>
                </div>
              </Card>

              <Card title={t('grading.yourGrade')}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label" htmlFor="score">{t('grading.score')}</label>
                    <div className="relative">
                      <input
                        id="score"
                        type="number"
                        min="0"
                        max="100"
                        inputMode="decimal"
                        className={`input pe-12 text-lg font-semibold ${!scoreValid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="0–100"
                      />
                      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">/ {fmt.number(100)}</span>
                    </div>
                    {!scoreValid && <p className="mt-1 text-xs text-red-600">{t('grading.scoreRange')}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="feedback">{t('grading.feedback')}</label>
                    <textarea id="feedback" rows={4} className="input" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={t('grading.feedbackPlaceholder')} dir="auto" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button type="button" className="btn-secondary" disabled={numericScore === null || !scoreValid || saving} onClick={() => save('returned')}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> {saving === 'returned' ? t('common.saving') : t('grading.returnForRevision')}
                  </button>
                  <button type="button" className="btn-primary" disabled={numericScore === null || !scoreValid || saving} onClick={() => save('reviewed')}>
                    <Save className="h-4 w-4" aria-hidden="true" /> {saving === 'reviewed' ? t('common.saving') : t('grading.saveGrade')}
                  </button>
                </div>
              </Card>
            </div>

            <Card title={<span className="flex items-center gap-2"><Calculator className="h-4 w-4 text-accent-600" aria-hidden="true" />{t('grading.liveTitle')}</span>} subtitle={t('grading.liveSubtitle')} className="lg:sticky lg:top-24 lg:self-start">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500">
                    <th className="pb-2 text-start font-medium">{t('grading.component')}</th>
                    <th className="pb-2 text-end font-medium">{t('grading.scoreCol')}</th>
                    <th className="pb-2 text-end font-medium">{t('grading.weight')}</th>
                    <th className="pb-2 text-end font-medium">{t('grading.points')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.breakdown.map((row) => (
                    <tr key={row.key}>
                      <td className="py-2 text-slate-700">
                        {t(`grades.components.${row.key}`)}
                        {row.key === 'homework' && <span className="block text-xs text-slate-400">{t('grading.hwAverage', { n: fmt.number(preview.hwCount) })}</span>}
                      </td>
                      <td className="py-2 text-end font-medium">{fmt.decimal(row.score)}</td>
                      <td className="py-2 text-end text-slate-500">{fmt.percent(row.weight)}</td>
                      <td className="py-2 text-end">{fmt.decimal(row.contribution)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 rounded-xl bg-primary-50 p-4 text-center">
                <p className="text-xs font-medium text-primary-800/80">{t('grades.weightedFinal')}</p>
                <div className="mt-1"><GradeValue value={preview.total} size="lg" /></div>
                {preview.partial && <Badge tone="amber" className="mt-2">{t('grading.partialNote')}</Badge>}
              </div>
              <p className="mt-3 text-xs text-slate-500">{t('grading.formula', { hw: fmt.number(preview.weights.homework), mid: fmt.number(preview.weights.midterm), fin: fmt.number(preview.weights.final) })}</p>
            </Card>
          </div>

          <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title={sub.fileName}>
            <div className="flex flex-col items-center rounded-xl bg-slate-50 py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300" aria-hidden="true" />
              <p className="mt-3 font-medium text-slate-700">{t('grading.previewTitle')}</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">{t('grading.previewText')}</p>
            </div>
          </Modal>
        </>
      )}
    </>
  );
}
