import { respond, fail } from './client';
import { db, person, classSummary } from './db';

function enrich(p) {
  return { ...p, student: person(p.studentId), class: classSummary(p.classId) };
}

export function list({ status = 'all', search = '' } = {}) {
  const q = search.trim().toLowerCase();
  const items = db.payments
    .map(enrich)
    .filter((p) => status === 'all' || p.status === status)
    .filter(
      (p) =>
        !q ||
        p.reference.toLowerCase().includes(q) ||
        p.student?.nameEn.toLowerCase().includes(q) ||
        p.student?.nameFa.includes(q),
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return respond(items);
}

/**
 * DEMO ONLY: simulates a payment gateway round trip.
 * `outcome` is chosen in the UI ("success" or "failure").
 * The backend will redirect to a real gateway and verify the callback.
 */
export function pay(id, { outcome }) {
  const p = db.payments.find((x) => x.id === id);
  if (!p) return fail('Payment not found');
  p.status = outcome === 'success' ? 'verified' : 'failed';
  p.date = new Date().toISOString();
  return respond(enrich(p), 1400);
}

/** Admin marks a pending payment as verified (e.g. after checking a bank transfer). */
export function verify(id) {
  const p = db.payments.find((x) => x.id === id);
  if (!p) return fail('Payment not found');
  p.status = 'verified';
  return respond(enrich(p));
}
