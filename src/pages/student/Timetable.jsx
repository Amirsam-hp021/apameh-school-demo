import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { addDays, endOfMonth, format, getDay, parse, startOfMonth, startOfWeek } from 'date-fns';
import { enGB, faIR } from 'date-fns/locale';
import { Clock, DoorOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { api } from '../../api';
import ErrorState from '../../components/ErrorState';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { en: enGB, fa: faIR } }); // weeks start Monday (en) / Saturday (fa)
const DEADLINE_COLOR = '#dc2626';

/** Calendar labels via Intl so Farsi gets Persian digits (Gregorian calendar to match the grid). */
function useCalendarFormats(lang) {
  return useMemo(() => {
    const locale = lang === 'fa' ? 'fa-IR-u-ca-gregory' : 'en-US';
    const f = (opts) => new Intl.DateTimeFormat(locale, opts);
    const time = f({ hour: '2-digit', minute: '2-digit' });
    const dayShort = f({ weekday: 'short', day: 'numeric' });
    const weekday = f({ weekday: 'short' });
    const day = f({ day: 'numeric' });
    const full = f({ weekday: 'long', month: 'long', day: 'numeric' });
    const short = f({ month: 'short', day: 'numeric' });
    const monthYear = f({ month: 'long', year: 'numeric' });
    const range = ({ start, end }) => `${time.format(start)} – ${time.format(end)}`;
    return {
      timeGutterFormat: (d) => time.format(d),
      eventTimeRangeFormat: range,
      agendaTimeRangeFormat: range,
      agendaTimeFormat: (d) => time.format(d),
      dayFormat: (d) => dayShort.format(d),
      weekdayFormat: (d) => weekday.format(d),
      dateFormat: (d) => day.format(d),
      dayHeaderFormat: (d) => full.format(d),
      agendaDateFormat: (d) => full.format(d),
      dayRangeHeaderFormat: ({ start, end }) => `${short.format(start)} – ${short.format(end)}`,
      agendaHeaderFormat: ({ start, end }) => `${short.format(start)} – ${short.format(end)}`,
      monthHeaderFormat: (d) => monthYear.format(d),
    };
  }, [lang]);
}

/** Weekly timetable with class sessions and assignment deadlines. */
export default function StudentTimetable() {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const { lang, isRtl } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(() => (window.innerWidth < 768 ? 'day' : 'week'));
  const [selected, setSelected] = useState(null);
  const formats = useCalendarFormats(lang);

  // Load a window around the visible month; reload only when the month changes.
  const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
  const { data, loading, error, reload } = useAsync(
    () => api.timetable.forStudent(user.id, addDays(startOfMonth(date), -7).toISOString(), addDays(endOfMonth(date), 7).toISOString()),
    [user.id, monthKey],
  );

  const events = useMemo(
    () =>
      (data || []).map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
        label: e.type === 'deadline' ? t('timetable.deadline', { title: tx(e.title) }) : e.title,
      })),
    [data, t, tx],
  );

  const legend = useMemo(() => {
    const map = new Map();
    events.filter((e) => e.type === 'class').forEach((e) => map.set(e.classId, { name: e.title, color: e.color }));
    return [...map.values()];
  }, [events]);

  const messages = useMemo(
    () => ({
      date: t('timetable.messages.date'),
      time: t('timetable.messages.time'),
      event: t('timetable.messages.event'),
      allDay: t('timetable.messages.allDay'),
      week: t('timetable.messages.week'),
      work_week: t('timetable.messages.workWeek'),
      day: t('timetable.messages.day'),
      month: t('timetable.messages.month'),
      previous: t('timetable.messages.previous'),
      next: t('timetable.messages.next'),
      yesterday: t('timetable.messages.yesterday'),
      tomorrow: t('timetable.messages.tomorrow'),
      today: t('timetable.messages.today'),
      agenda: t('timetable.messages.agenda'),
      noEventsInRange: t('timetable.messages.noEvents'),
      showMore: (total) => t('timetable.messages.showMore', { n: fmt.number(total) }),
    }),
    [t, fmt],
  );

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: event.type === 'deadline' ? DEADLINE_COLOR : event.color,
      color: '#fff',
      ...(event.type === 'deadline' ? { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.12) 0 6px, transparent 6px 12px)' } : {}),
    },
  });

  const onSelectEvent = (event) => {
    if (event.type === 'deadline') navigate(`/student/assignments/${event.assignmentId}`);
    else setSelected(event);
  };

  return (
    <>
      <PageHeader title={t('nav.timetable')} description={t('timetable.subtitle')} />
      {error && <ErrorState onRetry={reload} />}
      <div className="card p-3 sm:p-5">
        <div className="relative h-[680px]">
          {loading && !data && <Skeleton className="absolute inset-0 z-10" />}
          <Calendar
            localizer={localizer}
            culture={lang}
            rtl={isRtl}
            events={events}
            titleAccessor="label"
            date={date}
            view={view}
            onNavigate={setDate}
            onView={setView}
            views={['month', 'week', 'day', 'agenda']}
            min={new Date(1970, 0, 1, 8, 0)}
            max={new Date(1970, 0, 1, 21, 0)}
            messages={messages}
            formats={formats}
            eventPropGetter={eventPropGetter}
            onSelectEvent={onSelectEvent}
            popup
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          {legend.map((l) => (
            <span key={l.name} className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded" style={{ backgroundColor: l.color }} aria-hidden="true" />{l.name}</span>
          ))}
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded" style={{ backgroundColor: DEADLINE_COLOR }} aria-hidden="true" />{t('timetable.deadlineLegend')}</span>
        </div>
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || ''} size="sm">
        {selected && (
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />{fmt.weekday(selected.start)} · {fmt.date(selected.start)} · {fmt.time(selected.start)} – {fmt.time(selected.end)}</li>
            <li className="flex items-center gap-2"><DoorOpen className="h-4 w-4 text-slate-400" aria-hidden="true" />{t('classes.room', { room: fmt.number(Number(selected.room)) })}</li>
          </ul>
        )}
      </Modal>
    </>
  );
}
