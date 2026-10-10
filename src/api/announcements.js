import { respond, newId } from './client';
import { db, person } from './db';

const audienceForRole = { student: 'students', teacher: 'teachers', parent: 'parents' };

/** All announcements (admin) or the ones visible to a role. */
export function list({ role } = {}) {
  const items = db.announcements
    .filter((a) => !role || role === 'admin' || a.audience === 'all' || a.audience === audienceForRole[role])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((a) => ({ ...a, author: person(a.authorId) }));
  return respond(items);
}

export function create({ title, body, audience }, authorId) {
  const a = { id: newId('an'), title, body, audience, authorId, createdAt: new Date().toISOString() };
  db.announcements.unshift(a);
  return respond({ ...a, author: person(authorId) });
}

export function remove(id) {
  db.announcements = db.announcements.filter((a) => a.id !== id);
  return respond({ ok: true });
}
