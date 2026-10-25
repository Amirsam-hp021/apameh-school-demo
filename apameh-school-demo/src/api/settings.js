import { respond } from './client';
import { db } from './db';

export function get() {
  return respond(db.settings);
}

/** DEMO: changes are intentionally NOT saved. The backend will persist them. */
export function update(data) {
  return respond({ saved: false, data }, 500);
}
