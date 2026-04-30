import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);

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

  useEffect(() => {
    if (loading || !result) return;
    
    if (timeLeft <= 0) {
      navigate('/student');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, result, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!result) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    navigate('/student');
  };

  return (
    <div className="min-h-screen bg-[#f8fdfc] relative overflow-hidden flex items-center justify-center p-4 font-cairo" dir="rtl">

      {/* Decorative scattered elements (Static Confetti from Image) */}
      <div className="absolute top-10 left-1/4 w-3 h-8 bg-blue-300 rotate-45 rounded-sm opacity-60"></div>
      <div className="absolute top-20 right-1/4 w-4 h-4 bg-orange-300 rotate-12 rounded-sm opacity-60"></div>
      <div className="absolute top-32 left-1/3 w-3 h-3 bg-purple-400 rotate-45 rounded-sm opacity-60"></div>
      <div className="absolute top-12 right-1/3 w-5 h-2 bg-green-300 -rotate-12 rounded-sm opacity-60"></div>

      {/* Background Waves */}
      <svg className="absolute bottom-0 left-0 w-full z-0 opacity-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '30vh' }}>
        <path fill="#bfdbfe" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,245.3C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        <path fill="#3b82f6" fillOpacity="0.8" d="M0,256L48,266.7C96,277,192,299,288,288C384,277,480,235,576,224C672,213,768,235,864,245.3C960,256,1056,256,1152,240C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 pb-10 shadow-xl shadow-blue-900/5 relative z-10 mx-auto mt-10">
        
        {/* Stats Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <span className="text-slate-700 font-bold text-[15px]">إجمالي عدد الاسئلة:</span>
            <span className="text-blue-500 font-bold text-xl">{result.total}</span>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <span className="text-slate-700 font-bold text-[15px]">عدد الاسئلة الصحيحة:</span>
            <span className="text-blue-500 font-bold text-xl">{result.correctAnswers}</span>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <span className="text-slate-700 font-bold text-[15px]">عدد الاسئلة الخاطئة:</span>
            <span className="text-blue-500 font-bold text-xl">{result.wrongAnswers}</span>
          </div>

          <div className="flex justify-between items-center py-4">
            <span className="text-slate-700 font-bold text-[15px]">درجة الطالب:</span>
            <span className="text-blue-500 font-bold text-xl">{result.score}</span>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t-2 border-blue-400 mb-6 mx-2" />

        {/* Timer Section */}
        <div className="text-center mb-8">
          <p className="text-[13px] font-bold text-slate-700 mb-4">سيتم تسجيل خروجك بعد:</p>
          
          <div className="relative inline-flex items-center justify-center w-36 h-16">
            {/* Dashed Border Overlay */}
            <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-[50px] opacity-70"></div>
            {/* Dots on border */}
            <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
            <div className="absolute -bottom-[3px] right-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
            <div className="absolute top-1/2 -right-[3px] -translate-y-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
            <div className="absolute top-1/4 -left-[3px] w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
            
            <div className="text-4xl font-normal text-blue-500" style={{ fontFamily: 'monospace' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <button 
            onClick={handleFinish}
            className="w-48 bg-blue-500 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
          >
            انتهاء
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResultPage;
