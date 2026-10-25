import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, Save, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api';
import Avatar from '../../../components/Avatar';
import Badge from '../../../components/Badge';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import { SkeletonList } from '../../../components/Skeleton';
import { useToast } from '../../../context/ToastContext';
import { useAsync } from '../../../hooks/useAsync';
import { toDateKey } from '../../../utils/date';
import { useFormat, useLocalize } from '../../../utils/format';
import { sessionsInRange } from '../../../utils/schedule';

const MARKS = [
  { key: 'present', active: 'bg-emerald-600 text-white border-emerald-600' },
  { key: 'late', active: 'bg-amber-500 text-white border-amber-500' },
  { key: 'absent', active: 'bg-red-600 text-white border-red-600' },
];

/** Roster with present / late / absent toggles for a chosen date. */
export default function AttendanceTab({ cls }) {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { notify } = useToast();
  const [date, setDate] = useState(toDateKey(new Date()));
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const roster = useAsync(() => api.classes.students(cls.id), [cls.id]);
  const sheet = useAsync(() => api.attendance.getSheet(cls.id, date), [cls.id, date]);

  useEffect(() => {
    if (sheet.data) setMarks(sheet.data.marks);
  }, [sheet.data]);

  // Quick links to this class's recent session dates.
  const recentDates = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 21);
    return sessionsInRange([cls], from, to).map((s) => toDateKey(s.start)).reverse().slice(0, 6);
  }, [cls]);

  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0 };
    Object.values(marks).forEach((m) => { c[m] += 1; });
    return c;
  }, [marks]);

  const save = async () => {
    setSaving(true);
    await api.attendance.saveSheet(cls.id, date, marks);
    setSaving(false);
    notify(t('attendance.saved', { date: fmt.date(`${date}T12:00:00`) }));
    sheet.reload({ silent: true });
  };

  const loading = roster.loading || sheet.loading;

  return (
    <div className="card">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label className="label" htmlFor="att-date">{t('attendance.date')}</label>
            <input id="att-date" type="date" className="input sm:w-48" value={date} max={toDateKey(new Date())} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentDates.map((d) => (
              <button key={d} type="button" onClick={() => setDate(d)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${d === date ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {fmt.date(`${d}T12:00:00`)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sheet.data && <Badge tone={sheet.data.saved ? 'green' : 'gray'}>{sheet.data.saved ? t('attendance.recorded') : t('attendance.notRecorded')}</Badge>}
          <button type="button" className="btn-secondary" onClick={() => setMarks(Object.fromEntries(Object.keys(marks).map((k) => [k, 'present'])))}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" /> {t('attendance.markAllPresent')}
          </button>
          <button type="button" className="btn-primary" onClick={save} disabled={loading || saving}>
            <Save className="h-4 w-4" aria-hidden="true" /> {saving ? t('common.saving') : t('attendance.save')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-b border-slate-100 px-4 py-3 text-sm">
        {MARKS.map(({ key }) => (
          <span key={key} className="text-slate-600">{t(`status.${key}`)}: <strong className="text-slate-900">{fmt.number(counts[key])}</strong></span>
        ))}
      </div>

      {(roster.error || sheet.error) && <ErrorState onRetry={() => { roster.reload(); sheet.reload(); }} />}
      {loading && <div className="p-4"><SkeletonList rows={5} /></div>}
      {!loading && roster.data?.length === 0 && <EmptyState icon={Users} title={t('classes.noStudents')} />}
      {!loading && roster.data?.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {roster.data.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                <Avatar person={s} size="sm" />
                <span className="font-medium text-slate-800">{nameOf(s)}</span>
              </div>
              <div className="flex gap-1.5" role="group" aria-label={t('attendance.markFor', { name: nameOf(s) })}>
                {MARKS.map(({ key, active }) => {
                  const on = marks[s.id] === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setMarks((m) => ({ ...m, [s.id]: key }))}
                      className={`min-w-[78px] rounded-lg border px-3 py-1.5 text-xs font-medium transition ${on ? active : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      {t(`status.${key}`)}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
