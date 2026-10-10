import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/Modal';

const TYPE_OPTIONS = ['pdf', 'doc', 'image', 'audio', 'video'];

/** Default due date: one week from now at 23:59, in <input type="datetime-local"> format. */
function defaultDue() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const initial = () => ({ title: '', description: '', dueDate: defaultDue(), allowedTypes: ['pdf'], maxSizeMb: 10, allowLate: false });

/** Create-assignment form. The parent decides what to do with `status` (draft / published). */
export default function AssignmentFormModal({ open, onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial());
      setErrors({});
    }
  }, [open]);

  const toggleType = (type) =>
    setForm((f) => ({
      ...f,
      allowedTypes: f.allowedTypes.includes(type) ? f.allowedTypes.filter((x) => x !== type) : [...f.allowedTypes, type],
    }));

  const submit = async (status) => {
    const next = {};
    if (!form.title.trim()) next.title = t('validation.required');
    if (!form.dueDate) next.dueDate = t('validation.required');
    if (form.allowedTypes.length === 0) next.allowedTypes = t('assignments.form.pickType');
    if (!(form.maxSizeMb >= 1 && form.maxSizeMb <= 500)) next.maxSizeMb = t('assignments.form.sizeRange');
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    await onSave({ ...form, title: form.title.trim(), dueDate: new Date(form.dueDate).toISOString(), status });
    setSaving(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('assignments.form.title')}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => submit('draft')}>{t('assignments.form.saveDraft')}</button>
          <button type="button" className="btn-primary" disabled={saving} onClick={() => submit('published')}>{t('assignments.form.publish')}</button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="as-title">{t('assignments.form.fields.title')}</label>
          <input id="as-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} dir="auto" />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="as-desc">{t('assignments.form.fields.description')}</label>
          <textarea id="as-desc" rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} dir="auto" />
        </div>
        <div>
          <label className="label" htmlFor="as-due">{t('assignments.form.fields.dueDate')}</label>
          <input id="as-due" type="datetime-local" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>}
        </div>
        <div>
          <label className="label" htmlFor="as-size">{t('assignments.form.fields.maxSize')}</label>
          <input id="as-size" type="number" min="1" max="500" className="input" value={form.maxSizeMb} onChange={(e) => setForm({ ...form, maxSizeMb: Number(e.target.value) })} />
          {errors.maxSizeMb && <p className="mt-1 text-xs text-red-600">{errors.maxSizeMb}</p>}
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="label">{t('assignments.form.fields.allowedTypes')}</legend>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((type) => {
              const checked = form.allowedTypes.includes(type);
              return (
                <label key={type} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-700" checked={checked} onChange={() => toggleType(type)} />
                  {t(`fileTypes.${type}`)}
                </label>
              );
            })}
          </div>
          {errors.allowedTypes && <p className="mt-1 text-xs text-red-600">{errors.allowedTypes}</p>}
        </fieldset>
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 sm:col-span-2">
          <span>
            <span className="block text-sm font-medium text-slate-800">{t('assignments.form.fields.allowLate')}</span>
            <span className="block text-xs text-slate-500">{t('assignments.form.allowLateHint')}</span>
          </span>
          <input type="checkbox" role="switch" className="h-5 w-5 rounded border-slate-300 text-primary-700" checked={form.allowLate} onChange={(e) => setForm({ ...form, allowLate: e.target.checked })} />
        </label>
      </form>
    </Modal>
  );
}
