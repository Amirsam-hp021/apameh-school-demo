import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { useLocalize } from '../../utils/format';

/** Banner naming the linked child and reminding that the parent view is read only. */
export default function ChildHeader({ child }) {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  if (!child) return null;
  return (
    <div className="card mb-6 flex flex-wrap items-center gap-4 p-5">
      <Avatar person={child} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500">{t('parent.viewingChild')}</p>
        <p className="text-lg font-semibold text-slate-900">{nameOf(child)}</p>
      </div>
      <Badge tone="gray" icon={Eye}>{t('parent.readOnly')}</Badge>
    </div>
  );
}
