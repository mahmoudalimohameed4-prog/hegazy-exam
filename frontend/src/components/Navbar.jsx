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

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
