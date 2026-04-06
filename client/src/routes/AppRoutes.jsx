import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import UserProfile from '../pages/UserProfile';
import SearchResults from '../pages/SearchResults';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import ForgotPassword from '../components/auth/ForgotPassword';
import ResetPassword from '../components/auth/ResetPassword';
import CollegeList from '../components/colleges/CollegeList';
import CollegeDetail from '../components/colleges/CollegeDetail';
import CourseList from '../components/courses/CourseList';
import CourseDetail from '../components/courses/CourseDetail';
import ExamList from '../components/exams/ExamList';
import ExamDetail from '../components/exams/ExamDetail';
import BlogList from '../components/blogs/BlogList';
import BlogDetail from '../components/blogs/BlogDetail';
import ComparisonPage from '../components/comparisons/ComparisonPage';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import CounsellorDashboard from '../components/dashboard/CounsellorDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ReviewModeration from '../components/reviews/ReviewModeration';
import CreateCollege from '../pages/admin/CreateCollege';
import CreateCourse from '../pages/admin/CreateCourse';
import CreateExam from '../pages/admin/CreateExam';
import CreateBlog from '../pages/admin/CreateBlog';
import ImportData from '../pages/admin/ImportData';
import ProgrammaticSEO from '../pages/ProgrammaticSEO';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import MainLayout from '../components/layout/MainLayout';
import AdminLeads     from '../pages/admin/AdminLeads';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import EnquiryDetail  from '../pages/counsellor/EnquiryDetail';
import AdminRoleRequests from '../pages/admin/AdminRoleRequests';
import AdminVideoTestimonials from '../pages/admin/AdminVideoTestimonials';
import ManageAccreditation from '../pages/admin/ManageAccreditation';
import PartnershipProgram from '../pages/PartnershipProgram';



const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/partnership" element={<PartnershipProgram />} />
        <Route path="/search" element={<SearchResults />} />

        {/* College routes */}
        <Route path="/colleges" element={<CollegeList />} />
        <Route path="/colleges/:slug" element={<CollegeDetail />} />

        {/* Programmatic SEO routes: /btech-colleges-in-delhi */}
        <Route path="/:courseSlug-colleges-in-:location" element={<ProgrammaticSEO />} />

        {/* Course routes */}
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />

        {/* Exam routes */}
        <Route path="/exams" element={<ExamList />} />
        <Route path="/exams/:slug" element={<ExamDetail />} />

        {/* Blog routes */}
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />

        {/* Compare */}
        <Route path="/compare" element={<ComparisonPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected routes (any authenticated user) */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/counsellor" element={<CounsellorDashboard />} />
          <Route path="/enquiries/:id" element={<EnquiryDetail />} />
        </Route>

        {/* Admin-only routes */}
        <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/admin/colleges/create" element={<CreateCollege />} />
          <Route path="/admin/courses/create" element={<CreateCourse />} />
          <Route path="/admin/exams/create" element={<CreateExam />} />
          <Route path="/admin/blogs/create" element={<CreateBlog />} />
          <Route path="/admin/import" element={<ImportData />} />
          <Route path="/admin/leads"     element={<AdminLeads />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/role-requests" element={<AdminRoleRequests />} />
          <Route path="/admin/video-testimonials" element={<AdminVideoTestimonials />} />
          <Route path="/admin/colleges/edit/:id" element={<CreateCollege />} />
          <Route path="/admin/courses/edit/:id" element={<CreateCourse />} />
          <Route path="/admin/exams/edit/:id" element={<CreateExam />} />
          <Route path="/admin/accreditation" element={<ManageAccreditation />} />




        </Route>

        {/* Admin + Moderator routes */}
        <Route element={<RoleBasedRoute allowedRoles={['admin', 'moderator']} />}>
          <Route path="/admin/reviews/moderation" element={<ReviewModeration />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
