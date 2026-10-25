import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/Modal';

const EMPTY = { nameEn: '', nameFa: '', email: '', phone: '', role: 'student', status: 'active' };

/** Add / edit user form. `user` is null for "add". */
export default function UserFormModal({ open, user, onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(user ? { ...EMPTY, ...user } : EMPTY);
      setErrors({});
    }
  }, [open, user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.nameEn.trim()) next.nameEn = t('validation.required');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = t('validation.email');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? t('admin.users.editUser') : t('admin.users.addUser')}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" form="user-form" className="btn-primary" disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div>
          <label className="label" htmlFor="u-name-en">{t('admin.users.fields.nameEn')}</label>
          <input id="u-name-en" className="input" value={form.nameEn} onChange={set('nameEn')} dir="ltr" />
          {errors.nameEn && <p className="mt-1 text-xs text-red-600">{errors.nameEn}</p>}
        </div>
        <div>
          <label className="label" htmlFor="u-name-fa">{t('admin.users.fields.nameFa')}</label>
          <input id="u-name-fa" className="input" value={form.nameFa} onChange={set('nameFa')} dir="rtl" />
        </div>
        <div>
          <label className="label" htmlFor="u-email">{t('admin.users.fields.email')}</label>
          <input id="u-email" type="email" className="input" value={form.email} onChange={set('email')} dir="ltr" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="u-phone">{t('admin.users.fields.phone')}</label>
          <input id="u-phone" className="input" value={form.phone} onChange={set('phone')} dir="ltr" />
        </div>
        <div>
          <label className="label" htmlFor="u-role">{t('admin.users.fields.role')}</label>
          <select id="u-role" className="input" value={form.role} onChange={set('role')}>
            {['admin', 'teacher', 'student', 'parent'].map((r) => (
              <option key={r} value={r}>{t(`roles.${r}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="u-status">{t('admin.users.fields.status')}</label>
          <select id="u-status" className="input" value={form.status} onChange={set('status')}>
            {['active', 'inactive', 'suspended'].map((s) => (
              <option key={s} value={s}>{t(`status.${s}`)}</option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
