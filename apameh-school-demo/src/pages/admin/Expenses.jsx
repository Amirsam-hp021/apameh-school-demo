import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Plus, Receipt, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Badge from '../../components/Badge';
import Card, { StatCard } from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import { SkeletonList } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';

const EMPTY_FORM = { label: '', ref: '', amount: '' };

/**
 * "Other expenses" sheet. Amounts can be edited in place and the total
 * updates as you type. Lines flagged in the data are shown with a warning.
 */
export default function AdminExpenses() {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const { notify } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const { data, loading, error, reload, setData } = useAsync(() => api.expenses.list(), []);

  const amountFmt = useMemo(() => new Intl.NumberFormat(fmt.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [fmt.locale]);
  const items = data || [];
  const total = items.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const largest = items.reduce((max, e) => (Number(e.amount) > (Number(max?.amount) || 0) ? e : max), null);
  const flaggedCount = items.filter((e) => e.flag).length;

  // Edit locally while typing; save when the field loses focus.
  const setAmount = (id, value) => setData((list) => list.map((e) => (e.id === id ? { ...e, amount: value } : e)));
  const saveAmount = async (item) => {
    const amount = Math.max(0, Number(item.amount) || 0);
    setAmount(item.id, amount);
    await api.expenses.update(item.id, { amount });
  };

  const markChecked = async (item) => {
    await api.expenses.update(item.id, { flag: null });
    setData((list) => list.map((e) => (e.id === item.id ? { ...e, flag: null } : e)));
    notify(t('expenses.checked'));
  };

  const remove = async (item) => {
    await api.expenses.remove(item.id);
    setData((list) => list.filter((e) => e.id !== item.id));
    notify(t('expenses.removed'));
  };

  const add = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || form.amount === '') return;
    const item = await api.expenses.create({ label: form.label.trim(), ref: form.ref.trim(), amount: Math.max(0, Number(form.amount)) });
    setData((list) => [...list, item]);
    setForm(EMPTY_FORM);
    notify(t('expenses.added'));
  };

  if (error) return <ErrorState onRetry={reload} />;

  return (
    <>
      <PageHeader title={t('expenses.title')} description={t('expenses.subtitle')} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard loading={loading} icon={Receipt} label={t('expenses.total')} value={amountFmt.format(total)} />
        <StatCard loading={loading} icon={Receipt} tone="teal" label={t('expenses.largest')} value={largest ? amountFmt.format(Number(largest.amount)) : '—'} hint={largest ? tx(largest.label) : ''} />
        <StatCard loading={loading} icon={AlertTriangle} tone="amber" label={t('expenses.toCheck')} value={fmt.number(flaggedCount)} />
      </div>

      {flaggedCount > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{t('expenses.duplicateNotice')}</p>
        </div>
      )}

      <Card title={t('expenses.listTitle')} bodyClassName="p-0">
        {loading && <div className="p-5"><SkeletonList rows={6} /></div>}
        {!loading && items.length === 0 && <EmptyState icon={Receipt} title={t('expenses.empty')} />}
        {!loading && items.length > 0 && (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-3 text-start">{t('expenses.item')}</th>
                  <th scope="col" className="px-4 py-3 text-end">{t('expenses.amount')}</th>
                  <th scope="col" className="w-40 px-4 py-3 text-start">{t('expenses.share')}</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">{t('common.actions')}</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const share = total ? ((Number(item.amount) || 0) / total) * 100 : 0;
                  return (
                    <tr key={item.id} className={item.flag ? 'bg-amber-50/40' : ''}>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-800">{tx(item.label)}</span>
                          {item.ref && <Badge>{item.ref}</Badge>}
                          {item.flag && <Badge tone="amber" icon={AlertTriangle}>{t('expenses.checkDuplicate')}</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-end">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          dir="ltr"
                          className="input w-36 px-2 py-1.5 text-end tabular-nums"
                          value={item.amount}
                          onChange={(e) => setAmount(item.id, e.target.value)}
                          onBlur={() => saveAmount(item)}
                          aria-label={t('expenses.amountFor', { item: tx(item.label) })}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-primary-600" style={{ width: `${share}%` }} />
                          </div>
                          <span className="w-12 text-end text-xs text-slate-500">{fmt.percent(share)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          {item.flag && (
                            <button type="button" className="icon-btn hover:bg-emerald-50 hover:text-emerald-700" onClick={() => markChecked(item)} title={t('expenses.markChecked')} aria-label={t('expenses.markChecked')}>
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" onClick={() => remove(item)} title={t('common.delete')} aria-label={t('common.delete')}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-primary-50/60">
                  <th scope="row" className="px-4 py-3 text-start font-semibold text-slate-900">{t('expenses.totalRow')}</th>
                  <td className="px-4 py-3 text-end font-semibold tabular-nums text-slate-900">{amountFmt.format(total)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <form onSubmit={add} className="grid gap-3 border-t border-slate-100 p-4 sm:grid-cols-[1fr_8rem_10rem_auto]">
          <input className="input" placeholder={t('expenses.newLabel')} aria-label={t('expenses.newLabel')} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} dir="auto" />
          <input className="input" placeholder={t('expenses.newRef')} aria-label={t('expenses.newRef')} value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} dir="ltr" />
          <input type="number" min="0" step="0.01" className="input" placeholder={t('expenses.amount')} aria-label={t('expenses.amount')} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} dir="ltr" />
          <button type="submit" className="btn-primary" disabled={!form.label.trim() || form.amount === ''}>
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('expenses.add')}
          </button>
        </form>
      </Card>
    </>
  );
}
