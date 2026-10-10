import {
  LayoutDashboard, Users, School, CreditCard, Megaphone, ScrollText, Settings, DatabaseBackup,
  BookOpen, ClipboardCheck, FolderOpen, FileText, GraduationCap, CalendarDays, Bell, MessagesSquare,
  CalendarCheck, Clock,
} from 'lucide-react';

/**
 * Sidebar items per role. `label` is an i18n key.
 * `end: true` makes the link active only on an exact match.
 */
export const NAVIGATION = {
  admin: [
    { to: '/admin', label: 'nav.dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'nav.users', icon: Users },
    { to: '/admin/classes', label: 'nav.classes', icon: School },
    { to: '/admin/payments', label: 'nav.payments', icon: CreditCard },
    { to: '/admin/announcements', label: 'nav.announcements', icon: Megaphone },
    { to: '/admin/audit-logs', label: 'nav.auditLogs', icon: ScrollText },
    { to: '/admin/settings', label: 'nav.settings', icon: Settings },
    { to: '/admin/backups', label: 'nav.backups', icon: DatabaseBackup },
  ],
  teacher: [
    { to: '/teacher', label: 'nav.dashboard', icon: LayoutDashboard, end: true },
    { to: '/teacher/classes', label: 'nav.myClasses', icon: BookOpen },
    { to: '/teacher/submissions', label: 'nav.grading', icon: ClipboardCheck },
    { to: '/teacher/announcements', label: 'nav.announcements', icon: Megaphone },
  ],
  student: [
    { to: '/student', label: 'nav.dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/classes', label: 'nav.myClasses', icon: BookOpen },
    { to: '/student/materials', label: 'nav.materials', icon: FolderOpen },
    { to: '/student/assignments', label: 'nav.assignments', icon: FileText },
    { to: '/student/grades', label: 'nav.grades', icon: GraduationCap },
    { to: '/student/timetable', label: 'nav.timetable', icon: CalendarDays },
    { to: '/student/notifications', label: 'nav.notifications', icon: Bell, badge: 'unread' },
    { to: '/student/forum', label: 'nav.forum', icon: MessagesSquare },
    { to: '/student/announcements', label: 'nav.announcements', icon: Megaphone },
  ],
  parent: [
    { to: '/parent', label: 'nav.overview', icon: LayoutDashboard, end: true },
    { to: '/parent/grades', label: 'nav.grades', icon: GraduationCap },
    { to: '/parent/attendance', label: 'nav.attendance', icon: CalendarCheck },
    { to: '/parent/deadlines', label: 'nav.deadlines', icon: Clock },
    { to: '/parent/announcements', label: 'nav.announcements', icon: Megaphone },
  ],
};
