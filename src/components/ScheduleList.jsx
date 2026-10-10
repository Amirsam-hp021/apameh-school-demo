import { Clock } from 'lucide-react';
import { useFormat } from '../utils/format';

/** Compact list of a class's weekly slots, e.g. "Saturday 09:00 – 10:30". */
export default function ScheduleList({ schedule, className = '' }) {
  const fmt = useFormat();
  return (
    <ul className={`space-y-1 text-sm text-slate-600 ${className}`}>
      {schedule.map((slot) => (
        <li key={`${slot.day}-${slot.start}`} className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span>
            {fmt.weekdayOf(slot.day)} <span className="whitespace-nowrap">{fmt.clock(slot.start)} – {fmt.clock(slot.end)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
