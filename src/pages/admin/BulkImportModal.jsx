import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '../../components/FileDropzone';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api';

/** Bulk import (UI only in the demo). */
export default function BulkImportModal({ open, onClose }) {
  const { t } = useTranslation();
  const { notify } = useToast();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const pick = ([f]) => {
    if (!/\.(csv|xlsx)$/i.test(f.name)) {
      setError(t('admin.users.import.invalidType'));
      setFile(null);
      return;
    }
    setError('');
    setFile(f);
  };

  const close = () => {
    setFile(null);
    setError('');
    onClose();
  };

  const runImport = async () => {
    setBusy(true);
    await api.users.bulkImport(file);
    setBusy(false);
    notify(t('admin.users.import.demoDone'), 'info');
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('admin.users.import.title')}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={close}>{t('common.cancel')}</button>
          <button type="button" className="btn-primary" disabled={!file || busy} onClick={runImport}>
            {busy ? t('common.processing') : t('admin.users.import.start')}
          </button>
        </>
      }
    >
      <p className="mb-4 text-sm text-slate-600">{t('admin.users.import.description')}</p>
      <FileDropzone accept=".csv,.xlsx" onFiles={pick} hint={t('admin.users.import.hint')} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {file && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <FileSpreadsheet className="h-4 w-4 text-accent-600" aria-hidden="true" /> <span dir="ltr">{file.name}</span>
        </div>
      )}
      <button type="button" className="btn-ghost btn-sm mt-4" onClick={() => notify(t('common.demoDownload'), 'info')}>
        <Download className="h-4 w-4" aria-hidden="true" /> {t('admin.users.import.template')}
      </button>
    </Modal>
  );
}
