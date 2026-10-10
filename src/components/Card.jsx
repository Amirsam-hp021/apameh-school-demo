/** Basic white card with an optional header (title, subtitle, action). */
export default function Card({ title, subtitle, action, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

const TONES = {
  blue: 'bg-primary-50 text-primary-700',
  teal: 'bg-accent-50 text-accent-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-violet-50 text-violet-700',
};

/** Headline number with an icon, used on dashboards. */
export function StatCard({ icon: Icon, label, value, hint, tone = 'blue', loading }) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        {loading ? (
          <div className="mt-2 h-7 w-20 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className="mt-1 text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">{value}</p>
        )}
        {hint && !loading && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}
