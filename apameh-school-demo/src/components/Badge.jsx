import { useTranslation } from 'react-i18next';

const TONES = {
  gray: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-primary-50 text-primary-800 ring-primary-200',
  teal: 'bg-accent-50 text-accent-800 ring-accent-200',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  purple: 'bg-violet-50 text-violet-800 ring-violet-200',
};

/** Small coloured label. */
export default function Badge({ tone = 'gray', icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}>
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Tone used for every status value in the app. */
const STATUS_TONES = {
  // payments
  verified: 'green', pending: 'amber', failed: 'red', expired: 'gray',
  // assignments
  draft: 'gray', published: 'teal', closed: 'purple',
  // submissions
  not_submitted: 'gray', submitted: 'blue', late: 'amber', reviewed: 'green', returned: 'purple',
  // users
  active: 'green', inactive: 'gray', suspended: 'red',
  // backups
  completed: 'green', in_progress: 'blue',
  // attendance
  present: 'green', absent: 'red',
};

/** Badge with a translated status label: <StatusBadge status="pending" />. */
export function StatusBadge({ status }) {
  const { t } = useTranslation();
  return <Badge tone={STATUS_TONES[status] || 'gray'}>{t(`status.${status}`)}</Badge>;
}
