import { respond, fail } from './client';
import { db, findAssignment, findClass, person, classSummary, homeworkScores } from './db';

function enrich(s) {
  const a = findAssignment(s.assignmentId);
  return {
    ...s,
    student: person(s.studentId),
    assignment: a ? { id: a.id, title: a.title, dueDate: a.dueDate, classId: a.classId } : null,
    class: a ? classSummary(a.classId) : null,
  };
}

/** Submissions for a teacher's classes (or one class), newest first. */
export function list({ teacherId, classId, status = 'all' } = {}) {
  const items = db.submissions
    .filter((s) => {
      const a = findAssignment(s.assignmentId);
      if (!a) return false;
      if (classId && a.classId !== classId) return false;
      if (teacherId && findClass(a.classId)?.teacherId !== teacherId) return false;
      if (status === 'to_review') return s.status === 'submitted' || s.status === 'late';
      return status === 'all' || s.status === status;
    })
    .sort((x, y) => new Date(y.submittedAt) - new Date(x.submittedAt))
    .map(enrich);
  return respond(items);
}

/**
 * One submission plus the data needed to preview the weighted final grade:
 * the student's other homework scores, exam marks and the school weights.
 */
export function get(id) {
  const s = db.submissions.find((x) => x.id === id);
  if (!s) return fail('Submission not found');
  const a = findAssignment(s.assignmentId);
  const entry = db.gradebook.find((g) => g.classId === a.classId && g.studentId === s.studentId) || {};
  return respond({
    ...enrich(s),
    assignment: { ...a, class: classSummary(a.classId) },
    gradeContext: {
      otherHomeworkScores: homeworkScores(a.classId, s.studentId, { excludeSubmissionId: s.id }),
      midterm: entry.midterm ?? null,
      final: entry.final ?? null,
      weights: db.settings.weights,
    },
  });
}

/** Save a grade. `status` is "reviewed" (graded) or "returned" (sent back for revision). */
export function grade(id, { score, feedback, status = 'reviewed' }) {
  const s = db.submissions.find((x) => x.id === id);
  if (!s) return fail('Submission not found');
  Object.assign(s, { score, feedback, status, gradedAt: new Date().toISOString() });
  return respond(enrich(s));
}
