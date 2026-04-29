import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, BarChart, ArrowRight, Download, Trophy, Target, ClipboardCheck, Printer, Home } from 'lucide-react';
import Swal from 'sweetalert2';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/results/${id}`);
        setResult(res.data);
      } catch (err) {
        Swal.fire('خطأ!', 'فشل في تحميل النتيجة', 'error');
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-600"></div>
    </div>
  );

  if (!result) return null;

  const ModernButton = ({ onClick, text, icon: Icon, colorClass = "bg-sky-600", darkColorClass = "bg-sky-700", className = "" }) => (
    <button 
      onClick={onClick} 
      className={`flex items-center rounded-2xl overflow-hidden shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <span className={`flex-1 px-6 py-4 ${colorClass} text-white font-bold text-center`}>{text}</span>
      <span className={`p-4 ${darkColorClass} text-white flex items-center justify-center border-r border-white/10`}>
        <Icon className="w-6 h-6" />
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-0 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="inline-flex p-4 bg-sky-50 rounded-full mb-6">
              <Trophy className="w-12 h-12 text-sky-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">تهانينا! لقد أتممت الاختبار</h1>
            <p className="text-slate-500 text-lg">{result.quiz?.title}</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="p-3 bg-blue-50 rounded-2xl mb-4 text-blue-600">
              <BarChart className="w-6 h-6" />
            </div>
            <span className="text-gray-400 text-sm font-bold mb-1">النتيجة النهائية</span>
            <div className="text-2xl font-black text-slate-900">{result.score} / {result.total}</div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="p-3 bg-green-50 rounded-2xl mb-4 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-gray-400 text-sm font-bold mb-1">إجابات صحيحة</span>
            <div className="text-2xl font-black text-green-600">{result.correctAnswers}</div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="p-3 bg-red-50 rounded-2xl mb-4 text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
            <span className="text-gray-400 text-sm font-bold mb-1">إجابات خاطئة</span>
            <div className="text-2xl font-black text-red-600">{result.wrongAnswers}</div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="p-3 bg-purple-50 rounded-2xl mb-4 text-purple-600">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-gray-400 text-sm font-bold mb-1">النسبة المئوية</span>
            <div className="text-2xl font-black text-purple-600">{result.percentage.toFixed(1)}%</div>
          </div>

        </div>

        {/* Detailed Feedback & Actions */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <ClipboardCheck className="w-6 h-6 ml-2 text-sky-600" />
            ملخص الأداء
          </h3>
          
          <div className="space-y-6 mb-10">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-gray-600 font-bold">إجمالي عدد الأسئلة</span>
              <span className="text-slate-900 font-black">{result.total} سؤال</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-gray-600 font-bold">تاريخ ووقت الانتهاء</span>
              <span className="text-slate-900 font-black">{new Date(result.finishedAt).toLocaleString('ar-EG')}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-gray-600 font-bold">الحالة</span>
              <span className={`px-4 py-1 rounded-full text-sm font-bold ${result.percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {result.percentage >= 50 ? 'ناجح' : 'راسب'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <ModernButton 
              onClick={() => navigate('/student')} 
              text="العودة للرئيسية" 
              icon={Home} 
              colorClass="bg-slate-900" 
              darkColorClass="bg-black" 
              className="flex-1"
            />
            <ModernButton 
              onClick={() => window.print()} 
              text="طباعة النتيجة" 
              icon={Printer} 
              colorClass="bg-sky-600" 
              darkColorClass="bg-sky-700" 
              className="flex-1"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultPage;
