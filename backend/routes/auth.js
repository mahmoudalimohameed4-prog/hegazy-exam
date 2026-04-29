import express from 'express';
import { login, addUser, getMe, getAllUsers, updatePassword, updateUser, deleteUser } from '../controllers/authController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/add-user', auth, authorize('teacher'), addUser);
router.get('/me', auth, getMe);
router.get('/users', auth, authorize('teacher'), getAllUsers);
router.put('/users/:id', auth, authorize('teacher'), updateUser);
router.delete('/users/:id', auth, authorize('teacher'), deleteUser);
router.put('/update-password', auth, updatePassword);

export default router;
