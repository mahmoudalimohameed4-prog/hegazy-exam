import jwt from 'jsonwebtoken';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'لا يوجد توكن، الوصول مرفوض' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'التوكن غير صالح' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'غير مصرح لك بالقيام بهذا الإجراء' });
    }
    next();
  };
};

// ============================================================
// [TEMP] guestStudent - تجاوز مؤقت لنظام تسجيل الدخول للطلاب
// يسمح بالوصول بدون توكن ويعامل المستخدم كطالب guest
// عند الرغبة في إعادة تفعيل نظام الدخول، احذف هذا الـ middleware
// واستبدل استخدامه في routes/quiz.js و routes/result.js بـ auth
// ============================================================
export const guestStudent = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch {
      req.user = { id: 'guest', role: 'student', name: 'زائر' };
    }
  } else {
    req.user = { id: 'guest', role: 'student', name: 'زائر' };
  }
  next();
};
