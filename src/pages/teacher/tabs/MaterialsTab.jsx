import { useEffect, useRef, useState } from 'react';
import { AlertCircle, FolderOpen, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api';
import Card from '../../../components/Card';
import EmptyState from '../../../components/EmptyState';
import ErrorState from '../../../components/ErrorState';
import FileDropzone from '../../../components/FileDropzone';
import MaterialIcon from '../../../components/MaterialIcon';
import ProgressBar from '../../../components/ProgressBar';
import { SkeletonList } from '../../../components/Skeleton';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useAsync } from '../../../hooks/useAsync';
import { acceptFor, MATERIAL_LIMITS_MB, validateFile } from '../../../utils/files';
import { useFormat } from '../../../utils/format';

const ALLOWED = ['pdf', 'video', 'image'];

/**
 * Upload UI with drag-and-drop and client-side validation.
 * DEMO: the upload progress is simulated and only file metadata is stored.
 */
export default function MaterialsTab({ cls }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { user } = useAuth();
  const { notify } = useToast();
  const [queue, setQueue] = useState([]);
  const [rejected, setRejected] = useState([]);
  const timers = useRef([]);
  const { data, loading, error, reload, setData } = useAsync(() => api.materials.list({ classId: cls.id }), [cls.id]);

  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const startUpload = (file, type) => {
    const tempId = Math.random().toString(36).slice(2);
    setQueue((q) => [...q, { tempId, name: file.name, size: file.size, type, progress: 0 }]);
    let progress = 0;
    const timer = setInterval(async () => {
      progress = Math.min(100, progress + 15 + Math.random() * 20);
      setQueue((q) => q.map((x) => (x.tempId === tempId ? { ...x, progress } : x)));
      if (progress >= 100) {
        clearInterval(timer);
        const material = await api.materials.upload(cls.id, { name: file.name, type, size: file.size }, user.id);
        setQueue((q) => q.filter((x) => x.tempId !== tempId));
        setData((list) => [material, ...(list || [])]);
        notify(t('materials.uploaded', { name: file.name }));
      }
    }, 250);
    timers.current.push(timer);
  };

  const onFiles = (files) => {
    const errors = [];
    files.forEach((file) => {
      const result = validateFile(file, { allowed: ALLOWED, maxSizeMb: MATERIAL_LIMITS_MB });
      if (result.ok) startUpload(file, result.type);
      else if (result.error === 'type') errors.push(t('upload.errors.type', { name: file.name }));
      else errors.push(t('upload.errors.size', { name: file.name, limit: fmt.number(result.limitMb) }));
    });
    setRejected(errors);
  };

  const remove = async (m) => {
    await api.materials.remove(m.id);
    setData((list) => list.filter((x) => x.id !== m.id));
    notify(t('materials.deleted'));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2 lg:self-start" title={t('materials.uploadTitle')}>
        <FileDropzone
          multiple
          accept={acceptFor(ALLOWED)}
          onFiles={onFiles}
          hint={t('materials.uploadHint', {
            pdf: fmt.number(MATERIAL_LIMITS_MB.pdf),
            image: fmt.number(MATERIAL_LIMITS_MB.image),
            video: fmt.number(MATERIAL_LIMITS_MB.video),
          })}
        />
        {rejected.length > 0 && (
          <ul className="mt-3 space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {rejected.map((msg) => (
              <li key={msg} className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> <span dir="auto">{msg}</span>
              </li>
            ))}
          </ul>
        )}
        {queue.length > 0 && (
          <ul className="mt-4 space-y-3">
            {queue.map((item) => (
              <li key={item.tempId} className="flex items-center gap-3">
                <MaterialIcon type={item.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-700" dir="ltr">{item.name}</p>
                  <ProgressBar value={item.progress} tone="blue" className="mt-1" />
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-slate-400">{t('materials.demoNote')}</p>
      </Card>

      <Card className="lg:col-span-3" title={t('materials.listTitle')} bodyClassName="p-0">
        {error && <ErrorState onRetry={reload} />}
        {loading && <div className="p-5"><SkeletonList rows={4} /></div>}
        {!loading && !error && data.length === 0 && <EmptyState icon={FolderOpen} title={t('materials.empty')} description={t('materials.emptyHint')} />}
        {!loading && !error && data.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {data.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <MaterialIcon type={m.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800" dir="ltr">{m.name}</p>
                  <p className="text-xs text-slate-500">
                    {t(`fileTypes.${m.type}`)} · <span dir="ltr">{fmt.bytes(m.size)}</span> · {fmt.date(m.uploadedAt)}
                  </p>
                </div>
                <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" onClick={() => remove(m)} aria-label={t('common.delete')} title={t('common.delete')}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
