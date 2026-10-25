import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import NotFound from './pages/public/NotFound';
import AnnouncementsFeed from './pages/shared/AnnouncementsFeed';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPayments from './pages/admin/Payments';
import AdminExpenses from './pages/admin/Expenses';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/Settings';
import AdminBackups from './pages/admin/Backups';

import TeacherDashboard from './pages/teacher/Dashboard';
import ClassList from './pages/teacher/ClassList';
import ClassDetail from './pages/teacher/ClassDetail';
import Submissions from './pages/teacher/Submissions';
import GradeSubmission from './pages/teacher/GradeSubmission';

import StudentDashboard from './pages/student/Dashboard';
import StudentClasses from './pages/student/Classes';
import StudentMaterials from './pages/student/Materials';
import StudentAssignments from './pages/student/Assignments';
import StudentAssignmentDetail from './pages/student/AssignmentDetail';
import StudentGrades from './pages/student/Grades';
import StudentTimetable from './pages/student/Timetable';
import StudentNotifications from './pages/student/Notifications';
import StudentForum from './pages/student/Forum';

import ParentOverview from './pages/parent/Overview';
import ParentGrades from './pages/parent/Grades';
import ParentAttendance from './pages/parent/Attendance';
import ParentDeadlines from './pages/parent/Deadlines';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Super Admin */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<Layout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="classes" element={<ClassList />} />
          <Route path="classes/:classId" element={<ClassDetail />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="expenses" element={<AdminExpenses />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="backups" element={<AdminBackups />} />
        </Route>
      </Route>

      {/* Teacher */}
      <Route element={<ProtectedRoute roles={['teacher']} />}>
        <Route path="/teacher" element={<Layout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="classes" element={<ClassList />} />
          <Route path="classes/:classId" element={<ClassDetail />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="submissions/:submissionId" element={<GradeSubmission />} />
          <Route path="announcements" element={<AnnouncementsFeed />} />
        </Route>
      </Route>

      {/* Student */}
      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route path="/student" element={<Layout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="classes" element={<StudentClasses />} />
          <Route path="materials" element={<StudentMaterials />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="assignments/:assignmentId" element={<StudentAssignmentDetail />} />
          <Route path="grades" element={<StudentGrades />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="forum" element={<StudentForum />} />
          <Route path="announcements" element={<AnnouncementsFeed />} />
        </Route>
      </Route>

      {/* Parent (read only) */}
      <Route element={<ProtectedRoute roles={['parent']} />}>
        <Route path="/parent" element={<Layout />}>
          <Route index element={<ParentOverview />} />
          <Route path="grades" element={<ParentGrades />} />
          <Route path="attendance" element={<ParentAttendance />} />
          <Route path="deadlines" element={<ParentDeadlines />} />
          <Route path="announcements" element={<AnnouncementsFeed />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
