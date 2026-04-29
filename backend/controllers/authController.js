import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'رقم الهاتف مطلوب' });

    let user = await User.findOne({ identifier: phone });
    if (!user) {
      return res.status(404).json({ message: 'هذا الرقم غير مسجل في النظام، يرجى مراجعة المعلم' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await user.save();

    console.log(`[OTP DEBUG] Phone: ${phone}, OTP: ${otp}`);

    res.json({ message: 'تم إرسال كود التحقق بنجاح (راجع كونسول الخادم)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({
      identifier: phone,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'كود التحقق غير صحيح أو منتهي الصلاحية' });

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, identifierType: user.identifierType, identifier: user.identifier },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Only for teachers to add others
export const addUser = async (req, res) => {
  try {
    const { identifier, identifierType, password, name, role, phone } = req.body;
    
    let existingUser = await User.findOne({ identifier });
    if (existingUser) return res.status(400).json({ message: 'المستخدم موجود بالفعل بهذا المعرف' });

    const userData = {
      identifier,
      identifierType,
      name,
      role: role || 'student',
    };

    if (identifierType === 'national_id' && password) {
      userData.password = await bcrypt.hash(password, 10);
    }
    
    if (phone) userData.phone = phone;

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({ message: 'تم إضافة المستخدم بنجاح', user: { id: newUser._id, name: newUser.name, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginNational = async (req, res) => {
  try {
    const { nationalId, password } = req.body;
    const user = await User.findOne({ identifier: nationalId });
    if (!user) return res.status(400).json({ message: 'الرقم القومي غير مسجل في النظام' });

    if (!user.password) return res.status(400).json({ message: 'هذا الحساب يتطلب تسجيل الدخول برقم الهاتف' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });

    const token = jwt.sign(
      { id: user._id, role: user.role, identifierType: user.identifierType, identifier: user.identifier },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    
    user.password = password; // Will be hashed by pre-save hook
    await user.save();
    
    res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
