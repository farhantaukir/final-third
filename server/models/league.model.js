import mongoose from 'mongoose';

const leagueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
);

const League = mongoose.model('League', leagueSchema);

export default League;
