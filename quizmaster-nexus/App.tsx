import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { QuizRunner } from './pages/QuizRunner';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCourseEditor } from './pages/admin/AdminCourseEditor';
import { AdminQuizEditor } from './pages/admin/AdminQuizEditor';

// Simple Auth Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem('isAdmin') === 'true';
  if (!isAuth) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz/:quizId" element={<QuizRunner />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/course/new" element={
            <ProtectedRoute><AdminCourseEditor /></ProtectedRoute>
          } />
           <Route path="/admin/course/:courseId" element={
            <ProtectedRoute><AdminCourseEditor /></ProtectedRoute>
          } />
          <Route path="/admin/quiz/new" element={
            <ProtectedRoute><AdminQuizEditor /></ProtectedRoute>
          } />
          <Route path="/admin/quiz/:quizId" element={
            <ProtectedRoute><AdminQuizEditor /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;