import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Drag-and-drop area that also opens the file picker on click.
 * Validation is done by the parent in `onFiles`.
 */
export default function FileDropzone({ accept, onFiles, hint, multiple = false, disabled = false }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) onFiles(multiple ? files : [files[0]]);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
          : dragging
            ? 'border-accent-500 bg-accent-50'
            : 'border-slate-300 bg-slate-50/50 hover:border-primary-400 hover:bg-primary-50/40'
      }`}
    >
      <UploadCloud className={`mb-2 h-8 w-8 ${dragging ? 'text-accent-600' : 'text-slate-400'}`} aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">
        {t('upload.dropHere')} <span className="text-primary-700 underline">{t('upload.browse')}</span>
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
