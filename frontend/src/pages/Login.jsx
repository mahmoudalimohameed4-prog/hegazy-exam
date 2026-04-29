import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Phone, CreditCard, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
  const [authType, setAuthType] = useState('phone'); // 'phone' or 'national'
  const [step, setStep] = useState(1); // 1: input, 2: otp (if phone)
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    nationalId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/v1/auth/send-otp', { phone: formData.phone });
      Swal.fire({
        icon: 'success',
        title: 'تم إرسال الكود',
        text: 'يرجى مراجعة هاتفك (أو كونسول الخادم في نسخة المطور)',
        timer: 3000,
        showConfirmButton: false
      });
      setStep(2);
    } catch (err) {
      Swal.fire('خطأ!', err.response?.data?.message || 'فشل في إرسال الكود', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/verify-otp', {
        phone: formData.phone,
        otp: formData.otp,
      });
      login(res.data.token, res.data.user);
      Swal.fire({
        icon: 'success',
        title: 'تم تسجيل الدخول',
        timer: 1500,
        showConfirmButton: false
      });
      navigate(res.data.user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      Swal.fire('خطأ!', 'كود غير صحيح', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNationalLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/login-national', {
        nationalId: formData.nationalId,
        password: formData.password,
      });
      login(res.data.token, res.data.user);
      Swal.fire({
        icon: 'success',
        title: 'تم تسجيل الدخول',
        timer: 1500,
        showConfirmButton: false
      });
      navigate(res.data.user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      Swal.fire('خطأ!', err.response?.data?.message || 'فشل تسجيل الدخول', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-primary-600 p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-2">مرحباً بك</h2>
          <p className="text-primary-100">سجل الدخول للمتابعة في منصة الاختبارات</p>
        </div>

        <div className="p-8">
          <div className="flex mb-8 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => { setAuthType('phone'); setStep(1); setError(''); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${authType === 'phone' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
              رقم الهاتف
            </button>
            <button
              onClick={() => { setAuthType('national'); setError(''); }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${authType === 'national' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
              الرقم القومي
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {authType === 'phone' ? (
            step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="01xxxxxxxxx"
                      className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary-200 flex items-center justify-center space-x-2 space-x-reverse"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال كود التحقق'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كود التحقق (OTP)</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="------"
                      className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none tracking-widest text-center text-xl font-bold"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">أدخل الكود المكون من 6 أرقام المطبوع في كونسول الخادم</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary-200"
                >
                  {loading ? 'جاري التحقق...' : 'تأكيد الدخول'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-gray-500 text-sm font-medium hover:text-gray-700"
                >
                  تغيير رقم الهاتف
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleNationalLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرقم القومي</label>
                <div className="relative">
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="14 رقم"
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary-200"
              >
                {loading ? 'جاري الدخول...' : 'دخول'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
