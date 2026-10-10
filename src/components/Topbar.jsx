import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Repeat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HOME_BY_ROLE, ROLES, useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useFormat, useLocalize } from '../utils/format';
import Avatar from './Avatar';
import GlobalSearch from './GlobalSearch';
import LanguageSwitcher from './LanguageSwitcher';

/** Top bar: menu button (mobile), search, language, notifications and the user menu. */
export default function Topbar({ onMenu }) {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { user, switchRole, logout } = useAuth();
  const { unread } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSwitch = async (role) => {
    setMenuOpen(false);
    await switchRole(role);
    navigate(HOME_BY_ROLE[role]);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button type="button" className="icon-btn lg:hidden" onClick={onMenu} aria-label={t('nav.openMenu')}>
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <GlobalSearch />
      </div>

      <div className="hidden sm:block">
        <LanguageSwitcher />
      </div>

      {user.role === 'student' && (
        <Link to="/student/notifications" className="icon-btn relative" aria-label={t('nav.notifications')}>
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 end-0 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white">
              {fmt.number(unread)}
            </span>
          )}
        </Link>
      )}

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Avatar person={user} size="sm" />
          <span className="hidden text-start leading-tight md:block">
            <span className="block text-sm font-medium text-slate-800">{nameOf(user)}</span>
            <span className="block text-xs text-slate-500">{t(`roles.${user.role}`)}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" aria-hidden="true" />
        </button>

        {menuOpen && (
          <div role="menu" className="absolute end-0 top-full z-40 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-800">{nameOf(user)}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <div className="px-3 py-2 sm:hidden">
              <LanguageSwitcher />
            </div>
            <div className="my-1 border-t border-slate-100" />
            <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <Repeat className="h-3 w-3" aria-hidden="true" /> {t('auth.switchRole')}
            </p>
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                role="menuitem"
                onClick={() => handleSwitch(role)}
                disabled={role === user.role}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm text-slate-700 hover:bg-slate-50 disabled:bg-primary-50 disabled:text-primary-800"
              >
                {t(`roles.${role}`)}
                {role === user.role && <span className="text-xs">{t('auth.current')}</span>}
              </button>
            ))}
            <div className="my-1 border-t border-slate-100" />
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t('auth.logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
