import '../env.bootstrap.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import League from '../models/league.model.js';
import Club from '../models/club.model.js';
import Match from '../models/match.model.js';
import PlayerStat from '../models/playerStat.model.js';
import Announcement from '../models/announcement.model.js';
import Feedback from '../models/feedback.model.js';

async function cleanSeededDataKeepAdmins() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri?.trim() || mongoUri.includes('your_mongodb')) {
    console.error('Set MONGO_URI in server/.env before running the clean script.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  try {
    const nonAdminUsers = await User.find({ role: { $ne: 'admin' } }).select('_id');
    const nonAdminIds = nonAdminUsers.map((u) => u._id);

    await Promise.all([
      PlayerStat.deleteMany({}),
      Announcement.deleteMany({}),
      Feedback.deleteMany({}),
      Match.deleteMany({}),
      Club.deleteMany({}),
      League.deleteMany({}),
      nonAdminIds.length ? User.deleteMany({ _id: { $in: nonAdminIds } }) : Promise.resolve(),
    ]);

    console.log('Seeded demo data cleaned successfully. Admin users were preserved.');
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

cleanSeededDataKeepAdmins().catch((error) => {
  console.error('Seed clean failed:', error.message);
  process.exit(1);
});
