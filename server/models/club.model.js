import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    homeCity: { type: String, required: true },
    homeVenue: { type: String, required: true, trim: true },
    foundingYear: { type: Number, required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    league: { type: mongoose.Schema.Types.ObjectId, ref: 'League', default: null },
  },
  { timestamps: true },
);

const Club = mongoose.model('Club', clubSchema);

export default Club;
