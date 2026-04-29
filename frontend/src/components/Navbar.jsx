import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, ClipboardList } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse">
              <div className="bg-primary-600 p-2 rounded-lg">
                <ClipboardList className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-navy-900">منصة الاختبارات</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="hidden md:flex items-center space-x-4 space-x-reverse ml-4">
              {user.role === 'teacher' ? (
                <Link to="/teacher" className="text-gray-600 hover:text-primary-600 font-medium">لوحة التحكم</Link>
              ) : (
                <Link to="/student" className="text-gray-600 hover:text-primary-600 font-medium">اختباراتي</Link>
              )}
            </div>

            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <User className="w-4 h-4 text-gray-500 ml-2" />
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
              <span className="mx-2 text-gray-300">|</span>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
