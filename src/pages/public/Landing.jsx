import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, CalendarDays, ClipboardCheck, CreditCard, Globe2, MessagesSquare, ShieldCheck, Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DemoBanner from '../../components/DemoBanner';
import PublicHeader from './PublicHeader';

const FEATURES = [
  { key: 'roles', icon: Users },
  { key: 'assignments', icon: ClipboardCheck },
  { key: 'timetable', icon: CalendarDays },
  { key: 'payments', icon: CreditCard },
  { key: 'forum', icon: MessagesSquare },
  { key: 'reports', icon: BarChart3 },
  { key: 'bilingual', icon: Globe2 },
  { key: 'security', icon: ShieldCheck },
];

/** Public landing page with a short intro and the "Enter Demo" call to action. */
export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50">
      <DemoBanner />
      <div className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
        <PublicHeader />
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 text-center sm:px-6 sm:pt-16">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-accent-200">
            {t('landing.eyebrow')}
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl sm:leading-tight">
            {t('landing.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/75 sm:text-lg">{t('landing.intro')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="btn bg-accent-500 px-6 py-3 text-base text-white hover:bg-accent-400">
              {t('landing.enterDemo')}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {['roles', 'languages', 'modules', 'backend'].map((k) => (
              <div key={k} className="rounded-xl bg-white/5 px-4 py-4 ring-1 ring-white/10">
                <dt className="text-xs text-white/60">{t(`landing.stats.${k}.label`)}</dt>
                <dd className="mt-1 text-xl font-semibold text-white">{t(`landing.stats.${k}.value`)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-slate-900">{t('landing.featuresTitle')}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-500">{t('landing.featuresSubtitle')}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, icon: Icon }) => (
            <div key={key} className="card p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-slate-900">{t(`landing.features.${key}.title`)}</h3>
              <p className="mt-1 text-sm text-slate-500">{t(`landing.features.${key}.text`)}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/login" className="btn-primary px-6 py-3">
            {t('landing.enterDemo')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        {t('landing.footer', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
