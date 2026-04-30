import express from 'express';
import { submitResult, getMyResults, getQuizResults, getAllTeacherResults, getResultById } from '../controllers/resultController.js';
import { auth, authorize, guestStudent } from '../middleware/auth.js';

const router = express.Router();

// [TEMP] السماح للطلاب بتسليم النتائج بدون توكن
router.post('/submit', guestStudent, submitResult);
router.get('/myresults', guestStudent, getMyResults);
router.get('/teacher/all', auth, authorize('teacher'), getAllTeacherResults);
router.get('/quiz/:quizId', auth, authorize('teacher'), getQuizResults);
router.get('/:id', guestStudent, getResultById);

export default router;
