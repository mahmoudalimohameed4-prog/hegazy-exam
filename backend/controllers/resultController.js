import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';

export const submitResult = async (req, res) => {
  try {
    const { quizId, answers, startedAt } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({ message: 'بيانات الاختبار ناقصة' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'الاختبار غير موجود' });

    let score = 0;
    const questions = quiz.questions;
    
    // Process answers and calculate score
    const processedAnswers = answers.map((ans) => {
      const question = questions.find(q => q._id.toString() === ans.questionId);
      const isCorrect = question && question.correctIndex === ans.selectedOption;
      if (isCorrect) score++;
      
      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption
      };
    });

    const totalQuestions = questions.length;
    const wrongAnswers = totalQuestions - score;

    const resultData = {
      quiz: quizId,
      answers: processedAnswers,
      score,
      total: totalQuestions,
      correctAnswers: score,
      wrongAnswers: wrongAnswers,
      percentage: totalQuestions > 0 ? (score / totalQuestions) * 100 : 0,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      finishedAt: new Date()
    };

    if (req.user && req.user.id !== 'guest') {
      resultData.student = req.user.id;
    }

    const result = new Result(resultData);
    await result.save();
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Submit Result Error:', error);
    res.status(500).json({ message: error.message || 'حدث خطأ أثناء حفظ النتيجة' });
  }
};

export const getMyResults = async (req, res) => {
  try {
    if (req.user.id === 'guest') {
      return res.json([]); // الضيوف لا يرون سجل نتائجهم
    }
    const results = await Result.find({ student: req.user.id })
      .populate('quiz', 'title')
      .sort({ finishedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('quiz')
      .populate('student', 'name identifier');
    if (!result) return res.status(404).json({ message: 'النتيجة غير موجودة' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTeacherResults = async (req, res) => {
  try {
    // عرض كافة النتائج في النظام للمعلم
    const results = await Result.find()
      .populate('student', 'name identifier')
      .populate('quiz', 'title')
      .sort({ finishedAt: -1 });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResult = async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف النتيجة بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllResults = async (req, res) => {
  try {
    // مسح كافة النتائج من قاعدة البيانات
    await Result.deleteMany({});
    res.json({ message: 'تم مسح كافة سجلات النتائج بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizResults = async (req, res) => {
    try {
      const results = await Result.find({ quiz: req.params.quizId })
        .populate('student', 'name identifier')
        .sort({ finishedAt: -1 });
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
