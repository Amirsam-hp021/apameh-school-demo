import { Link } from 'react-router-dom';
import { AlertCircle, CreditCard, GraduationCap, School, Users, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Avatar from '../../components/Avatar';
import Card, { StatCard } from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';
import { Skeleton, SkeletonList } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useFormat, useLocalize } from '../../utils/format';
import RevenueChart from './RevenueChart';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.dashboard.admin(), []);

  if (error) return <ErrorState onRetry={reload} />;

  return (
    <>
      <PageHeader title={t('admin.dashboard.title')} description={t('common.welcomeBack', { name: nameOf(user) })} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard loading={loading} icon={GraduationCap} label={t('admin.dashboard.totalStudents')} value={fmt.number(data?.totalStudents)} />
        <StatCard loading={loading} icon={Users} tone="teal" label={t('admin.dashboard.totalTeachers')} value={fmt.number(data?.totalTeachers)} />
        <StatCard loading={loading} icon={School} tone="purple" label={t('admin.dashboard.activeClasses')} value={fmt.number(data?.activeClasses)} />
        <StatCard
          loading={loading}
          icon={CreditCard}
          tone="teal"
          label={t('admin.dashboard.paymentsThisMonth')}
          value={data ? fmt.moneyCompact(data.paymentsThisMonth) : ''}
          hint={data && t('admin.dashboard.verifiedCount', { n: fmt.number(data.paymentsThisMonthCount) })}
        />
        <StatCard
          loading={loading}
          icon={AlertCircle}
          tone="red"
          label={t('admin.dashboard.failedPayments')}
          value={fmt.number(data?.failedPayments)}
          hint={data && t('admin.dashboard.pendingCount', { n: fmt.number(data.pendingPayments) })}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title={t('admin.dashboard.revenueTitle')}
          subtitle={t('admin.dashboard.revenueSubtitle')}
          action={<Link to="/admin/payments" className="text-sm font-medium text-primary-700 hover:underline">{t('common.viewAll')}</Link>}
        >
          {loading ? <Skeleton className="h-72 w-full" /> : <RevenueChart data={data.revenue} />}
        </Card>

        <Card
          title={t('admin.dashboard.recentActivity')}
          action={<Link to="/admin/audit-logs" className="text-sm font-medium text-primary-700 hover:underline">{t('common.viewAll')}</Link>}
        >
          {loading && <SkeletonList rows={6} />}
          {!loading && data.recentActivity.length === 0 && <EmptyState compact icon={Activity} title={t('admin.dashboard.noActivity')} />}
          {!loading && (
            <ul className="space-y-4">
              {data.recentActivity.map((log) => (
                <li key={log.id} className="flex items-start gap-3">
                  <Avatar person={log.user} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-slate-900">{nameOf(log.user)}</span>{' '}
                      <span>{t(`audit.actions.${log.action.replace('.', '_')}`)}</span>
                    </p>
                    <p className="text-xs text-slate-400">{fmt.relative(log.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
