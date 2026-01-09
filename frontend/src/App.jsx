import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
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

          {/* Protected Routes */}
          {/* Enterprise Portal (Admin Only) */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <EnterpriseLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            {/* Future Admin Routes will go here, e.g., /admin/applications */}
            <Route path="applications" element={<ApplicationsManager />} />
            <Route path="students" element={<StudentRegistry />} />
            <Route path="finance" element={<FinanceDashboard />} />
            <Route path="contact" element={<ContactManager />} />
            <Route path="courses" element={<CourseManager />} />
            <Route path="assignments" element={<AssignmentManager />} />
            <Route path="academic-records" element={<AcademicRecords />} />
            <Route path="classes" element={<ScheduleManager />} />
          </Route>

          {/* Learning Portal (Student/Faculty) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
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
