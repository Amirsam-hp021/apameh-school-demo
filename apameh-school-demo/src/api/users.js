import { respond, fail, newId } from './client';
import { db, findUser } from './db';

/**
 * Paginated, searchable user list.
 * @returns {Promise<{items: object[], total: number, page: number, pageSize: number}>}
 */
export function list({ search = '', role = 'all', status = 'all', page = 1, pageSize = 10 } = {}) {
  const q = search.trim().toLowerCase();
  const filtered = db.users.filter((u) => {
    if (role !== 'all' && u.role !== role) return false;
    if (status !== 'all' && u.status !== status) return false;
    if (!q) return true;
    return [u.nameEn, u.nameFa, u.email, u.phone].some((v) => v?.toLowerCase().includes(q));
  });
  const start = (page - 1) * pageSize;
  return respond({ items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize });
}

export function get(id) {
  const user = findUser(id);
  return user ? respond(user) : fail('User not found');
}

export function create(data) {
  const user = { ...data, id: newId('u'), createdAt: new Date().toISOString() };
  db.users.unshift(user);
  return respond(user);
}

export function update(id, data) {
  const user = findUser(id);
  if (!user) return fail('User not found');
  Object.assign(user, data);
  return respond(user);
}

/** UI only in the demo: the backend will parse the CSV/Excel file. */
export function bulkImport(file) {
  return respond({ fileName: file?.name, imported: 0, demo: true }, 900);
}
