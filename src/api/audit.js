import { respond } from './client';
import { db, person } from './db';

/** All action keys that appear in the log (for the filter dropdown). */
export const ACTIONS = [
  'login', 'logout', 'login.failed', 'user.create', 'user.update', 'payment.verify', 'payment.failed',
  'grade.update', 'assignment.create', 'assignment.submit', 'material.upload', 'announcement.create',
  'settings.update', 'backup.create',
];

/**
 * Paginated audit log.
 * `from` / `to` are YYYY-MM-DD strings (inclusive).
 */
export function list({ action = 'all', userId = 'all', from = '', to = '', page = 1, pageSize = 10 } = {}) {
  const filtered = db.auditLogs
    .filter((l) => action === 'all' || l.action === action)
    .filter((l) => userId === 'all' || l.userId === userId)
    .filter((l) => !from || new Date(l.date) >= new Date(`${from}T00:00:00`))
    .filter((l) => !to || new Date(l.date) <= new Date(`${to}T23:59:59`))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((l) => ({ ...l, user: person(l.userId) }));
  const start = (page - 1) * pageSize;
  return respond({ items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize });
}

/** Users that appear in the log (for the filter dropdown). */
export function actors() {
  const ids = [...new Set(db.auditLogs.map((l) => l.userId))];
  return respond(ids.map(person));
}
