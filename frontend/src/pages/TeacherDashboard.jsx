import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Users, ClipboardList, Eye, X, Check, Menu, Search, Edit3, ArrowRight, UserPlus, Save, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Swal from 'sweetalert2';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('quizzes');
  const [subView, setSubView] = useState('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  
  const [newQuiz, setNewQuiz] = useState({
    title: '', description: '', timeLimit: 30, allowMultipleAttempts: true,
    questions: [{ questionText: '', options: ['', '', '', ''], correctIndex: 0 }]
  });

  const [userData, setUserData] = useState({
    identifier: '', identifierType: 'national_id', password: '', name: '', role: 'student'
  });

  useEffect(() => {
    fetchData();
    setSubView('list');
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'quizzes') {
        const res = await axios.get('${API_BASE_URL}/api/v1/quizzes/my');
        setQuizzes(res.data);
      } else if (activeTab === 'analytics') {
        const res = await axios.get('${API_BASE_URL}/api/v1/results/teacher/all');
        setResults(res.data);
      } else if (activeTab === 'users') {
        const res = await axios.get('${API_BASE_URL}/api/v1/auth/users');
        setUsers(res.data);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'جاري الحفظ...', didOpen: () => Swal.showLoading() });
    try {
      if (editingQuizId) {
        await axios.put(`${API_BASE_URL}/api/v1/quizzes/${editingQuizId}`, newQuiz);
        Swal.fire({ icon: 'success', title: 'تم التعديل!', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post('${API_BASE_URL}/api/v1/quizzes', newQuiz);
        Swal.fire({ icon: 'success', title: 'تم النشر!', timer: 1500, showConfirmButton: false });
      }
      setSubView('list');
      setEditingQuizId(null);
      fetchData();
    } catch (err) { Swal.fire('خطأ!', 'فشل تنفيذ العملية', 'error'); }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'جاري الحفظ...', didOpen: () => Swal.showLoading() });
    try {
      if (editingUserId) {
        await axios.put(`${API_BASE_URL}/api/v1/auth/users/${editingUserId}`, userData);
        Swal.fire({ icon: 'success', title: 'تم تحديث البيانات!', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post('${API_BASE_URL}/api/v1/auth/add-user', userData);
        Swal.fire({ icon: 'success', title: 'تمت الإضافة!', timer: 1500, showConfirmButton: false });
      }
      setSubView('list');
      setEditingUserId(null);
      fetchData();
    } catch (err) {
      Swal.fire('خطأ!', err.response?.data?.message || 'فشل تنفيذ العملية', 'error');
    }
  };

  const handleEditUser = (user) => {
    setUserData({
      name: user.name,
      identifier: user.identifier,
      identifierType: user.identifierType,
      role: user.role,
      password: ''
    });
    setEditingUserId(user._id);
    setSubView('create');
  };

  const handleDeleteUser = async (id) => {
    const res = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم حذف هذا المستخدم ونتائجه نهائياً!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: 'نعم، احذفه',
      cancelButtonText: 'إلغاء'
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/v1/auth/users/${id}`);
        Swal.fire({ icon: 'success', title: 'تم الحذف!', timer: 1000, showConfirmButton: false });
        fetchData();
      } catch (err) {
        Swal.fire('خطأ!', 'فشل الحذف', 'error');
      }
    }
  };

  const handleEditQuiz = (quiz) => {
    setNewQuiz({ title: quiz.title, description: quiz.description, timeLimit: quiz.timeLimit, allowMultipleAttempts: quiz.allowMultipleAttempts ?? true, scheduledStartTime: quiz.scheduledStartTime || '', questions: quiz.questions });
    setEditingQuizId(quiz._id);
    setSubView('edit');
  };

  const handleDeleteQuiz = async (id) => {
    const res = await Swal.fire({ title: 'هل أنت متأكد؟', icon: 'warning', showCancelButton: true, confirmButtonText: 'نعم، احذف', cancelButtonText: 'إلغاء' });
    if (res.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/api/v1/quizzes/${id}`);
        fetchData();
      } catch (err) { Swal.fire('خطأ!', 'فشل الحذف', 'error'); }
    }
  };

  const ModernButton = ({ onClick, text, icon: Icon, colorClass = "bg-sky-600", darkColorClass = "bg-sky-700", type = "button", className = "" }) => (
    <button 
      type={type} 
      onClick={onClick} 
      className={`flex items-center rounded-xl overflow-hidden shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <span className={`px-4 py-2 ${colorClass} text-white text-xs font-bold`}>{text}</span>
      <span className={`p-2 ${darkColorClass} text-white flex items-center justify-center border-r border-white/10`}>
        <Icon className="w-4 h-4" />
      </span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pr-20' : 'lg:pr-72'}`}>
        <div className="lg:hidden bg-white border-b p-4 sticky top-0 z-50 flex items-center justify-between">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-50 rounded-lg"><Menu className="w-5 h-5" /></button>
           <span className="font-bold text-slate-800">منصة الإدارة</span>
        </div>

        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              {subView !== 'list' && (
                <button onClick={() => { setSubView('list'); setEditingUserId(null); }} className="flex items-center text-sky-600 font-bold text-sm mb-1">
                  <ArrowRight className="w-4 h-4 ml-1" /> العودة للقائمة
                </button>
              )}
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                {subView === 'create' && editingUserId ? 'تعديل المستخدم' : subView === 'create' ? 'إضافة مستخدم' : subView === 'edit' ? 'تعديل الاختبار' : activeTab === 'quizzes' ? 'الاختبارات' : activeTab === 'users' ? 'إدارة الطلاب والمساعدين' : 'النتائج والتقارير'}
              </h1>
            </div>
            
            {subView === 'list' && (
              <div className="flex gap-2">
                {activeTab === 'quizzes' && (
                  <ModernButton 
                    text="إنشاء اختبار" 
                    icon={Plus} 
                    onClick={() => { setEditingQuizId(null); setNewQuiz({ title: '', description: '', timeLimit: 30, allowMultipleAttempts: true, questions: [{ questionText: '', options: ['', '', '', ''], correctIndex: 0 }] }); setSubView('create'); }} 
                  />
                )}
                {activeTab === 'users' && (
                  <ModernButton 
                    text="إضافة مستخدم" 
                    icon={UserPlus} 
                    onClick={() => { setEditingUserId(null); setUserData({ identifier: '', identifierType: 'national_id', password: '', name: '', role: 'student' }); setSubView('create'); }} 
                  />
                )}
              </div>
            )}
          </div>

          {activeTab === 'quizzes' && (
            <>
              {subView === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {loading ? [1,2,3].map(i => <div key={i} className="bg-white h-40 rounded-xl animate-pulse border"></div>) : quizzes.map(quiz => (
                    <div key={quiz._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-sky-300 transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-800 line-clamp-1">{quiz.title}</h3>
                        <span className="bg-sky-50 text-sky-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{quiz.timeLimit} د</span>
                      </div>
                      <p className="text-slate-500 text-xs mb-4 line-clamp-2 h-8">{quiz.description || 'لا يوجد وصف'}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><ClipboardList className="w-3 h-3" /> {quiz.questions.length} سؤال</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditQuiz(quiz)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteQuiz(quiz._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleCreateQuiz} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">عنوان الاختبار</label>
                      <input type="text" className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-sky-500 text-sm" value={newQuiz.title} onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">الوقت (دقيقة)</label>
                      <input type="number" className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-sky-500 text-sm" value={newQuiz.timeLimit} onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">وقت البدء (اختياري)</label>
                      <input type="datetime-local" className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:border-sky-500 text-sm" value={newQuiz.scheduledStartTime ? new Date(new Date(newQuiz.scheduledStartTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={(e) => setNewQuiz({ ...newQuiz, scheduledStartTime: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-600 mb-2">نظام محاولات الطالب</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setNewQuiz({ ...newQuiz, allowMultipleAttempts: true })}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${newQuiz.allowMultipleAttempts ? 'border-sky-500 bg-sky-50' : 'border-white bg-white hover:border-slate-100'}`}
                      >
                        <span className={`text-sm font-bold ${newQuiz.allowMultipleAttempts ? 'text-sky-700' : 'text-slate-600'}`}>محاولات متعددة</span>
                        <span className="text-[10px] text-slate-400 mt-1">يمكن للطالب إعادة الاختبار</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewQuiz({ ...newQuiz, allowMultipleAttempts: false })}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${!newQuiz.allowMultipleAttempts ? 'border-sky-500 bg-sky-50' : 'border-white bg-white hover:border-slate-100'}`}
                      >
                        <span className={`text-sm font-bold ${!newQuiz.allowMultipleAttempts ? 'text-sky-700' : 'text-slate-600'}`}>مرة واحدة فقط</span>
                        <span className="text-[10px] text-slate-400 mt-1">يختفي الاختبار بعد الحل</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h3 className="font-bold text-slate-800 text-sm">أسئلة الاختبار</h3>
                    </div>
                    {newQuiz.questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                        <button type="button" onClick={() => { const qs = [...newQuiz.questions]; qs.splice(qIndex, 1); setNewQuiz({ ...newQuiz, questions: qs }); }} className="absolute left-3 top-3 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                        <div className="mb-4">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">السؤال {qIndex + 1}</label>
                          <input type="text" className="w-full p-2 bg-white border rounded-lg outline-none text-sm" value={q.questionText} onChange={(e) => { const qs = [...newQuiz.questions]; qs[qIndex].questionText = e.target.value; setNewQuiz({ ...newQuiz, questions: qs }); }} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((option, oIndex) => (
                            <div key={oIndex} className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${q.correctIndex === oIndex ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}>
                              <button type="button" onClick={() => { const qs = [...newQuiz.questions]; qs[qIndex].correctIndex = oIndex; setNewQuiz({ ...newQuiz, questions: qs }); }} className={`w-7 h-7 rounded flex items-center justify-center text-xs ${q.correctIndex === oIndex ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{q.correctIndex === oIndex ? <Check className="w-4 h-4" /> : (oIndex + 1)}</button>
                              <input type="text" placeholder={`الخيار ${oIndex + 1}`} className="flex-1 bg-transparent outline-none text-xs" value={option} onChange={(e) => { const qs = [...newQuiz.questions]; qs[qIndex].options[oIndex] = e.target.value; setNewQuiz({ ...newQuiz, questions: qs }); }} required />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button 
                      type="button" 
                      onClick={() => setNewQuiz({...newQuiz, questions: [...newQuiz.questions, { questionText: '', options: ['', '', '', ''], correctIndex: 0 }]})} 
                      className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-bold">إضافة سؤال جديد</span>
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <ModernButton type="submit" text="حفظ التغييرات" icon={Check} colorClass="bg-emerald-600" darkColorClass="bg-emerald-700" className="flex-1" />
                    <ModernButton text="إلغاء" icon={X} colorClass="bg-slate-500" darkColorClass="bg-slate-600" onClick={() => setSubView('list')} />
                  </div>
                </form>
              )}
            </>
          )}

          {activeTab === 'users' && (
            subView === 'list' ? (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto text-sm">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="px-6 py-3">الاسم</th>
                        <th className="px-6 py-3">المعرف</th>
                        <th className="px-6 py-3 text-center">الدور</th>
                        <th className="px-6 py-3">التاريخ</th>
                        <th className="px-6 py-3 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? [1,2,3].map(i => <tr key={i}><td colSpan="5" className="px-6 py-4 animate-pulse"><div className="h-6 bg-slate-50 rounded"></div></td></tr>) : users.map(user => (
                        <tr key={user._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-bold text-slate-700">{user.name}</td>
                          <td className="px-6 py-3 text-slate-500">{user.identifier}</td>
                          <td className="px-6 py-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.role === 'teacher' ? 'bg-purple-50 text-purple-600' : 'bg-sky-50 text-sky-600'}`}>{user.role === 'teacher' ? 'مساعد' : 'طالب'}</span></td>
                          <td className="px-6 py-3 text-slate-400 text-xs">{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                          <td className="px-6 py-3">
                            <div className="flex justify-center gap-1">
                              <button onClick={() => handleEditUser(user)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteUser(user._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="max-w-xl bg-white rounded-2xl border border-slate-200 p-6 animate-in slide-in-from-bottom-2">
                <form onSubmit={handleUserSubmit} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">نوع الحساب</label>
                        <div className="flex p-1 bg-slate-100 rounded-lg">
                          <button type="button" onClick={() => setUserData({...userData, role: 'student'})} className={`flex-1 py-1.5 rounded text-xs font-bold ${userData.role === 'student' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>طالب</button>
                          <button type="button" onClick={() => setUserData({...userData, role: 'teacher'})} className={`flex-1 py-1.5 rounded text-xs font-bold ${userData.role === 'teacher' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>مساعد</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">الاسم الكامل</label>
                        <input type="text" className="w-full p-2 bg-slate-50 border rounded-lg outline-none text-sm" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} required />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">نوع الدخول</label><select className="w-full p-2 bg-slate-50 border rounded-lg outline-none text-sm" value={userData.identifierType} onChange={(e) => setUserData({...userData, identifierType: e.target.value, identifier: ''})}><option value="national_id">الرقم القومي</option><option value="phone">رقم الهاتف</option></select></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1">المعرف</label><input type="text" className="w-full p-2 bg-slate-50 border rounded-lg outline-none text-sm" value={userData.identifier} onChange={(e) => setUserData({...userData, identifier: e.target.value})} required /></div>
                   </div>
                   <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 mb-4">
                     <p className="text-[10px] text-sky-700 leading-relaxed font-bold">
                       ملاحظة: سيتم تعيين كلمة المرور تلقائياً لتكون هي نفسها "المعرف" الذي ستكتبه أعلاه. يمكن للطالب تغييرها لاحقاً من حسابه.
                     </p>
                   </div>
                   <div className="flex gap-3 pt-2">
                     <ModernButton type="submit" text={editingUserId ? 'تحديث البيانات' : 'تأكيد الإضافة'} icon={Save} colorClass="bg-emerald-600" darkColorClass="bg-emerald-700" className="flex-1" />
                     <ModernButton text="إلغاء" icon={X} colorClass="bg-slate-500" darkColorClass="bg-slate-600" onClick={() => { setSubView('list'); setEditingUserId(null); }} />
                   </div>
                </form>
              </div>
            )
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
               <div className="overflow-x-auto text-sm">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <th className="px-6 py-3">الطالب</th>
                        <th className="px-6 py-3">الاختبار</th>
                        <th className="px-6 py-3 text-center">الدرجة</th>
                        <th className="px-6 py-3 text-center">النسبة</th>
                        <th className="px-6 py-3">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? [1,2,3,4].map(i => <tr key={i}><td colSpan="5" className="px-6 py-3 animate-pulse"><div className="h-6 bg-slate-50 rounded"></div></td></tr>) : results.map((result) => (
                        <tr key={result._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3"><div className="font-bold text-slate-700 text-xs">{result.student?.name}</div><div className="text-[10px] text-slate-400">{result.student?.identifier}</div></td>
                          <td className="px-6 py-3 text-xs text-slate-600">{result.quiz?.title}</td>
                          <td className="px-6 py-3 text-center font-bold text-slate-700">{result.score} / {result.total}</td>
                          <td className="px-6 py-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${result.percentage >= 50 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{result.percentage.toFixed(0)}%</span></td>
                          <td className="px-6 py-3 text-[10px] text-slate-400">{new Date(result.finishedAt).toLocaleDateString('ar-EG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
