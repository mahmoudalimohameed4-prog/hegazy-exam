import express from 'express';
import { createQuiz, getQuizzes, getMyQuizzes, getQuizById, updateQuiz, deleteQuiz } from '../controllers/quizController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, authorize('teacher'), createQuiz);
router.get('/', auth, getQuizzes);
router.get('/my', auth, authorize('teacher'), getMyQuizzes);
router.get('/:id', auth, getQuizById);
router.put('/:id', auth, authorize('teacher'), updateQuiz);
router.delete('/:id', auth, authorize('teacher'), deleteQuiz);

export default router;
