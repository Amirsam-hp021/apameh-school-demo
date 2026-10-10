import { FileText, Film, Image as ImageIcon, Music, File } from 'lucide-react';

const MAP = {
  pdf: { icon: FileText, cls: 'bg-red-50 text-red-600' },
  video: { icon: Film, cls: 'bg-violet-50 text-violet-600' },
  image: { icon: ImageIcon, cls: 'bg-sky-50 text-sky-600' },
  audio: { icon: Music, cls: 'bg-amber-50 text-amber-600' },
  doc: { icon: FileText, cls: 'bg-primary-50 text-primary-600' },
};

/** Coloured icon for a file type. */
export default function MaterialIcon({ type }) {
  const { icon: Icon, cls } = MAP[type] || { icon: File, cls: 'bg-slate-100 text-slate-500' };
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cls}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}
