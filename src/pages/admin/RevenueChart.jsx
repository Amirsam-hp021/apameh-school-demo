import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useFormat } from '../../utils/format';

/** Tooltip card for one month. */
function RevenueTooltip({ active, payload, fmt, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-500">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-900">{fmt.money(payload[0].value)}</p>
    </div>
  );
}

/** Single-series bar chart of verified revenue per month. Mirrors in RTL. */
export default function RevenueChart({ data }) {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const fmt = useFormat();
  const compact = new Intl.NumberFormat(fmt.locale, { notation: 'compact', maximumFractionDigits: 0 });
  const rows = data.map((d) => ({ ...d, label: fmt.month(d.month) }));

  return (
    // SVG text follows the page direction, so the chart itself is drawn LTR and mirrored with props.
    <div className="h-72 w-full" dir="ltr" role="img" aria-label={t('admin.dashboard.revenueChartLabel')}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" reversed={isRtl} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis
            orientation={isRtl ? 'right' : 'left'}
            tickFormatter={(v) => compact.format(v)}
            tickLine={false}
            axisLine={false}
            width={isRtl ? 84 : 64}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: '#eef4ff' }} content={<RevenueTooltip fmt={fmt} />} />
          <Bar dataKey="amount" fill="#1a37d0" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
