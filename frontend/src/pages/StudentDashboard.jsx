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
        
        let takenQuizzes = [];
        try {
          takenQuizzes = JSON.parse(localStorage.getItem('takenQuizzes') || '[]');
        } catch(e) {}

        const availableQuizzes = res.data.filter(quiz => {
          if (takenQuizzes.includes(quiz._id) && quiz.allowMultipleAttempts === false) {
            return false;
          }
          return true;
        });

        setQuizzes(availableQuizzes);
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
      {/* [TEMP] تم إيقاف القائمة الجانبية للطالب بناءً على الطلب */}
      {/* <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      /> */}

      <main className={`flex-1 transition-all duration-300`}>
        <div className="lg:hidden bg-white border-b p-4 sticky top-0 z-50 flex items-center justify-center">
           {/* <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-50 rounded-lg">
             <Menu className="w-5 h-5 text-slate-800" />
           </button> */}
           <span className="font-bold text-slate-800 text-sm">منصة الاختبارات الإلكترونية</span>
        </div>
        <div className="p-4 md:p-6 max-w-6xl mx-auto">

          {activeTab === 'quizzes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="bg-white h-40 rounded-xl animate-pulse border"></div>)
              ) : quizzes.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                  <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mb-6">
                    <ClipboardList className="w-12 h-12 text-sky-400" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">لا يوجد اختبارات متاحة حالياً</h3>
                  <p className="text-slate-500 text-base max-w-md">

                  </p>
                </div>
              ) : quizzes.map(quiz => (
                <div 
                  key={quiz._id} 
                  onClick={() => navigate(`/quiz/${quiz._id}`)}
                  className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Clock className="w-4 h-4 ml-1.5" />
                      {quiz.timeLimit} دقيقة
                    </div>
                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                      <ClipboardList className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{quiz.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2 h-10">{quiz.description || 'لا يوجد وصف متاح للاختبار.'}</p>
                    
                    {quiz.scheduledStartTime && (
                      <p className="text-xs font-bold text-orange-500 bg-orange-50 inline-block px-2 py-1 rounded">
                        مجدول: {new Date(quiz.scheduledStartTime).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
