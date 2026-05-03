import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/results/${id}`);
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

  const downloadPDF = async () => {
    setDownloading(true);
    const element = document.getElementById('quiz-report');
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`نتيجة_اختبار_${result.quiz.title}.pdf`);
      Swal.fire('تم!', 'تم تحميل الاختبار بنجاح', 'success');
    } catch (error) {
      console.error('PDF Error:', error);
      Swal.fire('خطأ!', 'فشل في إنشاء ملف PDF', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fdfc] relative overflow-hidden flex flex-col items-center justify-center p-4 font-cairo" dir="rtl">

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 pb-10 shadow-xl shadow-blue-900/5 relative z-10 mx-auto mt-10">
        
        {/* Stats Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <span className="text-black font-bold text-[15px]">إجمالي عدد الاسئلة:</span>
            <span className="text-black font-bold text-xl">{result.total}</span>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <span className="text-black font-bold text-[15px]">عدد الاسئلة الصحيحة:</span>
            <span className="text-black font-bold text-xl">{result.correctAnswers}</span>
          </div>

          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <span className="text-black font-bold text-[15px]">عدد الاسئلة الخاطئة:</span>
            <span className="text-black font-bold text-xl">{result.wrongAnswers}</span>
          </div>

          <div className="flex justify-between items-center py-4">
            <span className="text-black font-bold text-[15px]">درجة الطالب:</span>
            <span className="text-black font-bold text-xl">{result.score}</span>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t-2 border-black mb-6 mx-2" />

        {/* PDF Download Link */}
        <div className="text-center mb-6">
          <button 
            onClick={downloadPDF}
            disabled={downloading}
            className="text-blue-600 font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            {downloading ? 'جاري التحميل...' : 'يمكنك تحميل الاختبار بالاجابات من هنا'}
          </button>
        </div>

        {/* Timer Section */}
        <div className="text-center mb-8">
          <p className="text-[13px] font-bold text-black mb-4">سيتم تسجيل خروجك بعد:</p>
          
          <div className="relative inline-flex items-center justify-center w-36 h-16">
            <div className="text-4xl font-normal text-black" style={{ fontFamily: 'monospace' }}>
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

      {/* Hidden Report for PDF Generation */}
      <div className="absolute left-[-9999px] top-0">
        <div id="quiz-report" className="w-[800px] bg-white p-10 font-cairo" dir="rtl">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-bold mb-2">{result.quiz.title}</h1>
            <div className="flex justify-around text-lg mt-2 font-bold">
              <span>الدرجة: {result.score} / {result.total}</span>
              <span>التاريخ: {new Date(result.finishedAt).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>

          <div className="space-y-0 border-r border-l border-t border-black">
            {result.quiz.questions.map((q, qIndex) => {
              const studentAnswer = result.answers.find(a => a.questionId === q._id)?.selectedOption;
              const isCorrect = studentAnswer === q.correctIndex;

              return (
                <div key={qIndex} className="break-inside-avoid">
                  {/* Question Row - Reduced Padding */}
                  <div className="bg-slate-100 p-2 border-b border-black font-bold text-xl">
                    {qIndex + 1}. {q.questionText}
                  </div>
                  {/* Options Row (4 Columns Grid) - Reduced Padding */}
                  <div className="grid grid-cols-4 border-b border-black">
                    {q.options.map((opt, oIndex) => {
                      let bgColor = 'bg-white';
                      let textColor = 'text-black';
                      
                      if (oIndex === q.correctIndex) {
                        bgColor = 'bg-green-100'; // Correct answer
                        textColor = 'text-green-800';
                      } else if (studentAnswer === oIndex && !isCorrect) {
                        bgColor = 'bg-red-100'; // Student's wrong answer
                        textColor = 'text-red-800';
                      }

                      return (
                        <div key={oIndex} className={`p-1.5 border-l last:border-l-0 border-black text-center text-sm font-bold flex items-center justify-center min-h-[40px] ${bgColor} ${textColor}`}>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
