import { respond, fail } from './client';
import { db, findClass, attendanceStats, classSummary } from './db';

/** Attendance sheet for a class on a date (YYYY-MM-DD). Unsaved dates default to "present". */
export function getSheet(classId, date) {
  const cls = findClass(classId);
  if (!cls) return fail('Class not found');
  const record = db.attendance.find((r) => r.classId === classId && r.date === date);
  const marks = {};
  cls.studentIds.forEach((sid) => {
    marks[sid] = record?.marks[sid] || 'present';
  });
  return respond({ classId, date, marks, saved: Boolean(record) });
}

export function saveSheet(classId, date, marks) {
  const existing = db.attendance.find((r) => r.classId === classId && r.date === date);
  if (existing) existing.marks = { ...marks };
  else db.attendance.push({ classId, date, marks: { ...marks } });
  return respond({ ok: true });
}

/** Attendance summary per class for one student, plus recent sessions. */
export function forStudent(studentId) {
  const classes = db.classes.filter((c) => c.studentIds.includes(studentId));
  const perClass = classes.map((c) => ({ class: classSummary(c.id), ...attendanceStats(c.id, studentId) }));
  const recent = db.attendance
    .filter((r) => r.marks[studentId])
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)
    .map((r) => ({ date: r.date, class: classSummary(r.classId), mark: r.marks[studentId] }));
  return respond({ perClass, recent });
}
