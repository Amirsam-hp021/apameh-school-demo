import { useFormat } from '../utils/format';

const TONES = {
  blue: 'bg-primary-600',
  teal: 'bg-accent-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

/** Horizontal progress bar (0-100). */
export default function ProgressBar({ value = 0, tone = 'teal', showLabel = false, label, className = '' }) {
  const fmt = useFormat();
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{label}</span>
          {showLabel && <span className="font-medium text-slate-700">{fmt.percent(Math.round(clamped))}</span>}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={`h-full rounded-full transition-all duration-500 ${TONES[tone]}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
