import { useEffect, useState } from 'react';
import { GraduationCap, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api';
import Avatar from '../../../components/Avatar';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import GradeValue from '../../../components/GradeValue';
import Table from '../../../components/Table';
import { useToast } from '../../../context/ToastContext';
import { useAsync } from '../../../hooks/useAsync';
import { useFormat, useLocalize } from '../../../utils/format';
import { weightedFinal } from '../../../utils/grades';

const toNumber = (v) => (v === '' || v == null ? null : Math.max(0, Math.min(100, Number(v))));

/**
 * Gradebook. Homework is the average of graded assignments; midterm and
 * final are editable here and the weighted grade updates live.
 */
export default function GradesTab({ cls }) {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { notify } = useToast();
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const { data, loading, error, reload } = useAsync(() => api.grades.gradebook(cls.id), [cls.id]);

  useEffect(() => setEdits({}), [data]);

  const valueOf = (row, key) => (edits[row.student.id]?.[key] !== undefined ? edits[row.student.id][key] : row[key] ?? '');
  const setValue = (row, key, value) => setEdits((e) => ({ ...e, [row.student.id]: { ...e[row.student.id], [key]: value } }));
  const dirty = Object.keys(edits).length > 0;

  const save = async () => {
    setSaving(true);
    await Promise.all(
      Object.keys(edits).map((studentId) => {
        const row = data.rows.find((r) => r.student.id === studentId);
        return api.grades.updateExams(cls.id, studentId, { midterm: toNumber(valueOf(row, 'midterm')), final: toNumber(valueOf(row, 'final')) });
      }),
    );
    setSaving(false);
    notify(t('grades.saved'));
    reload({ silent: true });
  };

  const scoreInput = (row, key) => (
    <input
      type="number"
      min="0"
      max="100"
      inputMode="decimal"
      className="input w-20 px-2 py-1.5 text-center"
      value={valueOf(row, key)}
      placeholder="—"
      aria-label={`${t(`grades.components.${key}`)} – ${nameOf(row.student)}`}
      onChange={(e) => setValue(row, key, e.target.value)}
    />
  );

  const columns = [
    {
      key: 'student',
      header: t('common.student'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar person={row.student} size="sm" />
          <span className="font-medium text-slate-900">{nameOf(row.student)}</span>
        </div>
      ),
    },
    { key: 'homework', header: `${t('grades.components.homework')} (${fmt.percent(data?.weights.homework)})`, render: (row) => fmt.decimal(row.homework) },
    { key: 'midterm', header: `${t('grades.components.midterm')} (${fmt.percent(data?.weights.midterm)})`, render: (row) => scoreInput(row, 'midterm') },
    { key: 'final', header: `${t('grades.components.final')} (${fmt.percent(data?.weights.final)})`, render: (row) => scoreInput(row, 'final') },
    {
      key: 'weighted',
      header: t('grades.weightedFinal'),
      render: (row) => {
        const live = weightedFinal({ homework: row.homework, midterm: toNumber(valueOf(row, 'midterm')), final: toNumber(valueOf(row, 'final')) }, data.weights);
        return <GradeValue value={live.total} partial={live.partial} />;
      },
    },
  ];

  if (error) return <ErrorState onRetry={reload} />;

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <p className="text-sm text-slate-500">{t('grades.gradebookHint')}</p>
        <div className="flex gap-2">
          {dirty && <button type="button" className="btn-secondary" onClick={() => setEdits({})}>{t('common.reset')}</button>}
          <button type="button" className="btn-primary" disabled={!dirty || saving} onClick={save}>
            <Save className="h-4 w-4" aria-hidden="true" /> {saving ? t('common.saving') : t('common.saveChanges')}
          </button>
        </div>
      </div>
      <Table columns={columns} rows={data?.rows.map((r) => ({ ...r, id: r.student.id }))} loading={loading} empty={<EmptyState icon={GraduationCap} title={t('classes.noStudents')} />} />
    </div>
  );
}
