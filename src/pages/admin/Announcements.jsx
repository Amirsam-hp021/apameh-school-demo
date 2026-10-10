import { useState } from 'react';
import { Megaphone, Send, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import { SkeletonList } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';

const AUDIENCES = ['all', 'students', 'teachers', 'parents'];
const AUDIENCE_TONES = { all: 'blue', students: 'teal', teachers: 'purple', parents: 'amber' };

export default function AdminAnnouncements() {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { data, loading, error, reload } = useAsync(() => api.announcements.list({ role: 'admin' }), []);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = t('validation.required');
    if (!form.body.trim()) next.body = t('validation.required');
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    await api.announcements.create(form, user.id);
    setSaving(false);
    setForm({ title: '', body: '', audience: 'all' });
    notify(t('admin.announcements.published'));
    reload({ silent: true });
  };

  const remove = async (id) => {
    await api.announcements.remove(id);
    notify(t('admin.announcements.deleted'));
    reload({ silent: true });
  };

  return (
    <>
      <PageHeader title={t('admin.announcements.title')} description={t('admin.announcements.subtitle')} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 lg:self-start" title={t('admin.announcements.create')}>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="an-title">{t('admin.announcements.fields.title')}</label>
              <input id="an-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>
            <div>
              <label className="label" htmlFor="an-body">{t('admin.announcements.fields.body')}</label>
              <textarea id="an-body" rows={5} className="input" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
            </div>
            <div>
              <label className="label" htmlFor="an-aud">{t('admin.announcements.fields.audience')}</label>
              <select id="an-aud" className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                {AUDIENCES.map((a) => <option key={a} value={a}>{t(`audiences.${a}`)}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" /> {saving ? t('common.saving') : t('admin.announcements.publish')}
            </button>
          </form>
        </Card>

        <Card className="lg:col-span-3" title={t('admin.announcements.list')}>
          {error && <ErrorState onRetry={reload} />}
          {loading && <SkeletonList rows={5} />}
          {!loading && !error && data.length === 0 && <EmptyState icon={Megaphone} title={t('announcements.empty')} />}
          {!loading && !error && (
            <ul className="divide-y divide-slate-100">
              {data.map((a) => (
                <li key={a.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-slate-900">{tx(a.title)}</h3>
                      <Badge tone={AUDIENCE_TONES[a.audience]}>{t(`audiences.${a.audience}`)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{tx(a.body)}</p>
                    <p className="mt-2 text-xs text-slate-400">{fmt.dateTime(a.createdAt)}</p>
                  </div>
                  <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" onClick={() => remove(a.id)} aria-label={t('common.delete')}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
