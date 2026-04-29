import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/quizzes/${id}`);
        setQuiz(res.data);
        setTimeLeft(res.data.timeLimit * 60);
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'خطأ!', text: 'فشل في تحميل الاختبار', confirmButtonText: 'حسناً' });
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

      const res = await axios.post('http://localhost:5000/api/v1/results/submit', {
        quizId: id,
        answers: answerArray,
        startedAt,
      });

      Swal.fire({ icon: 'success', title: 'تم الإرسال!', showConfirmButton: false, timer: 1000 });
      navigate(`/result/${res.data._id}`);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'خطأ!', text: 'فشل في إرسال الإجابات', confirmButtonText: 'حسناً' });
    } finally {
      setSubmitting(false);
    }
  }, [id, quiz, answers, startedAt, navigate, submitting]);

  useEffect(() => {
    if (timeLeft <= 0 && !loading && quiz) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, quiz, handleSubmit]);

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

  return (
    <div className="min-h-screen bg-slate-50 pb-12" dir="rtl">
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
          <button
            onClick={handleNext}
            disabled={submitting || answers[currentQuestionIndex] === undefined}
            className={`group py-3.5 px-10 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 text-base ${
              answers[currentQuestionIndex] === undefined 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-slate-900 hover:bg-sky-600 text-white'
            }`}
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <>
                <Send className="w-4 h-4" />
                <span>إنهاء وإرسال</span>
              </>
            ) : (
              <>
                <span>السؤال التالي</span>
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
