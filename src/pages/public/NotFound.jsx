import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DemoBanner from '../../components/DemoBanner';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { HOME_BY_ROLE, useAuth } from '../../context/AuthContext';

/** Friendly page for unknown routes. */
export default function NotFound() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const home = user ? HOME_BY_ROLE[user.role] : '/';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DemoBanner />
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Compass className="h-10 w-10" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-accent-700">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{t('notFound.title')}</h1>
        <p className="mt-2 max-w-md text-slate-500">{t('notFound.text')}</p>
        <Link to={home} className="btn-primary mt-6">
          {user ? t('notFound.backToDashboard') : t('notFound.backHome')}
        </Link>
      </main>
    </div>
  );
}
