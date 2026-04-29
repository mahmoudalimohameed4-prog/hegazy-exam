import express from 'express';
import { sendOTP, verifyOTP, addUser, loginNational, getMe, getAllUsers, updatePassword } from '../controllers/authController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/add-user', auth, authorize('teacher'), addUser);
router.post('/login-national', loginNational);
router.get('/me', auth, getMe);
router.get('/users', auth, authorize('teacher'), getAllUsers);
router.put('/update-password', auth, updatePassword);

export default router;
