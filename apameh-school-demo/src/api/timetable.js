import { respond } from './client';
import { db } from './db';
import { sessionsInRange } from '../utils/schedule';

/**
 * Calendar events (class sessions + assignment deadlines) for a student
 * between two dates. Event dates are ISO strings.
 */
export function forStudent(studentId, from, to) {
  const classes = db.classes.filter((c) => c.studentIds.includes(studentId));
  const classIds = classes.map((c) => c.id);
  const sessions = sessionsInRange(classes, from, to).map((s) => {
    const cls = classes.find((c) => c.id === s.classId);
    return {
      id: s.id,
      type: 'class',
      title: cls.name,
      room: cls.room,
      classId: cls.id,
      color: cls.color,
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    };
  });
  const deadlines = db.assignments
    .filter((a) => classIds.includes(a.classId) && a.status !== 'draft')
    .filter((a) => new Date(a.dueDate) >= new Date(from) && new Date(a.dueDate) <= new Date(to))
    .map((a) => ({
      // Deadlines are all-day events so they show in the calendar header row.
      id: `deadline-${a.id}`,
      type: 'deadline',
      title: a.title,
      assignmentId: a.id,
      classId: a.classId,
      allDay: true,
      start: a.dueDate,
      end: a.dueDate,
    }));
  return respond([...sessions, ...deadlines]);
}
