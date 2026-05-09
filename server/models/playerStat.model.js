import mongoose from 'mongoose';

const playerStatSchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    goals: { type: Number, default: 0, min: 0 },
    assists: { type: Number, default: 0, min: 0 },
    yellowCards: { type: Number, default: 0, min: 0 },
    redCards: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

playerStatSchema.index({ match: 1, player: 1 }, { unique: true });

const PlayerStat = mongoose.model('PlayerStat', playerStatSchema);

export default PlayerStat;
