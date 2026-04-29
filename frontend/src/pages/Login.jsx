import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, LogIn } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
        identifier: formData.identifier,
        password: formData.password,
      });
      login(res.data.token, res.data.user);
      Swal.fire({
        icon: 'success',
        title: 'تم تسجيل الدخول بنجاح',
        text: `مرحباً بك، ${res.data.user.name}`,
        timer: 1500,
        showConfirmButton: false
      });
      navigate(res.data.user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'فشل الدخول',
        text: err.response?.data?.message || 'المعرف أو كلمة المرور غير صحيحة',
        confirmButtonText: 'حاول مرة أخرى'
      });
    } finally {
      setLoading(false);
    }
  };

  const ModernButton = ({ text, icon: Icon, loading, colorClass = "bg-sky-600", darkColorClass = "bg-sky-700", className = "" }) => (
    <button 
      type="submit" 
      disabled={loading}
      className={`flex items-center rounded-2xl overflow-hidden shadow-lg shadow-sky-100 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 ${className}`}
    >
      <span className={`flex-1 py-4 ${colorClass} text-white font-black text-center`}>{loading ? 'جاري الدخول...' : text}</span>
      <span className={`p-4 ${darkColorClass} text-white flex items-center justify-center border-r border-white/10`}>
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-sky-600 p-10 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black mb-2">تسجيل الدخول</h2>
          <p className="text-sky-100 text-sm font-medium">منصة الاختبارات الإلكترونية الذكية</p>
        </div>

        <div className="p-8 md:p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 mr-1">المعرف (رقم الهاتف أو الرقم القومي)</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="أدخل المعرف الخاص بك"
                  className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 mr-1">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <ModernButton 
              text="دخول للمنصة" 
              icon={LogIn} 
              loading={loading}
              className="w-full"
            />
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-medium">إذا واجهت مشكلة في الدخول، يرجى التواصل مع الإدارة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
