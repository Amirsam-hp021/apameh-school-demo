import { respond, newId } from './client';
import { db, classSummary } from './db';

/** Materials for one class, several classes, or every class a student is enrolled in. */
export function list({ classId, classIds, studentId } = {}) {
  if (studentId) classIds = db.classes.filter((c) => c.studentIds.includes(studentId)).map((c) => c.id);
  const items = db.materials
    .filter((m) => (!classId || m.classId === classId) && (!classIds || classIds.includes(m.classId)))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .map((m) => ({ ...m, class: classSummary(m.classId) }));
  return respond(items);
}

/** Demo upload: only file metadata is stored. The backend will receive the file itself. */
export function upload(classId, { name, type, size }, uploadedBy) {
  const material = { id: newId('m'), classId, name, type, size, uploadedBy, uploadedAt: new Date().toISOString() };
  db.materials.unshift(material);
  return respond({ ...material, class: classSummary(classId) }, 200);
}

export function remove(id) {
  db.materials = db.materials.filter((m) => m.id !== id);
  return respond({ ok: true });
}

/** Demo download: returns a fake URL. */
export function download(id) {
  return respond({ url: `#/files/${id}` }, 200);
}
