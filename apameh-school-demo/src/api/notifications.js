import { respond } from './client';
import { db } from './db';

export function list(userId) {
  const items = db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return respond(items);
}

export function unreadCount(userId) {
  return respond(db.notifications.filter((n) => n.userId === userId && !n.read).length, 100);
}

export function markRead(id) {
  const n = db.notifications.find((x) => x.id === id);
  if (n) n.read = true;
  return respond({ ok: true }, 150);
}

export function markAllRead(userId) {
  db.notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  return respond({ ok: true }, 200);
}
