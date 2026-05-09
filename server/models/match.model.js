import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    homeClub: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    awayClub: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ['Upcoming', 'Completed'], default: 'Upcoming' },
    score: {
      home: { type: Number, min: 0 },
      away: { type: Number, min: 0 },
    },
    homeLineup: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      validate: [lineupLimit, 'Home lineup cannot exceed 11 players'],
    },
    awayLineup: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      validate: [lineupLimit, 'Away lineup cannot exceed 11 players'],
    },
    homeSubstitutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    awaySubstitutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

function lineupLimit(val) {
  return !val || val.length <= 11;
}

const Match = mongoose.model('Match', matchSchema);

export default Match;
