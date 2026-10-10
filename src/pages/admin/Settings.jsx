import { useEffect, useState } from 'react';
import { Info, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Card from '../../components/Card';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat } from '../../utils/format';

const WEIGHT_KEYS = ['homework', 'midterm', 'final'];

/** School settings. Everything is editable, but the demo does not save changes. */
export default function AdminSettings() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { notify } = useToast();
  const { data, loading, error, reload } = useAsync(() => api.settings.get(), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(structuredClone(data));
  }, [data]);

  if (error) return <ErrorState onRetry={reload} />;

  const totalWeight = form ? WEIGHT_KEYS.reduce((sum, k) => sum + (Number(form.weights[k]) || 0), 0) : 0;
  const weightsValid = totalWeight === 100;

  const setField = (path, value) =>
    setForm((f) => {
      const next = structuredClone(f);
      const keys = path.split('.');
      let obj = next;
      keys.slice(0, -1).forEach((k) => {
        obj = obj[k];
      });
      obj[keys[keys.length - 1]] = value;
      return next;
    });

  const save = async (e) => {
    e.preventDefault();
    if (!weightsValid) return;
    setSaving(true);
    await api.settings.update(form);
    setSaving(false);
    notify(t('admin.settings.notSaved'), 'info');
  };

  return (
    <>
      <PageHeader title={t('admin.settings.title')} description={t('admin.settings.subtitle')} />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>{t('admin.settings.demoNotice')}</p>
      </div>

      {loading || !form ? (
        <div className="card space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <form onSubmit={save} className="space-y-6">
          <Card title={t('admin.settings.general')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="s-name-en">{t('admin.settings.schoolNameEn')}</label>
                <input id="s-name-en" className="input" dir="ltr" value={form.schoolName.en} onChange={(e) => setField('schoolName.en', e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="s-name-fa">{t('admin.settings.schoolNameFa')}</label>
                <input id="s-name-fa" className="input" dir="rtl" value={form.schoolName.fa} onChange={(e) => setField('schoolName.fa', e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="s-email">{t('admin.settings.email')}</label>
                <input id="s-email" className="input" dir="ltr" value={form.email} onChange={(e) => setField('email', e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="s-phone">{t('admin.settings.phone')}</label>
                <input id="s-phone" className="input" dir="ltr" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="s-year">{t('admin.settings.academicYear')}</label>
                <input id="s-year" className="input" dir="ltr" value={form.academicYear} onChange={(e) => setField('academicYear', e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="s-currency">{t('admin.settings.currency')}</label>
                <select id="s-currency" className="input" value={form.currency} onChange={(e) => setField('currency', e.target.value)}>
                  <option value="IRT">{t('admin.settings.currencies.IRT')}</option>
                  <option value="IRR">{t('admin.settings.currencies.IRR')}</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title={t('admin.settings.gradeWeights')} subtitle={t('admin.settings.gradeWeightsHint')}>
            <div className="grid gap-4 sm:grid-cols-3">
              {WEIGHT_KEYS.map((k) => (
                <div key={k}>
                  <label className="label" htmlFor={`w-${k}`}>{t(`grades.components.${k}`)}</label>
                  <div className="relative">
                    <input
                      id={`w-${k}`}
                      type="number"
                      min="0"
                      max="100"
                      className="input pe-8"
                      value={form.weights[k]}
                      onChange={(e) => setField(`weights.${k}`, e.target.value === '' ? '' : Number(e.target.value))}
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className={`mt-3 text-sm ${weightsValid ? 'text-emerald-700' : 'text-red-600'}`}>
              {t('admin.settings.weightTotal', { total: fmt.number(totalWeight) })}{!weightsValid && ` · ${t('admin.settings.weightMustBe100')}`}
            </p>
          </Card>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setForm(structuredClone(data))}>{t('common.reset')}</button>
            <button type="submit" className="btn-primary" disabled={!weightsValid || saving}>
              <Save className="h-4 w-4" aria-hidden="true" /> {saving ? t('common.saving') : t('common.saveChanges')}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
