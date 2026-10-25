import { respond, fail } from './client';
import { db, findClass, person, gradeRow, attendanceStats } from './db';

function enrich(cls) {
  return {
    ...cls,
    teacher: person(cls.teacherId),
    studentCount: cls.studentIds.length,
    attendanceRate: attendanceStats(cls.id).rate,
  };
}

/** Classes, optionally filtered by teacher or by enrolled student. */
export function list({ teacherId, studentId } = {}) {
  const items = db.classes
    .filter((c) => !teacherId || c.teacherId === teacherId)
    .filter((c) => !studentId || c.studentIds.includes(studentId))
    .map(enrich);
  return respond(items);
}

export function get(id) {
  const cls = findClass(id);
  return cls ? respond(enrich(cls)) : fail('Class not found');
}

/** Roster with each student's attendance and current grade. */
export function students(classId) {
  const cls = findClass(classId);
  if (!cls) return fail('Class not found');
  const rows = cls.studentIds.map((sid) => ({
    ...person(sid),
    attendanceRate: attendanceStats(classId, sid).rate,
    grade: gradeRow(classId, sid),
  }));
  return respond(rows);
}
