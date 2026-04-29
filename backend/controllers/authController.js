import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ identifier });
    if (!user) return res.status(400).json({ message: 'المعرف غير مسجل في النظام' });

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

export const addUser = async (req, res) => {
  try {
    const { identifier, identifierType, password, name, role } = req.body;
    
    let existingUser = await User.findOne({ identifier });
    if (existingUser) return res.status(400).json({ message: 'المستخدم موجود بالفعل بهذا المعرف' });

    // Default password is the identifier if not provided
    const userPassword = password || identifier;
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newUser = new User({
      identifier,
      identifierType,
      name,
      password: hashedPassword,
      role: role || 'student',
    });
    
    await newUser.save();

    res.status(201).json({ message: 'تم إضافة المستخدم بنجاح', user: { id: newUser._id, name: newUser.name, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
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
    
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    
    res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, identifier, role, identifierType, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    if (name) user.name = name;
    if (identifier) user.identifier = identifier;
    if (role) user.role = role;
    if (identifierType) user.identifierType = identifierType;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    } else if (!user.password) {
      // If updating an old user who has no password, give them a default
      user.password = await bcrypt.hash(user.identifier, 10);
    }

    await user.save();
    res.json({ message: 'تم تحديث بيانات المستخدم بنجاح', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
