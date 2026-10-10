import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, School, FileText, FolderOpen, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useAsync';
import { useLocalize } from '../utils/format';

/** Where a search result should take each role. */
function targetFor(role, type, item) {
  const base = role === 'admin' ? '/admin/classes' : '/teacher/classes';
  switch (type) {
    case 'students':
      if (role === 'admin') return `/admin/users?q=${encodeURIComponent(item.nameEn)}`;
      return item.classId ? `${base}/${item.classId}?tab=students` : null;
    case 'classes':
      if (role === 'student') return '/student/classes';
      if (role === 'parent') return '/parent/grades';
      return `${base}/${item.id}`;
    case 'materials':
      if (role === 'student') return '/student/materials';
      return `${base}/${item.classId}?tab=materials`;
    case 'assignments':
      if (role === 'student') return `/student/assignments/${item.id}`;
      if (role === 'parent') return '/parent/deadlines';
      return `${base}/${item.classId}?tab=assignments`;
    default:
      return null;
  }
}

const GROUPS = [
  { key: 'students', icon: User },
  { key: 'classes', icon: School },
  { key: 'materials', icon: FolderOpen },
  { key: 'assignments', icon: FileText },
];

/** Search box in the top bar with grouped results in a dropdown. */
export default function GlobalSearch() {
  const { t } = useTranslation();
  const { tx, nameOf } = useLocalize();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const debounced = useDebounce(query, 250);
  const boxRef = useRef(null);

  useEffect(() => {
    let active = true;
    if (debounced.trim().length < 2) {
      setResults(null);
      return undefined;
    }
    setLoading(true);
    api.search.global(debounced, user).then((r) => {
      if (active) {
        setResults(r);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [debounced, user]);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (type, item) => {
    const to = targetFor(user.role, type, item);
    if (to) navigate(to);
    setOpen(false);
    setQuery('');
  };

  const labelOf = (type, item) => {
    if (type === 'students') return nameOf(item);
    if (type === 'classes') return item.name;
    if (type === 'materials') return item.name;
    return tx(item.title);
  };

  const total = results ? GROUPS.reduce((n, g) => n + results[g.key].length, 0) : 0;

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.placeholder')}
        className="input bg-slate-50 ps-9"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> {t('search.searching')}
            </div>
          )}
          {!loading && results && total === 0 && <p className="px-3 py-4 text-sm text-slate-500">{t('search.noResults', { query })}</p>}
          {!loading &&
            results &&
            GROUPS.filter((g) => results[g.key].length > 0).map(({ key, icon: Icon }) => (
              <div key={key} className="py-1">
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t(`search.groups.${key}`)}</p>
                {results[key].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(key, item)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm hover:bg-slate-50"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-slate-700">{labelOf(key, item)}</span>
                    {item.class && <span className="hidden truncate text-xs text-slate-400 sm:block">{item.class.name}</span>}
                  </button>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
