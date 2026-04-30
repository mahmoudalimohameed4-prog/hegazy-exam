import express from 'express';
import { createQuiz, getQuizzes, getMyQuizzes, getQuizById, updateQuiz, deleteQuiz } from '../controllers/quizController.js';
import { auth, authorize, guestStudent } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, authorize('teacher'), createQuiz);
// [TEMP] السماح للطلاب بالدخول بدون توكن
router.get('/', guestStudent, getQuizzes);
router.get('/my', auth, authorize('teacher'), getMyQuizzes);
router.get('/:id', guestStudent, getQuizById);
router.put('/:id', auth, authorize('teacher'), updateQuiz);
router.delete('/:id', auth, authorize('teacher'), deleteQuiz);

export default router;
