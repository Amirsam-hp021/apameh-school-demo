import { respond } from './client';
import { db, findUser, classSummary } from './db';

const LIMIT = 5;

/**
 * Global search across students, classes, materials and assignments.
 * Results are scoped to what the signed-in user is allowed to see,
 * which the backend must also enforce.
 */
export function global(query, user) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return respond({ students: [], classes: [], materials: [], assignments: [] }, 50);

  // Which classes can this user see?
  let classIds = db.classes.map((c) => c.id);
  if (user.role === 'teacher') classIds = db.classes.filter((c) => c.teacherId === user.id).map((c) => c.id);
  if (user.role === 'student') classIds = db.classes.filter((c) => c.studentIds.includes(user.id)).map((c) => c.id);
  if (user.role === 'parent') {
    const childId = findUser(user.id)?.childId;
    classIds = db.classes.filter((c) => c.studentIds.includes(childId)).map((c) => c.id);
  }
  const visibleClasses = db.classes.filter((c) => classIds.includes(c.id));
  const canSeeStudents = user.role === 'admin' || user.role === 'teacher';
  const studentIds = new Set(visibleClasses.flatMap((c) => c.studentIds));

  const match = (...values) => values.some((v) => v && v.toLowerCase().includes(q));

  const students = canSeeStudents
    ? db.users
        .filter((u) => u.role === 'student' && (user.role === 'admin' || studentIds.has(u.id)))
        .filter((u) => match(u.nameEn, u.nameFa, u.email))
        .slice(0, LIMIT)
        .map((u) => ({
          id: u.id,
          nameEn: u.nameEn,
          nameFa: u.nameFa,
          email: u.email,
          classId: visibleClasses.find((c) => c.studentIds.includes(u.id))?.id || null,
        }))
    : [];

  const classes = visibleClasses
    .filter((c) => match(c.name, c.level))
    .slice(0, LIMIT)
    .map((c) => classSummary(c.id));

  const materials =
    user.role === 'parent'
      ? []
      : db.materials
          .filter((m) => classIds.includes(m.classId) && match(m.name))
          .slice(0, LIMIT)
          .map((m) => ({ id: m.id, name: m.name, type: m.type, classId: m.classId, class: classSummary(m.classId) }));

  const assignments = db.assignments
    .filter((a) => classIds.includes(a.classId))
    .filter((a) => user.role === 'admin' || user.role === 'teacher' || a.status !== 'draft')
    .filter((a) => match(a.title.en, a.title.fa))
    .slice(0, LIMIT)
    .map((a) => ({ id: a.id, title: a.title, classId: a.classId, class: classSummary(a.classId) }));

  return respond({ students, classes, materials, assignments }, 150);
}
