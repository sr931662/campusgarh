import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SearchResults from './pages/SearchResults';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import CollegeList from './components/colleges/CollegeList';
import CollegeDetail from './components/colleges/CollegeDetail';
import CourseList from './components/courses/CourseList';
import CourseDetail from './components/courses/CourseDetail';
import ExamList from './components/exams/ExamList';
import ExamDetail from './components/exams/ExamDetail';
import BlogList from './components/blogs/BlogList';
import BlogDetail from './components/blogs/BlogDetail';
import ComparisonPage from './components/comparisons/ComparisonPage';
import StudentDashboard from './components/dashboard/StudentDashboard';
import CounsellorDashboard from './components/dashboard/CounsellorDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ModeratorDashboard from './components/dashboard/ModeratorDashboard';
import InstitutionRepDashboard from './components/dashboard/InstitutionRepDashboard';
import ReviewModeration from './components/reviews/ReviewModeration';
import EnquiryDetail from './pages/counsellor/EnquiryDetail';
import CreateCollege from './pages/admin/CreateCollege';
import CreateCourse from './pages/admin/CreateCourse';
import CreateExam from './pages/admin/CreateExam';
import CreateBlog from './pages/admin/CreateBlog';
import ImportData from './pages/admin/ImportData';
import AdminLeads     from './pages/admin/AdminLeads';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import UserProfile from './pages/UserProfile';
import ProgrammaticSEO from './pages/ProgrammaticSEO';
import VerifyEmail from './components/auth/VerifyEmail';
import PrivateRoute from './routes/PrivateRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';
import AdminRoleRequests from './pages/admin/AdminRoleRequests';
import ManageColleges from './pages/admin/ManageColleges';
import ManageCourses from './pages/admin/ManageCourses';
import ManageExams from './pages/admin/ManageExams';
import ManageBlogs from './pages/admin/ManageBlogs';
import ScrollToTop from './components/common/ScrollToTop';
import AdminGuide from './pages/admin/AdminGuide';
import Predictor from './pages/Predictor';
import AdminVideoTestimonials from './pages/admin/AdminVideoTestimonials';



import { ROLES } from './utils/constants';

function App() {
  return (
    <>
      <ScrollToTop />     {/* ← add this line */}
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/colleges" element={<CollegeList />} />
          <Route path="/colleges/:slug" element={<CollegeDetail />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/exams" element={<ExamList />} />
          <Route path="/exams/:slug" element={<ExamDetail />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/colleges/:courseSlug/:location" element={<ProgrammaticSEO />} />

          {/* Any authenticated user */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/predictor" element={<Predictor />} />   {/* ← add this */}
          </Route>

          {/* Student dashboard */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path="/dashboard/student" element={<StudentDashboard />} />
          </Route>

          {/* Counsellor routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.COUNSELLOR, ROLES.ADMIN]} />}>
            <Route path="/dashboard/counsellor" element={<CounsellorDashboard />} />
            <Route path="/enquiries/:id" element={<EnquiryDetail />} />
          </Route>

          {/* Moderator routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.MODERATOR]} />}>
            <Route path="/dashboard/moderator" element={<ModeratorDashboard />} />
          </Route>

          {/* Institution rep routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.INSTITUTION_REP]} />}>
            <Route path="/dashboard/institution-rep" element={<InstitutionRepDashboard />} />
          </Route>

          {/* Admin + Moderator shared routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]} />}>
            <Route path="/admin/reviews/moderation" element={<ReviewModeration />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<RoleBasedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/admin/colleges" element={<ManageColleges />} />
            <Route path="/admin/colleges/create" element={<CreateCollege />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/courses/create" element={<CreateCourse />} />
            <Route path="/admin/exams" element={<ManageExams />} />
            <Route path="/admin/exams/create" element={<CreateExam />} />
            <Route path="/admin/blogs" element={<ManageBlogs />} />
            <Route path="/admin/blogs/create" element={<CreateBlog />} />
            <Route path="/admin/import" element={<ImportData />} />
            <Route path="/admin/leads"     element={<AdminLeads />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/role-requests" element={<AdminRoleRequests />} />
            <Route path="/admin/guide" element={<AdminGuide />} />
            <Route path="/admin/video-testimonials" element={<AdminVideoTestimonials />} />
          <Route path="/admin/colleges/edit/:id" element={<CreateCollege />} />
          <Route path="/admin/courses/edit/:id" element={<CreateCourse />} />
          <Route path="/admin/exams/edit/:id" element={<CreateExam />} />

          </Route>

        </Route>
      </Routes>
    </>
  );
}

export default App;