import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { Clock, CheckCircle2, ChevronLeft, Send, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt] = useState(new Date());
  const [showLoadingCard, setShowLoadingCard] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1); // 1: Finished, 2: Correcting

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/quizzes/${id}`);
        
        try {
          const taken = JSON.parse(localStorage.getItem('takenQuizzes') || '[]');
          if (taken.includes(id) && res.data.allowMultipleAttempts === false) {
            Swal.fire({ icon: 'warning', title: 'عفواً!', text: 'لقد قمت بأداء هذا الاختبار بالفعل ولا يمكن إعادته.', confirmButtonText: 'حسناً' });
            navigate('/student');
            return;
          }
        } catch (e) {}

        setQuiz(res.data);
        setTimeLeft(res.data.timeLimit * 60);
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'خطأ!', text: 'فشل في تحميل الاختبار أو أنك لا تملك صلاحية الوصول', confirmButtonText: 'حسناً' });
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (submitting) return;
    
    if (!isAuto) {
      const confirmResult = await Swal.fire({
        title: 'إنهاء الاختبار؟',
        text: "هل تريد إرسال إجاباتك الآن؟",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0ea5e9',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'نعم، إرسال',
        cancelButtonText: 'إلغاء',
        reverseButtons: true
      });
      if (!confirmResult.isConfirmed) return;
    }

    setSubmitting(true);
    try {
      const answerArray = quiz.questions.map((q, index) => ({
        questionId: q._id,
        selectedOption: answers[index] ?? -1
      }));

      // Start the loading sequence before/during the API call
      setShowLoadingCard(true);
      setLoadingStep(1);

      const res = await axios.post(`${API_BASE_URL}/api/v1/results/submit`, {
        quizId: id,
        answers: answerArray,
        startedAt,
      });

      try {
        const taken = JSON.parse(localStorage.getItem('takenQuizzes') || '[]');
        if (!taken.includes(id)) {
          taken.push(id);
          localStorage.setItem('takenQuizzes', JSON.stringify(taken));
        }
      } catch (e) {}

      // Sequence timing
      setTimeout(() => {
        setLoadingStep(2); // Change to "Correcting"
        setTimeout(() => {
          navigate(`/result/${res.data._id}`);
        }, 3000); // Wait 3 seconds for correcting
      }, 2000); // Wait 2 seconds for finished

    } catch (err) {
      setShowLoadingCard(false);
      Swal.fire({ icon: 'error', title: 'خطأ!', text: 'فشل في إرسال الإجابات', confirmButtonText: 'حسناً' });
      setSubmitting(false);
    }
  }, [id, quiz, answers, startedAt, navigate, submitting]);

  useEffect(() => {
    if (timeLeft <= 0 && !loading && quiz && !showLoadingCard) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, quiz, handleSubmit, showLoadingCard]);

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
    </div>
  );

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const ModernButton = ({ onClick, text, icon: Icon, disabled, colorClass = "bg-slate-900", darkColorClass = "bg-black", className = "" }) => (
    <button 
      type="button" 
      onClick={onClick} 
      disabled={disabled}
      className={`flex items-center rounded-xl overflow-hidden shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed ${className}`}
    >
      <span className={`px-8 py-3 ${colorClass} text-white text-base font-bold`}>{text}</span>
      <span className={`px-4 py-3 ${darkColorClass} text-white flex items-center justify-center border-r border-white/10`}>
        <Icon className="w-5 h-5" />
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12 relative overflow-hidden" dir="rtl">
      {/* PES Style Loading Modal - Exact Match */}
      {showLoadingCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="w-full max-w-[380px] bg-white rounded-[2.5rem] p-8 pt-10 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            
            {/* Title (Match PES bold title) */}
            <h2 className="text-[22px] font-bold text-black mb-3">
              {loadingStep === 1 ? 'تم الانتهاء من الامتحان' : 'جاري تصحيح الاختبار'}
            </h2>
            
            {/* Subtext */}
            <p className="text-[15px] text-gray-800 font-medium mb-1">
              {loadingStep === 1 ? 'جاري إرسال إجاباتك للسيرفر' : 'يتم احتساب الدرجة الآن'}
            </p>
            <p className="text-[15px] text-gray-800 font-medium mb-6">
              {loadingStep === 1 ? 'يرجى الانتظار...' : 'لحظات من فضلك...'}
            </p>

            {/* Blue "Link" (Used as status) */}
            <div className="mb-4">
              <span className="text-[#3a8ecd] font-bold text-[17px] hover:underline cursor-default">
                {loadingStep === 1 ? 'تحميل البيانات...' : 'عرض النتيجة...'}
              </span>
            </div>

            {/* Subtle pulse animation for waiting feeling */}
            <div className="flex justify-center gap-1.5 mt-2">
              <div className="w-2 h-2 bg-[#dce9f5] rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-[#b8d4ed] rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-[#3a8ecd] rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Timer & Progress */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-base font-bold text-slate-800">{quiz.title}</h1>
              <p className="text-[10px] text-slate-400 font-medium">سؤال {currentQuestionIndex + 1} من {quiz.questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-colors ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-sky-50 text-sky-700'}`}>
              <Clock className="w-4 h-4" />
              <span className="text-lg tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-12">
        {/* Current Question Card */}
        <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="mb-8">
            <span className="inline-block bg-sky-50 text-sky-600 font-bold px-3 py-1 rounded-lg text-xs mb-4">
              سؤال {currentQuestionIndex + 1}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed">
              {currentQuestion.questionText}
            </h3>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, oIndex) => (
              <label 
                key={oIndex}
                className={`group relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  answers[currentQuestionIndex] === oIndex 
                    ? 'border-sky-500 bg-sky-50/20' 
                    : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <input 
                  type="radio" 
                  name={`q-${currentQuestionIndex}`} 
                  className="hidden" 
                  checked={answers[currentQuestionIndex] === oIndex} 
                  onChange={() => setAnswers({ ...answers, [currentQuestionIndex]: oIndex })} 
                />
                <div className={`w-5 h-5 rounded-full border-2 ml-4 flex items-center justify-center transition-all ${
                  answers[currentQuestionIndex] === oIndex ? 'border-sky-500 bg-sky-500' : 'border-slate-200 group-hover:border-sky-200'
                }`}>
                  {answers[currentQuestionIndex] === oIndex && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <span className={`text-sm font-bold ${answers[currentQuestionIndex] === oIndex ? 'text-sky-900' : 'text-slate-600'}`}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end mt-8">
          <ModernButton 
            onClick={handleNext}
            disabled={submitting || answers[currentQuestionIndex] === undefined}
            text={currentQuestionIndex === quiz.questions.length - 1 ? 'إنهاء وإرسال' : 'السؤال التالي'}
            icon={currentQuestionIndex === quiz.questions.length - 1 ? Send : ChevronLeft}
            colorClass={currentQuestionIndex === quiz.questions.length - 1 ? "bg-emerald-600" : "bg-slate-900"}
            darkColorClass={currentQuestionIndex === quiz.questions.length - 1 ? "bg-emerald-700" : "bg-black"}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
