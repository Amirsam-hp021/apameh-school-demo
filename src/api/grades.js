import { respond, fail } from './client';
import { db, findClass, person, gradeRow, classSummary } from './db';

/** Gradebook of a class: one row per student. */
export function gradebook(classId) {
  const cls = findClass(classId);
  if (!cls) return fail('Class not found');
  return respond({
    weights: db.settings.weights,
    rows: cls.studentIds.map((sid) => ({ student: person(sid), ...gradeRow(classId, sid) })),
  });
}

/** Update exam marks for one student (null clears a mark). */
export function updateExams(classId, studentId, { midterm, final }) {
  const entry = db.gradebook.find((g) => g.classId === classId && g.studentId === studentId);
  if (!entry) return fail('Grade entry not found');
  entry.midterm = midterm;
  entry.final = final;
  return respond({ student: person(studentId), ...gradeRow(classId, studentId) });
}

/** All grades for one student, grouped by class, with assignment-level feedback. */
export function forStudent(studentId) {
  const classes = db.classes.filter((c) => c.studentIds.includes(studentId));
  const result = classes.map((cls) => {
    const assignments = db.assignments
      .filter((a) => a.classId === cls.id && a.status !== 'draft')
      .map((a) => {
        const sub = db.submissions.find((s) => s.assignmentId === a.id && s.studentId === studentId);
        return {
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          status: sub ? sub.status : 'not_submitted',
          score: sub?.score ?? null,
          feedback: sub?.feedback || '',
          gradedAt: sub?.gradedAt || null,
        };
      });
    return {
      class: classSummary(cls.id),
      teacher: person(cls.teacherId),
      ...gradeRow(cls.id, studentId),
      assignments,
    };
  });
  return respond({ weights: db.settings.weights, classes: result });
}
