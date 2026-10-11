import { respond, fail, newId } from './client';
import { db } from './db';

/** All "other expenses" lines in their original order. */
export function list() {
  return respond(db.expenses);
}

/** Partial update, e.g. `{ amount: 80000 }` or `{ flag: null }` once a line has been checked. */
export function update(id, patch) {
  const item = db.expenses.find((e) => e.id === id);
  if (!item) return fail('Expense not found');
  Object.assign(item, patch);
  return respond(item, 150);
}

export function create({ label, ref = '', amount }) {
  const item = { id: newId('ex'), label, ref, amount };
  db.expenses.push(item);
  return respond(item, 200);
}

export function remove(id) {
  db.expenses = db.expenses.filter((e) => e.id !== id);
  return respond({ ok: true }, 150);
}
