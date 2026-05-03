import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedTeacher = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const identifier = '01015112428';
    const password = 'hegazy2003';
    
    // Check if user already exists
    const existingUser = await User.findOne({ identifier });
    if (existingUser) {
      console.log('User already exists, updating password and role...');
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.role = 'teacher';
      existingUser.name = 'Hegazy Admin';
      existingUser.identifierType = 'phone';
      await existingUser.save();
      console.log('Teacher user updated successfully');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newTeacher = new User({
        identifier,
        identifierType: 'phone',
        password: hashedPassword,
        name: 'Hegazy Admin',
        role: 'teacher'
      });
      await newTeacher.save();
      console.log('Teacher user created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding teacher:', error);
    process.exit(1);
  }
};

seedTeacher();
