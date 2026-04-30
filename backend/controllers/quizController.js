import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';

export const createQuiz = async (req, res) => {
  try {
    const { title, description, timeLimit, questions, allowMultipleAttempts, scheduledStartTime } = req.body;
    const quiz = new Quiz({
      title,
      description,
      timeLimit,
      questions,
      allowMultipleAttempts: allowMultipleAttempts !== undefined ? allowMultipleAttempts : true,
      scheduledStartTime: scheduledStartTime || null,
      createdBy: req.user.id,
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true }).select('-questions.correctIndex');
    
    if (req.user.role === 'student') {
      let takenQuizIds = [];
      
      // الضيف لا يملك معرف صحيح لـ ObjectId، لذا لا نبحث عن نتائجه
      if (req.user.id !== 'guest') {
        const studentResults = await Result.find({ student: req.user.id }).select('quiz');
        takenQuizIds = studentResults.map(r => r.quiz.toString());
      }
      
      const availableQuizzes = quizzes.filter(quiz => {
        const isTaken = takenQuizIds.includes(quiz._id.toString());
        if (isTaken) {
          return quiz.allowMultipleAttempts === true;
        }
        return true;
      });
      
      return res.json(availableQuizzes);
    }
    
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'الاختبار غير موجود' });
    
    if (req.user.role === 'student' && quiz.allowMultipleAttempts === false) {
        if (req.user.id !== 'guest') {
            const existingResult = await Result.findOne({ student: req.user.id, quiz: req.params.id });
            if (existingResult) {
                return res.status(403).json({ 
                  message: 'لقد أديت هذا الاختبار بالفعل، ولا يسمح بإعادته مرة أخرى',
                  isAlreadyTaken: true 
                });
            }
        }
    }

    if (req.user.role === 'student') {
      const studentQuiz = quiz.toObject();
      studentQuiz.questions = studentQuiz.questions.map(q => {
        const { correctIndex, ...rest } = q;
        return rest;
      });
      return res.json(studentQuiz);
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: 'الاختبار غير موجود أو غير مصرح لك بتعديله' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!quiz) return res.status(404).json({ message: 'الاختبار غير موجود أو غير مصرح لك بحذفه' });
    res.json({ message: 'تم حذف الاختبار بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
