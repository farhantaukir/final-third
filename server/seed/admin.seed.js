import '../env.bootstrap.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

async function seedAdmin() {
  const mongoUri = process.env.MONGO_URI;
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (!mongoUri?.trim() || mongoUri.includes('your_mongodb')) {
    console.error('Set MONGO_URI in server/.env before running the seed script.');
    process.exit(1);
  }

  if (!email?.trim() || !plainPassword?.trim()) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before running the seed script.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      console.log(`Admin seed skipped — user "${normalizedEmail}" already exists.`);
      await mongoose.disconnect();
      return;
    }

    await User.create({
      name: 'System Administrator',
      email: normalizedEmail,
      password: plainPassword,
      role: 'admin',
    });

    console.log('Admin account created successfully.');
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedAdmin();
