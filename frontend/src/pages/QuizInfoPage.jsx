import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { Clock, ClipboardList, Play } from 'lucide-react';
import Swal from 'sweetalert2';

const QuizInfoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchQuizInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/quizzes/${id}`);
        setQuiz(res.data);
      } catch (err) {
        Swal.fire('خطأ!', 'فشل في تحميل تفاصيل الاختبار', 'error');
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizInfo();
  }, [id, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!quiz) return null;

  let isButtonDisabled = false;
  let buttonText = "ابدأ الاختبار الآن";

  if (quiz.scheduledStartTime) {
    const startTime = new Date(quiz.scheduledStartTime);
    if (currentTime < startTime) {
      isButtonDisabled = true;
      buttonText = `يبدأ في: ${startTime.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}`;
    }
  }

  const handleStart = () => {
    if (!isButtonDisabled) {
      navigate(`/quiz/${id}/play`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-sm border border-slate-100">
        
        {/* Top Badges */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Clock className="w-4 h-4 ml-1.5" />
            {quiz.timeLimit} دقيقة
          </div>

          <div className="p-3 bg-sky-50 rounded-2xl">
            <ClipboardList className="w-6 h-6 text-sky-500" />
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-right mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">{quiz.title}</h2>
          <p className="text-slate-500 text-sm">
            {quiz.description || 'لا يوجد وصف متاح للاختبار.'}
          </p>
          <p className="text-slate-500 text-sm mt-2 font-bold">
            عدد الأسئلة: {quiz.questions?.length || 0} أسئلة
          </p>
        </div>

        {/* Button */}
        <button 
          onClick={handleStart}
          disabled={isButtonDisabled}
          className={`relative w-full flex items-center rounded-2xl overflow-hidden transition-all shadow-md group ${
            isButtonDisabled ? 'bg-slate-300 cursor-not-allowed opacity-70' : 'bg-[#0f172a] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {/* Black Text section */}
          <span className={`flex-1 px-6 py-4 text-center text-white text-base font-bold ${isButtonDisabled ? 'text-slate-500' : ''}`}>
            {buttonText}
          </span>
          
          {/* Left Icon section */}
          <span className="px-5 py-4 bg-black text-white flex items-center justify-center border-r border-white/10">
            <Play className={`w-5 h-5 ${isButtonDisabled ? 'text-slate-500' : 'text-white'}`} />
          </span>
        </button>

      </div>

    </div>
  );
};

export default QuizInfoPage;
