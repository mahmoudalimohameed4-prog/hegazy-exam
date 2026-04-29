import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, ClipboardList, BarChart3, Clock, CheckCircle2, Menu, Settings, Lock, Eye, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('quizzes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'quizzes') {
        const res = await axios.get('http://localhost:5000/api/v1/quizzes');
        setQuizzes(res.data);
      } else if (activeTab === 'results') {
        const res = await axios.get('http://localhost:5000/api/v1/results/myresults');
        setResults(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/v1/auth/update-password', { password: newPassword });
      Swal.fire({ icon: 'success', title: 'تم التحديث!', timer: 1500, showConfirmButton: false });
      setNewPassword('');
    } catch (err) {
      Swal.fire('خطأ!', 'فشل تحديث كلمة المرور', 'error');
    }
  };

  const ModernButton = ({ onClick, text, icon: Icon, colorClass = "bg-sky-600", darkColorClass = "bg-sky-700", type = "button", className = "" }) => (
    <button 
      type={type} 
      onClick={onClick} 
      className={`flex items-center rounded-xl overflow-hidden shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <span className={`flex-1 px-4 py-2.5 ${colorClass} text-white text-xs font-bold`}>{text}</span>
      <span className={`p-2.5 ${darkColorClass} text-white flex items-center justify-center border-r border-white/10`}>
        <Icon className="w-4 h-4" />
      </span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pr-20' : 'lg:pr-72'}`}>
        <div className="lg:hidden bg-white border-b p-4 sticky top-0 z-50 flex items-center justify-between">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-50 rounded-lg">
             <Menu className="w-5 h-5 text-slate-800" />
           </button>
           <span className="font-bold text-slate-800 text-sm">منصة الطالب</span>
        </div>
        <div className="p-4 md:p-6 max-w-6xl mx-auto">

          {activeTab === 'quizzes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="bg-white h-40 rounded-xl animate-pulse border"></div>)
              ) : quizzes.map(quiz => (
                <div key={quiz._id} className="bg-white rounded-xl p-5 border border-slate-100 hover:border-sky-200 transition-all shadow-sm group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-sky-50 rounded-lg group-hover:bg-sky-600 transition-colors">
                      <ClipboardList className="w-5 h-5 text-sky-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 ml-1" />
                      {quiz.timeLimit} دقيقة
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">{quiz.title}</h3>
                  <p className="text-slate-500 text-xs mb-6 line-clamp-2 h-8">{quiz.description || 'لا يوجد وصف متاح للاختبار.'}</p>
                  
                  <ModernButton 
                    text="ابدأ الاختبار الآن" 
                    icon={Play} 
                    colorClass="bg-slate-900" 
                    darkColorClass="bg-black" 
                    className="w-full"
                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
               <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm">سجل نتائجك السابقة</h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="text-slate-400 font-bold bg-slate-50/20 border-b border-slate-50">
                        <th className="px-6 py-3">الاختبار</th>
                        <th className="px-6 py-3 text-center">صح</th>
                        <th className="px-6 py-3 text-center">خطأ</th>
                        <th className="px-6 py-3 text-center">الدرجة</th>
                        <th className="px-6 py-3 text-center">النسبة</th>
                        <th className="px-6 py-3">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        [1,2,3].map(i => <tr key={i}><td colSpan="6" className="px-6 py-3 animate-pulse"><div className="h-6 bg-slate-50 rounded"></div></td></tr>)
                      ) : results.length > 0 ? results.map((result) => (
                        <tr key={result._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3 font-bold text-slate-700">{result.quiz?.title}</td>
                          <td className="px-6 py-3 text-center font-bold text-green-600">{result.correctAnswers}</td>
                          <td className="px-6 py-3 text-center font-bold text-red-600">{result.wrongAnswers}</td>
                          <td className="px-6 py-3 text-center font-bold text-slate-800">{result.score} / {result.total}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${result.percentage >= 50 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {result.percentage.toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-6 py-3 text-[10px] text-slate-400">
                            {new Date(result.finishedAt).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-400">لم تقم بأداء أي اختبارات بعد</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">تغيير كلمة المرور</h2>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-sky-500 text-sm"
                    placeholder="أدخل كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <ModernButton 
                  type="submit" 
                  text="تحديث كلمة المرور" 
                  icon={Save} 
                  className="w-full"
                />
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
