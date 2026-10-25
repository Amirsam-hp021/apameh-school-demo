import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import Modal from '../../components/Modal';
import { useFormat, useLocalize } from '../../utils/format';

/**
 * DEMO payment flow: confirm -> processing -> result.
 * No real gateway is contacted; the user chooses the outcome.
 */
export default function PayModal({ payment, onClose, onDone }) {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const [step, setStep] = useState('confirm');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (payment) {
      setStep('confirm');
      setResult(null);
    }
  }, [payment]);

  const simulate = async (outcome) => {
    setStep('processing');
    const updated = await api.payments.pay(payment.id, { outcome });
    setResult(updated);
    setStep('done');
    onDone(updated);
  };

  const success = result?.status === 'verified';

  return (
    <Modal
      open={Boolean(payment)}
      onClose={step === 'processing' ? () => {} : onClose}
      title={t('admin.payments.payTitle')}
      size="sm"
      footer={
        step === 'confirm' ? (
          <>
            <button type="button" className="btn-secondary" onClick={() => simulate('failure')}>{t('admin.payments.simulateFailure')}</button>
            <button type="button" className="btn-accent" onClick={() => simulate('success')}>{t('admin.payments.simulateSuccess')}</button>
          </>
        ) : step === 'done' ? (
          <button type="button" className="btn-primary" onClick={onClose}>{t('common.done')}</button>
        ) : null
      }
    >
      {payment && step === 'confirm' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-4">
            <CreditCard className="h-8 w-8 text-primary-700" aria-hidden="true" />
            <div>
              <p className="text-xs text-primary-800/70">{t('admin.payments.amountDue')}</p>
              <p className="text-xl font-semibold text-primary-900">{fmt.money(payment.amount)}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-slate-500">{t('admin.payments.columns.student')}</dt>
            <dd className="text-end font-medium text-slate-800">{nameOf(payment.student)}</dd>
            <dt className="text-slate-500">{t('admin.payments.columns.class')}</dt>
            <dd className="text-end text-slate-800">{payment.class?.name}</dd>
            <dt className="text-slate-500">{t('admin.payments.columns.reference')}</dt>
            <dd className="text-end text-slate-800" dir="ltr">{payment.reference}</dd>
          </dl>
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{t('admin.payments.demoNotice')}</p>
        </div>
      )}
      {step === 'processing' && (
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-700">{t('admin.payments.processing')}</p>
          <p className="text-sm text-slate-500">{t('admin.payments.processingHint')}</p>
        </div>
      )}
      {step === 'done' && (
        <div className="flex flex-col items-center py-6 text-center">
          {success ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden="true" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500" aria-hidden="true" />
          )}
          <p className="mt-3 text-lg font-semibold text-slate-900">
            {success ? t('admin.payments.successTitle') : t('admin.payments.failureTitle')}
          </p>
          <p className="text-sm text-slate-500">{success ? t('admin.payments.successText') : t('admin.payments.failureText')}</p>
        </div>
      )}
    </Modal>
  );
}
