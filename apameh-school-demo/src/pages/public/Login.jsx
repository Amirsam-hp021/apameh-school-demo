import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Loader2, ShieldCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DemoBanner from '../../components/DemoBanner';
import { HOME_BY_ROLE, useAuth } from '../../context/AuthContext';
import PublicHeader from './PublicHeader';

const ROLE_CARDS = [
  { role: 'admin', icon: ShieldCheck, tone: 'bg-primary-50 text-primary-700' },
  { role: 'teacher', icon: BookOpen, tone: 'bg-accent-50 text-accent-700' },
  { role: 'student', icon: GraduationCap, tone: 'bg-amber-50 text-amber-700' },
  { role: 'parent', icon: Users, tone: 'bg-violet-50 text-violet-700' },
];

/** Demo login: pick a role, no password needed. */
export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [busyRole, setBusyRole] = useState(null);

  const handleLogin = async (role) => {
    setBusyRole(role);
    await login(role);
    navigate(HOME_BY_ROLE[role], { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
      <DemoBanner />
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{t('auth.title')}</h1>
          <p className="mt-2 text-white/70">{t('auth.subtitle')}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {ROLE_CARDS.map(({ role, icon: Icon, tone }) => (
            <button
              key={role}
              type="button"
              disabled={busyRole !== null}
              onClick={() => handleLogin(role)}
              className="card group flex items-start gap-4 p-5 text-start transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                {busyRole === role ? <Loader2 className="h-6 w-6 animate-spin" /> : <Icon className="h-6 w-6" aria-hidden="true" />}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">{t(`roles.${role}`)}</span>
                <span className="mt-0.5 block text-sm text-slate-500">{t(`auth.roleDescriptions.${role}`)}</span>
                <span className="mt-3 inline-block text-xs font-medium text-primary-700 group-hover:underline">
                  {t('auth.loginAs', { name: t(`auth.demoNames.${role}`) })}
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-white/60">{t('auth.noPassword')}</p>
      </main>
    </div>
  );
}
