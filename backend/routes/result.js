import express from 'express';
import { submitResult, getMyResults, getQuizResults, getAllTeacherResults, getResultById } from '../controllers/resultController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', auth, authorize('student'), submitResult);
router.get('/myresults', auth, authorize('student'), getMyResults);
router.get('/teacher/all', auth, authorize('teacher'), getAllTeacherResults);
router.get('/quiz/:quizId', auth, authorize('teacher'), getQuizResults);
router.get('/:id', auth, getResultById);

export default router;
