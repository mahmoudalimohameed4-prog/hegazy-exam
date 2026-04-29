import React from 'react';
import { 
  Home, 
  Info, 
  Users, 
  GraduationCap, 
  BookOpen, 
  LogOut, 
  Menu,
  X,
  Settings,
  BarChart3,
  Book
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const teacherItems = [
    { id: 'quizzes', name: 'إدارة الاختبارات', icon: Home },
    { id: 'users', name: 'إدارة الطلاب والمساعدين', icon: Users },
    { id: 'analytics', name: 'النتائج والتقارير', icon: GraduationCap },
    { id: 'profile', name: 'البيانات الشخصية', icon: Info },
    { id: 'schedule', name: 'المواد الدراسية', icon: BookOpen },
  ];

  const studentItems = [
    { id: 'quizzes', name: 'الاختبارات المتاحة', icon: Book },
    { id: 'results', name: 'إحصائياتي ونتائجي', icon: BarChart3 },
    { id: 'settings', name: 'إعدادات الحساب', icon: Settings },
    { id: 'profile', name: 'بياناتي', icon: Info },
  ];

  const menuItems = user?.role === 'teacher' ? teacherItems : studentItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 right-0 bg-[#1a2e4c] text-white z-[60] transition-all duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 border-l border-white/5 shadow-2xl ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}>
        <div className="flex flex-col h-full overflow-hidden" dir="rtl">
          
          {/* Top Header */}
          <div className={`p-6 flex items-center border-b border-white/5 ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }} 
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              {window.innerWidth < 1024 ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            {(!isCollapsed || window.innerWidth < 1024) && (
              <h2 className="text-lg font-bold tracking-wide text-center flex-1 truncate mr-2">
                {user?.name || 'مستخدم النظام'}
              </h2>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-6 space-y-1 scrollbar-hide">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`group relative w-full flex items-center px-6 py-4 transition-all duration-200 ${(isCollapsed && window.innerWidth >= 1024) ? 'justify-center' : ''} ${
                  activeTab === item.id 
                    ? 'bg-[#1e3a63]' 
                    : 'hover:bg-white/5 text-white/70 hover:text-white'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                {/* Icon on Right */}
                <item.icon className={`w-6 h-6 transition-transform ${(isCollapsed && window.innerWidth >= 1024) ? '' : 'ml-4'} ${activeTab === item.id ? 'text-[#007bff] scale-110' : 'text-white/60 group-hover:text-white'}`} />

                {/* Text on Left (Hidden if collapsed on desktop) */}
                {(!isCollapsed || window.innerWidth < 1024) && (
                  <span className={`font-medium text-[15px] truncate ${activeTab === item.id ? 'text-white' : ''}`}>
                    {item.name}
                  </span>
                )}

                {/* Active Indicator Line */}
                {activeTab === item.id && (
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#007bff] shadow-[0_0_15px_rgba(0,123,255,0.5)]"></div>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Logout */}
          <div className={`p-4 border-t border-white/5 bg-black/10 flex ${(isCollapsed && window.innerWidth >= 1024) ? 'justify-center' : ''}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center rounded-2xl text-red-400 hover:bg-red-400/10 transition-all group ${(isCollapsed && window.innerWidth >= 1024) ? 'p-3' : 'px-6 py-4 w-full'}`}
              title={isCollapsed ? 'تسجيل الخروج' : ''}
            >
              <LogOut className={`w-5 h-5 group-hover:-translate-x-1 transition-transform ${(isCollapsed && window.innerWidth >= 1024) ? '' : 'ml-4'}`} />
              {(!isCollapsed || window.innerWidth < 1024) && <span className="font-bold">تسجيل الخروج</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
