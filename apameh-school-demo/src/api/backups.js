import { respond, newId } from './client';
import { db } from './db';

export function list() {
  return respond([...db.backups].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}

/** DEMO: pretends to create a backup and returns a completed record. */
export function create() {
  const n = String(db.backups.length + 1).padStart(2, '0');
  const backup = {
    id: newId('b'),
    name: `backup-manual-${n}.tar.gz`,
    type: 'manual',
    status: 'completed',
    size: 249_300_000,
    createdAt: new Date().toISOString(),
  };
  db.backups.unshift(backup);
  return respond(backup, 1800);
}
