import { respond, fail } from './client';
import { db, findUser } from './db';
import { demoAccounts } from '../data/mock';

/** Demo login: picks the demo account for a role. No passwords. */
export function loginAs(role) {
  const user = findUser(demoAccounts[role]);
  if (!user) return fail('Unknown role');
  return respond({ user, token: `demo-token-${role}` });
}

export function logout() {
  return respond({ ok: true }, 100);
}

/** Linked child for a parent account. */
export function getChild(parentId) {
  const parent = findUser(parentId);
  return respond(parent?.childId ? db.users.find((u) => u.id === parent.childId) : null);
}
