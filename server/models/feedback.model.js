import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
