import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import DemoBanner from '../../components/DemoBanner';
import { Skeleton } from '../../components/Skeleton';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';
import PublicHeader from './PublicHeader';

const ROLES = ['admin', 'teacher', 'student', 'parent'];

/** A real slice of the sample data: the demo student's next few classes and deadlines. */
function WeekPreview() {
  const { t } = useTranslation();
  const { tx } = useLocalize();
  const fmt = useFormat();
  const { data, loading } = useAsync(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 7);
    return api.timetable.forStudent('s1', from.toISOString(), to.toISOString());
  }, []);
  const items = (data || [])
    .filter((e) => new Date(e.end) > new Date())
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{t('landing.preview.title')}</p>
      <p className="text-xs text-slate-500">{t('landing.preview.subtitle')}</p>
      <ul className="mt-4 space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
        {items.map((e) => (
          <li key={e.id} className="flex items-center gap-3">
            <span
              className="h-9 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: e.type === 'deadline' ? '#dc2626' : e.color }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-800">
                {e.type === 'deadline' ? t('timetable.deadline', { title: tx(e.title) }) : e.title}
              </p>
              <p className="text-xs text-slate-500">
                {fmt.weekday(e.start)}
                {e.type === 'class' && ` · ${fmt.time(e.start)} · ${t('classes.room', { room: fmt.number(Number(e.room)) })}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Public landing page: a short note to the Apameh team and a way into the demo. */
export default function Landing() {
  const { t } = useTranslation();
  const fmt = useFormat();
  // Persian (Solar Hijri) year in Farsi, Gregorian in English.
  const year = new Intl.DateTimeFormat(fmt.locale, { year: 'numeric' }).format(new Date());

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <DemoBanner />
      <PublicHeader variant="light" />

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <section className="grid items-center gap-10 py-12 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <p className="text-sm text-accent-700">{t('landing.hello')}</p>
            <h1 className="mt-3 text-3xl font-bold leading-snug text-primary-950 sm:text-4xl">{t('landing.title')}</h1>
            <p className="mt-4 max-w-xl text-slate-600">{t('landing.intro')}</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link to="/login" className="btn-primary px-5 py-2.5">
                {t('landing.enterDemo')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
              <span className="text-sm text-slate-500">{t('landing.enterHint')}</span>
            </div>
          </div>
          <WeekPreview />
        </section>

        <section className="border-t border-slate-200 py-12">
          <h2 className="text-lg font-semibold text-primary-950">{t('landing.tryTitle')}</h2>
          <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {ROLES.map((role) => (
              <div key={role}>
                <h3 className="font-medium text-slate-900">{t(`landing.try.${role}.title`)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{t(`landing.try.${role}.text`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-xl bg-amber-50 p-5 text-sm text-amber-900">
          <h2 className="font-semibold">{t('landing.notReal.title')}</h2>
          <p className="mt-1 leading-relaxed">{t('landing.notReal.text')}</p>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        {t('landing.footer', { year })}
      </footer>
    </div>
  );
}
