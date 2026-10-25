import { NavLink } from 'react-router-dom';
import { GraduationCap, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { NAVIGATION } from '../routes/navigation';
import { useFormat } from '../utils/format';

/**
 * Role-based navigation. Fixed on large screens, a slide-in drawer on mobile.
 */
export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { unread } = useNotifications();
  const fmt = useFormat();
  const items = NAVIGATION[user.role] || [];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-64 flex-col bg-primary-950 text-white transition-[transform,visibility] duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 lg:rtl:translate-x-0 ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full rtl:translate-x-full lg:visible'
        }`}
        aria-label={t('nav.main')}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/20 text-accent-300">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{t('app.shortName')}</p>
              <p className="text-[11px] text-white/60">{t(`roles.${user.role}`)}</p>
            </div>
          </div>
          <button type="button" className="rounded-md p-1.5 text-white/70 hover:bg-white/10 lg:hidden" onClick={onClose} aria-label={t('common.close')}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-accent-300' : ''}`} aria-hidden="true" />
                  <span className="flex-1">{t(label)}</span>
                  {badge === 'unread' && unread > 0 && (
                    <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-semibold text-white">{fmt.number(unread)}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 rounded-xl bg-white/5 p-3 text-xs text-white/60">{t('demo.sidebarNote')}</div>
      </aside>
    </>
  );
}
