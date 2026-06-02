import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Common pages
import Landing from './pages/Landing.jsx';
import ErrorPage from './pages/common/ErrorPage.jsx';

// Auth pages
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import RoleSelection from './pages/auth/RoleSelection.jsx';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import HomeworkList from './pages/student/HomeworkList.jsx';
import StudyPDF from './pages/student/StudyPDF.jsx';
import MCQQuiz from './pages/student/MCQQuiz.jsx';
import FocusMode from './pages/student/FocusMode.jsx';
import RewardsShop from './pages/student/RewardsShop.jsx';
import Notifications from './pages/student/Notifications.jsx';
import StudentAnalytics from './pages/student/StudentAnalytics.jsx';
import Profile from './pages/student/Profile.jsx';
import SettingsPage from './pages/student/Settings.jsx';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import HomeworkUpload from './pages/teacher/HomeworkUpload.jsx';
import QuizCreation from './pages/teacher/QuizCreation.jsx';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics.jsx';

// Parent pages
import ParentDashboard from './pages/parent/ParentDashboard.jsx';
import ProgressReports from './pages/parent/ProgressReports.jsx';
import FocusMonitoring from './pages/parent/FocusMonitoring.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/select-role" element={<RoleSelection />} />

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/homework"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <HomeworkList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/homework/:id/study"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudyPDF />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/homework/:id/quiz"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <MCQQuiz />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/focus"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <FocusMode />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/rewards"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <RewardsShop />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'parent']}>
                <DashboardLayout>
                  <Notifications />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/analytics"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <StudentAnalytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'parent']}>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Teacher Protected Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout>
                  <TeacherDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/upload"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout>
                  <HomeworkUpload />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/create-quiz"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout>
                  <QuizCreation />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/analytics"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout>
                  <TeacherAnalytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Parent Protected Routes */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <DashboardLayout>
                  <ParentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/reports"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <DashboardLayout>
                  <ProgressReports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/focus-logs"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <DashboardLayout>
                  <FocusMonitoring />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallbacks */}
          <Route path="/404" element={<ErrorPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
