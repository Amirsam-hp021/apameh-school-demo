import { respond } from './client';
import {
  db, findUser, findAssignment, person, classSummary, attendanceStats, gradeRow, studentAssignmentStatus,
} from './db';
import { average } from '../utils/grades';
import { nextSession } from '../utils/schedule';

/** Super Admin dashboard numbers. */
export function admin() {
  const now = new Date();
  const thisMonth = db.payments.filter((p) => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const verifiedThisMonth = thisMonth.filter((p) => p.status === 'verified');
  return respond({
    totalStudents: db.users.filter((u) => u.role === 'student').length,
    totalTeachers: db.users.filter((u) => u.role === 'teacher').length,
    activeClasses: db.classes.length,
    paymentsThisMonth: verifiedThisMonth.reduce((sum, p) => sum + p.amount, 0),
    paymentsThisMonthCount: verifiedThisMonth.length,
    failedPayments: db.payments.filter((p) => p.status === 'failed').length,
    pendingPayments: db.payments.filter((p) => p.status === 'pending').length,
    revenue: db.monthlyRevenue,
    recentActivity: [...db.auditLogs]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)
      .map((l) => ({ ...l, user: person(l.userId) })),
  });
}

/** Teacher dashboard: classes, students, work to review, attendance. */
export function teacher(teacherId) {
  const classes = db.classes.filter((c) => c.teacherId === teacherId);
  const classIds = classes.map((c) => c.id);
  const toReview = db.submissions
    .filter((s) => (s.status === 'submitted' || s.status === 'late') && classIds.includes(findAssignment(s.assignmentId)?.classId))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .map((s) => {
      const a = findAssignment(s.assignmentId);
      return { ...s, student: person(s.studentId), assignment: { id: a.id, title: a.title }, class: classSummary(a.classId) };
    });
  const classRows = classes.map((c) => {
    const next = nextSession([c]);
    return {
      ...classSummary(c.id),
      room: c.room,
      studentCount: c.studentIds.length,
      attendanceRate: attendanceStats(c.id).rate,
      nextSession: next ? { start: next.start.toISOString(), end: next.end.toISOString() } : null,
    };
  });
  return respond({
    classes: classRows,
    studentsCount: new Set(classes.flatMap((c) => c.studentIds)).size,
    toReviewCount: toReview.length,
    toReview: toReview.slice(0, 5),
    avgAttendance: average(classRows.map((c) => c.attendanceRate)),
  });
}

function upcomingFor(studentId) {
  const classIds = db.classes.filter((c) => c.studentIds.includes(studentId)).map((c) => c.id);
  const now = new Date();
  return db.assignments
    .filter((a) => classIds.includes(a.classId) && a.status === 'published' && new Date(a.dueDate) > now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map((a) => ({
      id: a.id,
      title: a.title,
      dueDate: a.dueDate,
      class: classSummary(a.classId),
      status: studentAssignmentStatus(a.id, studentId).status,
    }));
}

function recentGradesFor(studentId) {
  return db.submissions
    .filter((s) => s.studentId === studentId && s.score != null)
    .sort((a, b) => new Date(b.gradedAt) - new Date(a.gradedAt))
    .slice(0, 5)
    .map((s) => {
      const a = findAssignment(s.assignmentId);
      return { id: s.id, assignmentId: a.id, title: a.title, class: classSummary(a.classId), score: s.score, feedback: s.feedback, gradedAt: s.gradedAt, status: s.status };
    });
}

/** Student dashboard: deadlines, recent grades, next class. */
export function student(studentId) {
  const classes = db.classes.filter((c) => c.studentIds.includes(studentId));
  const next = nextSession(classes);
  const grades = classes.map((c) => gradeRow(c.id, studentId).weighted);
  return respond({
    classesCount: classes.length,
    upcoming: upcomingFor(studentId),
    recentGrades: recentGradesFor(studentId),
    averageGrade: average(grades),
    attendanceRate: average(classes.map((c) => attendanceStats(c.id, studentId).rate)),
    nextClass: next
      ? { ...classSummary(next.classId), room: db.classes.find((c) => c.id === next.classId).room, start: next.start.toISOString(), end: next.end.toISOString() }
      : null,
  });
}

/** Parent dashboard: read-only overview of the linked child. */
export function parent(parentId) {
  const parentUser = findUser(parentId);
  const childId = parentUser?.childId;
  const classes = db.classes.filter((c) => c.studentIds.includes(childId));
  return respond({
    child: person(childId),
    classes: classes.map((c) => ({
      class: classSummary(c.id),
      teacher: person(c.teacherId),
      ...gradeRow(c.id, childId),
      attendance: attendanceStats(c.id, childId),
    })),
    attendanceRate: average(classes.map((c) => attendanceStats(c.id, childId).rate)),
    averageGrade: average(classes.map((c) => gradeRow(c.id, childId).weighted)),
    upcoming: upcomingFor(childId),
    recentGrades: recentGradesFor(childId),
  });
}
