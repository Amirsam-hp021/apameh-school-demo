import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

/** Header used on the public pages. `variant="light"` is for white backgrounds. */
export default function PublicHeader({ variant = 'dark' }) {
  const dark = variant === 'dark';
  const { t } = useTranslation();
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Link to="/" className={`flex items-center gap-2.5 ${dark ? 'text-white' : 'text-primary-950'}`}>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${dark ? 'bg-accent-500/20 text-accent-300' : 'bg-primary-900 text-accent-300'}`}>
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="font-semibold">{t('app.name')}</span>
      </Link>
      <LanguageSwitcher variant={variant} />
    </header>
  );
}
