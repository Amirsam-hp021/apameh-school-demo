/** Horizontal tabs that scroll on small screens. */
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="tablist" className="flex min-w-max gap-1 border-b border-slate-200">
        {tabs.map(({ key, label, icon: Icon }) => {
          const selected = key === active;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                selected ? 'border-primary-700 text-primary-800' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
