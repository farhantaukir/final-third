import mongoose from 'mongoose';
import Announcement from '../models/announcement.model.js';
import Feedback from '../models/feedback.model.js';
import User from '../models/user.model.js';
import PlayerStat from '../models/playerStat.model.js';
import Match from '../models/match.model.js';

function clubIdOf(user) {
  if (!user?.club) return null;
  return user.club._id ? user.club._id : user.club;
}

export const createAnnouncement = async (req, res) => {
  try {
    const coachClub = clubIdOf(req.user);
    if (!coachClub || req.user.role !== 'coach') {
      return res.status(400).json({ success: false, message: 'Coach must belong to a club' });
    }

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const announcement = await Announcement.create({
      club: coachClub,
      coach: req.user._id,
      message,
    });

    const hydrated = await Announcement.findById(announcement._id).populate({
      path: 'coach',
      select: 'name',
    });

    res.status(201).json({ success: true, data: hydrated });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to post announcement' });
  }
};

export const listClubAnnouncements = async (req, res) => {
  try {
    const activeClubId = clubIdOf(req.user);
    if (!activeClubId || !['coach', 'player'].includes(req.user.role)) {
      return res.status(400).json({ success: false, message: 'No club context available' });
    }

    const announcements = await Announcement.find({ club: activeClubId })
      .sort({ createdAt: -1 })
      .populate({ path: 'coach', select: 'name email' });

    res.json({ success: true, data: announcements });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load announcements' });
  }
};

export const sendFeedback = async (req, res) => {
  try {
    const coachClub = clubIdOf(req.user);
    if (!coachClub || req.user.role !== 'coach') {
      return res.status(400).json({ success: false, message: 'Coach club required' });
    }

    const { playerId } = req.body;
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ success: false, message: 'Invalid player' });
    }
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const player = await User.findOne({
      _id: playerId,
      role: 'player',
      club: coachClub,
    });

    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found on your roster' });
    }

    const entry = await Feedback.create({
      coach: req.user._id,
      player: playerId,
      club: coachClub,
      message,
    });

    const hydrated = await Feedback.findById(entry._id).populate([
      { path: 'coach', select: 'name' },
      { path: 'player', select: 'name' },
    ]);

    res.status(201).json({ success: true, data: hydrated });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to deliver feedback' });
  }
};

export const listFeedbackForPlayer = async (req, res) => {
  try {
    if (req.user.role !== 'player') {
      return res.status(403).json({ success: false, message: 'Players only' });
    }

    const logs = await Feedback.find({ player: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'coach', select: 'name email' });

    res.json({ success: true, data: logs });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to fetch feedback' });
  }
};

export const coachPlayerProfile = async (req, res) => {
  try {
    const coachClub = clubIdOf(req.user);
    if (!coachClub || req.user.role !== 'coach') {
      return res.status(400).json({ success: false, message: 'Coach club required' });
    }

    const { playerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ success: false, message: 'Invalid player identifier' });
    }

    const playerDoc = await User.findOne({
      _id: playerId,
      role: 'player',
      club: coachClub,
    }).select('_id name email position profilePicture club');

    if (!playerDoc) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    const totalsAgg = await PlayerStat.aggregate([
      { $match: { player: new mongoose.Types.ObjectId(playerId) } },
      {
        $group: {
          _id: null,
          goals: { $sum: '$goals' },
          assists: { $sum: '$assists' },
          yellowCards: { $sum: '$yellowCards' },
          redCards: { $sum: '$redCards' },
        },
      },
    ]);

    const careerSummary = totalsAgg[0]
      ? {
        goals: totalsAgg[0].goals,
        assists: totalsAgg[0].assists,
        yellowCards: totalsAgg[0].yellowCards,
        redCards: totalsAgg[0].redCards,
      }
      : {
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
      };

    const completedMatches = await Match.find({
      status: 'Completed',
      $or: [
        {
          homeClub: coachClub,
          $or: [{ homeLineup: playerId }, { homeSubstitutes: playerId }],
        },
        {
          awayClub: coachClub,
          $or: [{ awayLineup: playerId }, { awaySubstitutes: playerId }],
        },
      ],
    })
      .sort({ date: -1 })
      .populate({ path: 'homeClub', select: 'name' })
      .populate({ path: 'awayClub', select: 'name' })
      .select('_id homeClub awayClub date score homeLineup awayLineup homeSubstitutes awaySubstitutes');

    const matchIds = completedMatches.map((match) => match._id);

    const statRows =
      matchIds.length > 0
        ? await PlayerStat.find({ player: playerId, match: { $in: matchIds } }).lean()
        : [];

    const participation = completedMatches.map((fixture) => {
      const snapshot = statRows.find((stat) => String(stat.match) === String(fixture._id));
      const isHome = String(fixture.homeClub?._id ?? fixture.homeClub) === String(coachClub);
      const startingLineup = isHome ? fixture.homeLineup : fixture.awayLineup;
      const substitutes = isHome ? fixture.homeSubstitutes : fixture.awaySubstitutes;

      const role = startingLineup?.some((id) => String(id) === String(playerId))
        ? 'Starter'
        : 'Substitute';

      const statPayload = snapshot
        ? {
          goals: snapshot.goals,
          assists: snapshot.assists,
          yellowCards: snapshot.yellowCards,
          redCards: snapshot.redCards,
        }
        : {
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
        };

      const opponentName = isHome
        ? fixture.awayClub?.name ?? 'Opponent'
        : fixture.homeClub?.name ?? 'Opponent';

      const score = fixture.score
        ? {
          own: isHome ? fixture.score.home : fixture.score.away,
          opponent: isHome ? fixture.score.away : fixture.score.home,
        }
        : null;

      return {
        matchId: fixture._id,
        opponent: opponentName,
        date: fixture.date,
        score,
        role,
        stats: statPayload,
      };
    });

    const feedbackFromCoach = await Feedback.find({
      coach: req.user._id,
      player: playerId,
    })
      .sort({ createdAt: -1 })
      .select('_id message createdAt');

    res.json({
      success: true,
      data: {
        player: playerDoc,
        careerSummary,
        participation,
        feedbackFromCoach,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load coach player profile' });
  }
};
