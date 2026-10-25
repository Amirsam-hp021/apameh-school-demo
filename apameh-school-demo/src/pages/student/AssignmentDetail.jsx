import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, Lock, MessageSquareQuote, Send, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Badge, { StatusBadge } from '../../components/Badge';
import Card from '../../components/Card';
import ErrorState from '../../components/ErrorState';
import FileDropzone from '../../components/FileDropzone';
import GradeValue from '../../components/GradeValue';
import MaterialIcon from '../../components/MaterialIcon';
import PageHeader from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { acceptFor, detectType, validateFile } from '../../utils/files';
import { useFormat, useLocalize } from '../../utils/format';

/**
 * Assignment details and the submit form.
 * File type and size are checked in the browser; the backend must re-check.
 */
export default function StudentAssignmentDetail() {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { notify } = useToast();
  const { assignmentId } = useParams();
  const { data: a, loading, error, reload } = useAsync(() => api.assignments.getForStudent(assignmentId, user.id), [assignmentId, user.id]);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(null);

  if (error) return <ErrorState onRetry={reload} />;

  const pastDue = a && new Date() > new Date(a.dueDate);
  const closed = a && (a.status === 'closed' || (pastDue && !a.allowLate));
  const canSubmit = a && !closed && ['not_submitted', 'returned', 'submitted', 'late'].includes(a.status);

  const pick = ([f]) => {
    const result = validateFile(f, { allowed: a.allowedTypes, maxSizeMb: a.maxSizeMb });
    if (!result.ok) {
      setFile(null);
      setFileError(result.error === 'type' ? t('upload.errors.type', { name: f.name }) : t('upload.errors.size', { name: f.name, limit: fmt.number(a.maxSizeMb) }));
      return;
    }
    setFileError('');
    setFile(f);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const sub = await api.assignments.submit(a.id, user.id, file);
      setJustSubmitted(sub);
      setFile(null);
      notify(t('student.submit.successToast'));
      reload({ silent: true });
    } catch {
      notify(t('student.submit.failed'), 'error');
    }
    setSubmitting(false);
  };

  return (
    <>
      <Link to="/student/assignments" className="btn-ghost -ms-2 mb-2">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t('student.submit.back')}
      </Link>

      {loading || !a ? (
        <div className="space-y-4"><Skeleton className="h-8 w-72" /><Skeleton className="h-64 w-full" /></div>
      ) : (
        <>
          <PageHeader title={tx(a.title)} description={a.class.name}>
            <div className="mb-2"><StatusBadge status={a.status} /></div>
          </PageHeader>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card title={t('student.submit.instructions')}>
                <p className="whitespace-pre-line text-slate-700">{tx(a.description) || t('student.submit.noDescription')}</p>
              </Card>

              {/* Feedback from the teacher */}
              {a.submission?.score != null && (
                <Card title={<span className="flex items-center gap-2"><MessageSquareQuote className="h-4 w-4 text-accent-600" aria-hidden="true" />{t('student.submit.feedbackTitle')}</span>}>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="rounded-xl bg-slate-50 px-5 py-3 text-center">
                      <p className="text-xs text-slate-500">{t('submissions.score')}</p>
                      <GradeValue value={a.submission.score} size="lg" />
                    </div>
                    <p className="min-w-0 flex-1 text-slate-700" dir="auto">{a.submission.feedback || t('student.submit.noFeedback')}</p>
                  </div>
                  {a.status === 'returned' && <p className="mt-4 rounded-lg bg-violet-50 p-3 text-sm text-violet-800">{t('student.submit.returnedNote')}</p>}
                </Card>
              )}

              <Card title={t('student.submit.yourWork')}>
                {justSubmitted && (
                  <div className={`mb-4 flex items-start gap-3 rounded-xl p-4 ${justSubmitted.status === 'late' ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-900'}`} role="status">
                    {justSubmitted.status === 'late' ? <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />}
                    <div>
                      <p className="font-semibold">{t('student.submit.submittedTitle')}</p>
                      <p className="text-sm">{justSubmitted.status === 'late' ? t('student.submit.lateWarning') : t('student.submit.onTime')}</p>
                    </div>
                  </div>
                )}

                {a.submission && (
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <MaterialIcon type={detectType(a.submission.fileName) || 'doc'} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800" dir="ltr">{a.submission.fileName}</p>
                      <p className="text-xs text-slate-500">{t('student.submit.submittedOn', { date: fmt.dateTime(a.submission.submittedAt) })}</p>
                    </div>
                    <StatusBadge status={a.submission.status} />
                  </div>
                )}

                {closed && a.status === 'not_submitted' && (
                  <p className="flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                    <Lock className="h-4 w-4" aria-hidden="true" /> {t('student.submit.closed')}
                  </p>
                )}

                {canSubmit && (
                  <>
                    {pastDue && (
                      <p className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" /> {t('student.submit.pastDueWarning')}
                      </p>
                    )}
                    <FileDropzone
                      accept={acceptFor(a.allowedTypes)}
                      onFiles={pick}
                      hint={t('student.submit.hint', { types: a.allowedTypes.map((x) => t(`fileTypes.${x}`)).join(t('common.listSeparator')), size: fmt.number(a.maxSizeMb) })}
                    />
                    {fileError && <p className="mt-2 text-sm text-red-600" role="alert" dir="auto">{fileError}</p>}
                    {file && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg bg-primary-50 px-3 py-2">
                        <span className="min-w-0 flex-1 truncate text-sm text-primary-900" dir="ltr">{file.name}</span>
                        <span className="text-xs text-primary-800/70" dir="ltr">{fmt.bytes(file.size)}</span>
                        <button type="button" className="icon-btn h-7 w-7" onClick={() => setFile(null)} aria-label={t('common.remove')}><X className="h-4 w-4" /></button>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <button type="button" className="btn-primary" disabled={!file || submitting} onClick={submit}>
                        <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
                        {submitting ? t('student.submit.submitting') : a.submission ? t('student.submit.resubmit') : t('student.submit.submit')}
                      </button>
                    </div>
                  </>
                )}
              </Card>
            </div>

            <Card title={t('student.submit.details')} className="lg:self-start">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">{t('student.assignments.due')}</dt>
                  <dd className={`text-end font-medium ${pastDue ? 'text-red-600' : 'text-slate-800'}`}>{fmt.dateTime(a.dueDate)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">{t('assignments.form.fields.allowedTypes')}</dt>
                  <dd className="flex flex-wrap justify-end gap-1">{a.allowedTypes.map((x) => <Badge key={x}>{t(`fileTypes.${x}`)}</Badge>)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">{t('assignments.form.fields.maxSize')}</dt>
                  <dd className="font-medium text-slate-800">{t('assignments.maxSize', { n: fmt.number(a.maxSizeMb) })}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">{t('assignments.columns.late')}</dt>
                  <dd className="font-medium text-slate-800">{a.allowLate ? t('common.yes') : t('common.no')}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
