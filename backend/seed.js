import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    const nationalId = '12345678901234';
    const password = 'password123';
    
    const existingUser = await User.findOne({ identifier: nationalId });
    if (existingUser) {
      console.log('ℹ️ Teacher already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new User({
      identifier: nationalId,
      identifierType: 'national_id',
      password: hashedPassword,
      name: 'المعلم الافتراضي',
      role: 'teacher',
    });

    await teacher.save();
    console.log('✅ Default teacher created successfully');
    console.log(`National ID: ${nationalId}`);
    console.log(`Password: ${password}`);

    process.exit();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seed();
