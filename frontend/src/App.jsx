import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import QuizPage from './pages/QuizPage';
import QuizInfoPage from './pages/QuizInfoPage';
import ResultPage from './pages/ResultPage';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  // [TEMP] توجيه الطلاب مباشرة للوحة التحكم بدون تسجيل دخول
  if (!user) return <Navigate to="/student" />;
  return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/student" element={
              // <ProtectedRoute role="student">
                <StudentDashboard />
              // </ProtectedRoute>
            } />
            
            <Route path="/quiz/:id" element={
              // <ProtectedRoute role="student">
                <QuizInfoPage />
              // </ProtectedRoute>
            } />

            <Route path="/quiz/:id/play" element={
              // <ProtectedRoute role="student">
                <QuizPage />
              // </ProtectedRoute>
            } />
            
            <Route path="/result/:id" element={
              // <ProtectedRoute role="student">
                <ResultPage />
              // </ProtectedRoute>
            } />
            
            <Route path="/teacher" element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
