import { respond, fail, newId } from './client';
import { db, findAssignment, findClass, classSummary, studentAssignmentStatus } from './db';

function enrich(a) {
  const cls = findClass(a.classId);
  const subs = db.submissions.filter((s) => s.assignmentId === a.id);
  return {
    ...a,
    class: classSummary(a.classId),
    submissionCount: subs.length,
    toReviewCount: subs.filter((s) => s.status === 'submitted' || s.status === 'late').length,
    studentCount: cls?.studentIds.length ?? 0,
  };
}

/** Teacher/admin view of assignments (includes drafts). */
export function list({ classId, teacherId } = {}) {
  const items = db.assignments
    .filter((a) => !classId || a.classId === classId)
    .filter((a) => !teacherId || findClass(a.classId)?.teacherId === teacherId)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map(enrich);
  return respond(items);
}

export function get(id) {
  const a = findAssignment(id);
  return a ? respond(enrich(a)) : fail('Assignment not found');
}

export function create(classId, data) {
  const a = { ...data, id: newId('a'), classId, createdAt: new Date().toISOString() };
  db.assignments.push(a);
  return respond(enrich(a));
}

/** Partial update, e.g. `{ status: 'published' }`. */
export function update(id, patch) {
  const a = findAssignment(id);
  if (!a) return fail('Assignment not found');
  Object.assign(a, patch);
  return respond(enrich(a));
}

/** Published/closed assignments for a student, with their own submission and status. */
export function forStudent(studentId) {
  const classIds = db.classes.filter((c) => c.studentIds.includes(studentId)).map((c) => c.id);
  const items = db.assignments
    .filter((a) => classIds.includes(a.classId) && a.status !== 'draft')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map((a) => ({ ...enrich(a), ...studentAssignmentStatus(a.id, studentId) }));
  return respond(items);
}

/** One assignment for a student (same shape as an item of `forStudent`). */
export function getForStudent(id, studentId) {
  const a = findAssignment(id);
  if (!a || a.status === 'draft') return fail('Assignment not found');
  return respond({ ...enrich(a), ...studentAssignmentStatus(a.id, studentId) });
}

/**
 * Demo submission: stores file metadata only. The status becomes "late" when
 * submitted after the due date. The backend must enforce the same rules.
 */
export function submit(assignmentId, studentId, file) {
  const a = findAssignment(assignmentId);
  if (!a) return fail('Assignment not found');
  const now = new Date();
  const late = now > new Date(a.dueDate);
  if (late && !a.allowLate) return fail('Late submissions are not allowed');

  let sub = db.submissions.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
  if (!sub) {
    sub = { id: newId('sub'), assignmentId, studentId };
    db.submissions.push(sub);
  }
  Object.assign(sub, {
    fileName: file.name,
    fileSize: file.size,
    submittedAt: now.toISOString(),
    status: late ? 'late' : 'submitted',
    score: null,
    feedback: '',
    gradedAt: null,
  });
  return respond(sub, 700);
}
