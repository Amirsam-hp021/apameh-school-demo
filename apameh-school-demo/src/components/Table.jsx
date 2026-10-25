import { useTranslation } from 'react-i18next';
import EmptyState from './EmptyState';
import { Skeleton } from './Skeleton';

/**
 * Data table that scrolls horizontally on small screens.
 *
 * columns: [{ key, header, render?: (row) => node, className?, headerClassName? }]
 */
export default function Table({ columns, rows, loading, rowKey = 'id', empty, skeletonRows = 5, onRowClick, minWidth = 640 }) {
  const { t } = useTranslation();
  const showEmpty = !loading && (!rows || rows.length === 0);

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={`whitespace-nowrap px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.headerClassName || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`sk-${i}`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          {!loading &&
            rows?.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle text-slate-700 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {showEmpty && (empty || <EmptyState title={t('common.noResults')} description={t('common.noResultsHint')} />)}
    </div>
  );
}

/** Simple previous / next pagination with a "showing x-y of z" label. */
export function Pagination({ page, pageSize, total, onChange }) {
  const { t, i18n } = useTranslation();
  const nf = new Intl.NumberFormat(i18n.language === 'fa' ? 'fa-IR' : 'en-US');
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <span>{t('common.showing', { from: nf.format(from), to: nf.format(to), total: nf.format(total) })}</span>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          {t('common.previous')}
        </button>
        <span className="px-1 text-slate-600">{t('common.pageOf', { page: nf.format(page), pages: nf.format(pages) })}</span>
        <button type="button" className="btn-secondary btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
