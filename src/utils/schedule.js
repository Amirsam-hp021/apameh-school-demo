/**
 * Helpers that turn a class's weekly schedule (day + start/end time) into
 * concrete dated sessions.
 */

function atTime(date, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/** All sessions of the given classes between `from` and `to` (inclusive). */
export function sessionsInRange(classes, from, to) {
  const sessions = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  while (cursor <= end) {
    classes.forEach((cls) => {
      cls.schedule.forEach((slot, i) => {
        if (slot.day !== cursor.getDay()) return;
        sessions.push({
          id: `${cls.id}-${cursor.toISOString().slice(0, 10)}-${i}`,
          classId: cls.id,
          start: atTime(cursor, slot.start),
          end: atTime(cursor, slot.end),
        });
      });
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return sessions;
}

/** The next session (starting after `from`) across the given classes. */
export function nextSession(classes, from = new Date()) {
  const horizon = new Date(from);
  horizon.setDate(horizon.getDate() + 8);
  return (
    sessionsInRange(classes, from, horizon)
      .filter((s) => s.start > from)
      .sort((a, b) => a.start - b.start)[0] || null
  );
}
