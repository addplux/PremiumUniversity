import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import EnterpriseLayout from './layouts/EnterpriseLayout';
import LearningLayout from './layouts/LearningLayout';
import OrganizationBanner from './components/OrganizationBanner';
import OfflineIndicator from './components/OfflineIndicator';
import LowBandwidthMode from './components/LowBandwidthMode';

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
import TeacherRegistry from './pages/TeacherRegistry';
import LectureManager from './pages/LectureManager';
import ExaminationManager from './pages/ExaminationManager';
import StudentFeeManager from './pages/StudentFeeManager';
import CourseManager from './pages/CourseManager';
import CourseCatalog from './pages/CourseCatalog';
import StudentAssignments from './pages/StudentAssignments';
import AssignmentManager from './pages/AssignmentManager';
import FinanceDashboard from './pages/FinanceDashboard';
import StudentFinance from './pages/StudentFinance';
import RecordPayment from './pages/RecordPayment';
import FinanceReports from './pages/FinanceReports';
import GradesDashboard from './pages/GradesDashboard';
import AcademicRecords from './pages/AcademicRecords';
import Timetable from './pages/Timetable';
import EventsCalendar from './pages/EventsCalendar';
import ScheduleManager from './pages/ScheduleManager';

// Super Admin & Admin Tools
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import BrandingEditor from './pages/BrandingEditor';

// New Role-Based Dashboards
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import FinanceAdminDashboard from './pages/FinanceAdminDashboard';
import AcademicAdminDashboard from './pages/AcademicAdminDashboard';
import LessonPlanning from './pages/LessonPlanning';
import SyllabusManager from './pages/SyllabusManager';
import MaterialsManager from './pages/MaterialsManager';
import HomeworkManager from './pages/HomeworkManager';
import ClassworkManager from './pages/ClassworkManager';
import CircularManager from './pages/CircularManager';
import NotificationCenter from './pages/NotificationCenter';
import IDCardManager from './pages/IDCardManager';
import RetentionDashboard from './pages/RetentionDashboard';
import EquityDashboard from './pages/EquityDashboard';
import AITutorWidget from './components/AITutorWidget';
import AuditLogManager from './pages/AuditLogManager';

// Supply Chain & Procurement Pages
import SupplierManagement from './pages/SupplierManagement';
import SupplierDetails from './pages/SupplierDetails';
import PurchaseRequisitions from './pages/PurchaseRequisitions';
import PurchaseRequisitionDetails from './pages/PurchaseRequisitionDetails';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseOrderDetails from './pages/PurchaseOrderDetails';
import InventoryManagement from './pages/InventoryManagement';
import WarehouseManagement from './pages/WarehouseManagement';
import DemandForecasting from './pages/DemandForecasting';
import AutomatedReordering from './pages/AutomatedReordering';
import ContractManagement from './pages/ContractManagement';
import LogisticsTracking from './pages/LogisticsTracking';
import TenderManagement from './pages/TenderManagement';
import PublicTenderPortal from './pages/PublicTenderPortal';
import BidSubmission from './pages/BidSubmission';
import BidEvaluation from './pages/BidEvaluation';
import ECatalogue from './pages/ECatalogue';


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
    <NotificationProvider>
      <Router>
        <OrganizationBanner />
        {/* <OfflineIndicator /> */}
        <LowBandwidthMode />
        <div style={{ position: 'relative', zIndex: 1000 }}>
          <AITutorWidget />
        </div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />


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
            <Route path="audit" element={<AuditLogManager />} />
            <Route path="branding" element={<BrandingEditor />} />
            {/* Add more system admin routes as needed */}
          </Route>

          {/* Global Super Admin Routes */}
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRoles={['system_admin']} requireSuperAdmin={true}>
              <EnterpriseLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SuperAdminDashboard />} />
          </Route>

          {/* Finance Admin Routes */}
          <Route path="/admin/finance" element={
            <ProtectedRoute allowedRoles={['finance_admin', 'system_admin']}>
              <EnterpriseLayout />
            </ProtectedRoute>
          }>
            <Route index element={<FinanceAdminDashboard />} />
            <Route path="payments" element={<FinanceDashboard />} />
            <Route path="record" element={<RecordPayment />} />
            <Route path="reports" element={<FinanceReports />} />
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
            <Route path="retention" element={<RetentionDashboard />} />
            <Route path="equity" element={<EquityDashboard />} />
            <Route path="applications" element={<ApplicationsManager />} />
            <Route path="students" element={<StudentRegistry />} />
            <Route path="teachers" element={<TeacherRegistry />} />
            <Route path="lectures" element={<LectureManager />} />
            <Route path="examinations" element={<ExaminationManager />} />
            <Route path="fees" element={<StudentFeeManager />} />
            <Route path="finance" element={<FinanceDashboard />} />
            <Route path="contact" element={<ContactManager />} />
            <Route path="courses" element={<CourseManager />} />
            <Route path="assignments" element={<AssignmentManager />} />
            <Route path="academic-records" element={<AcademicRecords />} />
            <Route path="classes" element={<ScheduleManager />} />
            <Route path="lesson-planning" element={<LessonPlanning />} />
            <Route path="syllabus" element={<SyllabusManager />} />
            <Route path="materials" element={<MaterialsManager />} />
            <Route path="homework" element={<HomeworkManager />} />
            <Route path="classwork" element={<ClassworkManager />} />
            <Route path="circulars" element={<CircularManager />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="id-cards" element={<IDCardManager />} />

            {/* Supply Chain & Procurement Routes */}
            <Route path="suppliers" element={<SupplierManagement />} />
            <Route path="suppliers/:id" element={<SupplierDetails />} />
            <Route path="requisitions" element={<PurchaseRequisitions />} />
            <Route path="requisitions/:id" element={<PurchaseRequisitionDetails />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="purchase-orders/:id" element={<PurchaseOrderDetails />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="warehouses" element={<WarehouseManagement />} />
            <Route path="forecasting" element={<DemandForecasting />} />
            <Route path="automation" element={<AutomatedReordering />} />
            <Route path="contracts" element={<ContractManagement />} />
            <Route path="logistics" element={<LogisticsTracking />} />
            <Route path="tenders" element={<TenderManagement />} />
            <Route path="bids/evaluation" element={<BidEvaluation />} />
            <Route path="ecatalogue" element={<ECatalogue />} />
          </Route>

          {/* Public Procurement Portal Routes */}
          <Route path="/public" element={<PublicTenderPortal />} />
          <Route path="/public/bid/:tenderId" element={<BidSubmission />} />


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
    </NotificationProvider>
  );
}

export default App;
