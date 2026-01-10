import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import EnterpriseLayout from './layouts/EnterpriseLayout';
import LearningLayout from './layouts/LearningLayout';

// Pages
import HomePage from './pages/HomePage';
import ProgramsPage from './pages/ProgramsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApplicationsManager from './pages/ApplicationsManager';
import ContactManager from './pages/ContactManager';
import StudentRegistry from './pages/StudentRegistry';
import CourseManager from './pages/CourseManager';
import CourseCatalog from './pages/CourseCatalog';
import StudentAssignments from './pages/StudentAssignments';
import AssignmentManager from './pages/AssignmentManager';
import FinanceDashboard from './pages/FinanceDashboard';
import StudentFinance from './pages/StudentFinance';
import GradesDashboard from './pages/GradesDashboard';
import AcademicRecords from './pages/AcademicRecords';
import Timetable from './pages/Timetable';
import EventsCalendar from './pages/EventsCalendar';
import ScheduleManager from './pages/ScheduleManager';

// New Role-Based Dashboards
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import FinanceAdminDashboard from './pages/FinanceAdminDashboard';
import AcademicAdminDashboard from './pages/AcademicAdminDashboard';

// Dashboard Router - Redirects to appropriate dashboard based on role
const DashboardRouter = () => {
  const { userRole, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  // Redirect based on role
  const redirectMap = {
    'student': '/dashboard',
    'system_admin': '/admin/system',
    'finance_admin': '/admin/finance',
    'academic_admin': '/admin/academic',
    'admin': '/admin' // Legacy admin
  };

  return <Navigate to={redirectMap[userRole] || '/dashboard'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Auto-redirect to role-specific dashboard */}
          <Route path="/portal" element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } />

          {/* System Admin Routes */}
          <Route path="/admin/system" element={
            <ProtectedRoute allowedRoles={['system_admin']}>
              <EnterpriseLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SystemAdminDashboard />} />
            <Route path="users" element={<StudentRegistry />} />
            {/* Add more system admin routes as needed */}
          </Route>

          {/* Finance Admin Routes */}
          <Route path="/admin/finance" element={
            <ProtectedRoute allowedRoles={['finance_admin', 'system_admin']}>
              <EnterpriseLayout />
            </ProtectedRoute>
          }>
            <Route index element={<FinanceAdminDashboard />} />
            <Route path="payments" element={<FinanceDashboard />} />
            {/* Add more finance admin routes as needed */}
          </Route>

          {/* Academic Admin Routes */}
          <Route path="/admin/academic" element={
            <ProtectedRoute allowedRoles={['academic_admin', 'system_admin']}>
              <EnterpriseLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AcademicAdminDashboard />} />
            <Route path="courses" element={<CourseManager />} />
            <Route path="assignments" element={<AssignmentManager />} />
            <Route path="grades" element={<AcademicRecords />} />
            <Route path="timetable" element={<ScheduleManager />} />
            {/* Add more academic admin routes as needed */}
          </Route>

          {/* Legacy Admin Routes (for backward compatibility) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin', 'system_admin', 'finance_admin', 'academic_admin']}>
              <EnterpriseLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="applications" element={<ApplicationsManager />} />
            <Route path="students" element={<StudentRegistry />} />
            <Route path="finance" element={<FinanceDashboard />} />
            <Route path="contact" element={<ContactManager />} />
            <Route path="courses" element={<CourseManager />} />
            <Route path="assignments" element={<AssignmentManager />} />
            <Route path="academic-records" element={<AcademicRecords />} />
            <Route path="classes" element={<ScheduleManager />} />
          </Route>

          {/* Student Portal */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <LearningLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<CourseCatalog />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="finance" element={<StudentFinance />} />
            <Route path="grades" element={<GradesDashboard />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="events" element={<EventsCalendar />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
