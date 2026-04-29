import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true,
  },
  identifierType: {
    type: String,
    enum: ['phone', 'national_id'],
    required: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    default: 'student',
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);
export default User;
