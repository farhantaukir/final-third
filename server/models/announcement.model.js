import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
