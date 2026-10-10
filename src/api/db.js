/**
 * In-memory mock database, seeded from src/data/mock.js.
 *
 * Changes (new users, grades, posts ...) live only for the current browser
 * session and reset on reload. This file disappears when the real backend
 * is connected.
 */
import mockData from '../data/mock';
import { average, weightedFinal } from '../utils/grades';

export const db = structuredClone(mockData);

export const findUser = (id) => db.users.find((u) => u.id === id);
export const findClass = (id) => db.classes.find((c) => c.id === id);
export const findAssignment = (id) => db.assignments.find((a) => a.id === id);

/** Public summary of a person (what a backend would embed in other records). */
export function person(id) {
  const u = findUser(id);
  if (!u) return null;
  return { id: u.id, role: u.role, nameEn: u.nameEn, nameFa: u.nameFa, email: u.email };
}

/** Short summary of a class. */
export function classSummary(id) {
  const c = findClass(id);
  return c ? { id: c.id, name: c.name, level: c.level, color: c.color } : null;
}

/** Homework scores = earlier homework + graded submissions in that class. */
export function homeworkScores(classId, studentId, { excludeSubmissionId } = {}) {
  const entry = db.gradebook.find((g) => g.classId === classId && g.studentId === studentId);
  const graded = db.submissions
    .filter((s) => s.studentId === studentId && s.id !== excludeSubmissionId && s.score != null)
    .filter((s) => findAssignment(s.assignmentId)?.classId === classId)
    .map((s) => s.score);
  return [...(entry?.homeworkScores || []), ...graded];
}

/** Full grade row for a student in a class. */
export function gradeRow(classId, studentId) {
  const entry = db.gradebook.find((g) => g.classId === classId && g.studentId === studentId) || {};
  const homework = average(homeworkScores(classId, studentId));
  const parts = { homework, midterm: entry.midterm ?? null, final: entry.final ?? null };
  const result = weightedFinal(parts, db.settings.weights);
  return { ...parts, weighted: result.total, partial: result.partial };
}

/** Attendance counts for a class, optionally for one student. */
export function attendanceStats(classId, studentId) {
  const counts = { present: 0, late: 0, absent: 0, total: 0 };
  db.attendance
    .filter((r) => r.classId === classId)
    .forEach((r) => {
      Object.entries(r.marks).forEach(([sid, mark]) => {
        if (studentId && sid !== studentId) return;
        counts[mark] += 1;
        counts.total += 1;
      });
    });
  const rate = counts.total ? ((counts.present + counts.late) / counts.total) * 100 : null;
  return { ...counts, rate };
}

/**
 * Status of an assignment from a student's point of view:
 * not_submitted | submitted | late | reviewed | returned
 */
export function studentAssignmentStatus(assignmentId, studentId) {
  const sub = db.submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
  return { status: sub ? sub.status : 'not_submitted', submission: sub || null };
}
