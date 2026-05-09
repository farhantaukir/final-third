import mongoose from 'mongoose';
import Club from '../models/club.model.js';
import League from '../models/league.model.js';
import Match from '../models/match.model.js';
import PlayerStat from '../models/playerStat.model.js';
import Announcement from '../models/announcement.model.js';
import Feedback from '../models/feedback.model.js';
import User, { POSITIONS } from '../models/user.model.js';

export const listClubs = async (_req, res) => {
  try {
    const clubs = await Club.find()
      .sort({ name: 1 })
      .populate({ path: 'coach', select: 'name email' })
      .populate({ path: 'league', select: 'name' });

    res.json({ success: true, data: clubs });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load clubs' });
  }
};

export const createClub = async (req, res) => {
  try {
    const { name, homeCity, homeVenue, foundingYear, leagueId } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof homeCity !== 'string' ||
      !homeCity.trim() ||
      typeof homeVenue !== 'string' ||
      !homeVenue.trim() ||
      foundingYear === undefined ||
      foundingYear === null ||
      Number.isNaN(Number(foundingYear))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Club name, home city, home venue, and founding year are required',
      });
    }

    if (!leagueId || !mongoose.Types.ObjectId.isValid(leagueId)) {
      return res.status(400).json({ success: false, message: 'Invalid league identifier' });
    }

    const leagueExists = await League.exists({ _id: leagueId });
    if (!leagueExists) {
      return res.status(400).json({ success: false, message: 'League not found' });
    }

    const club = await Club.create({
      name: name.trim(),
      homeCity: homeCity.trim(),
      homeVenue: homeVenue.trim(),
      foundingYear: Number(foundingYear),
      coach: null,
      league: leagueId,
    });

    await club.populate([
      { path: 'coach', select: 'name email' },
      { path: 'league', select: 'name' },
    ]);

    res.status(201).json({ success: true, data: club });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Club name already exists' });
    }
    res.status(500).json({ success: false, message: 'Unable to create club' });
  }
};

export const listCoachOptions = async (_req, res) => {
  try {
    const coaches = await User.find({ role: 'coach' })
      .sort({ name: 1 })
      .select('_id name email club')
      .populate({ path: 'club', select: 'name' });

    res.json({ success: true, data: coaches });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load coaches' });
  }
};

export const listLeagues = async (_req, res) => {
  try {
    const leagues = await League.find().sort({ name: 1 });
    res.json({ success: true, data: leagues });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load leagues' });
  }
};

export const createLeague = async (req, res) => {
  try {
    const { name } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'League name is required' });
    }

    const league = await League.create({ name: name.trim() });
    res.status(201).json({ success: true, data: league });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: 'League name already exists' });
    }
    res.status(500).json({ success: false, message: 'Unable to create league' });
  }
};

export const deleteLeague = async (req, res) => {
  try {
    const { leagueId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(leagueId)) {
      return res.status(400).json({ success: false, message: 'Invalid league identifier' });
    }

    const league = await League.findByIdAndDelete(leagueId);
    if (!league) {
      return res.status(404).json({ success: false, message: 'League not found' });
    }

    await Club.updateMany({ league: leagueId }, { $set: { league: null } });
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to delete league' });
  }
};

async function rosterForClub(clubId) {
  return User.find({ club: clubId, role: 'player' })
    .sort({ name: 1 })
    .select('_id name email position profilePicture');
}

export const getClubById = async (req, res) => {
  try {
    const { clubId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return res.status(400).json({ success: false, message: 'Invalid club identifier' });
    }

    const club = await Club.findById(clubId).populate([
      { path: 'coach', select: 'name email' },
      { path: 'league', select: 'name' },
    ]);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const roster = await rosterForClub(club._id);

    const unassignedPlayers = await User.find({ role: 'player', club: null })
      .sort({ name: 1 })
      .select('_id name email');

    const leagues = await League.find().sort({ name: 1 }).select('_id name');

    res.json({
      success: true,
      data: {
        club,
        roster,
        unassignedPlayers,
        leagues,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load club' });
  }
};

export const assignCoach = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { coachId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId) || !mongoose.Types.ObjectId.isValid(coachId)) {
      return res.status(400).json({ success: false, message: 'Invalid identifiers' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const newCoach = await User.findById(coachId);
    if (!newCoach || newCoach.role !== 'coach') {
      return res.status(400).json({ success: false, message: 'Coach not found or invalid role' });
    }

    const prevCoachOnThisClubId = club.coach;

    const newCoachPreviousClubId = newCoach.club
      ? String(newCoach.club._id ?? newCoach.club)
      : null;

    if (newCoachPreviousClubId && newCoachPreviousClubId !== String(clubId)) {
      await Club.findByIdAndUpdate(newCoachPreviousClubId, { $set: { coach: null } });
    }

    if (prevCoachOnThisClubId && String(prevCoachOnThisClubId) !== String(coachId)) {
      await User.findByIdAndUpdate(prevCoachOnThisClubId, { $set: { club: null } });
    }

    club.coach = coachId;
    newCoach.club = clubId;

    await Promise.all([club.save(), newCoach.save()]);

    const populatedClub = await Club.findById(clubId).populate({
      path: 'coach',
      select: 'name email',
    });

    res.json({ success: true, data: { club: populatedClub } });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to assign coach' });
  }
};

export const assignLeague = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { leagueId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return res.status(400).json({ success: false, message: 'Invalid club identifier' });
    }

    if (leagueId && !mongoose.Types.ObjectId.isValid(leagueId)) {
      return res.status(400).json({ success: false, message: 'Invalid league identifier' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (leagueId) {
      const leagueExists = await League.exists({ _id: leagueId });
      if (!leagueExists) {
        return res.status(404).json({ success: false, message: 'League not found' });
      }
      club.league = leagueId;
    } else {
      club.league = null;
    }

    await club.save();

    const populated = await Club.findById(clubId).populate([
      { path: 'coach', select: 'name email' },
      { path: 'league', select: 'name' },
    ]);

    res.json({ success: true, data: { club: populated } });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to assign league' });
  }
};

export const addPlayerToClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { playerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId) || !mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ success: false, message: 'Invalid identifiers' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const player = await User.findOne({ _id: playerId, role: 'player', club: null });
    if (!player) {
      return res.status(400).json({
        success: false,
        message: 'Player unavailable or already assigned',
      });
    }

    player.club = clubId;
    await player.save();

    const roster = await rosterForClub(clubId);

    res.json({ success: true, data: { roster } });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to add player' });
  }
};

export const removePlayerFromClub = async (req, res) => {
  try {
    const { clubId, playerId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(clubId) ||
      !mongoose.Types.ObjectId.isValid(playerId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid identifiers' });
    }

    const player = await User.findOne({
      _id: playerId,
      role: 'player',
      club: clubId,
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player is not assigned to this club',
      });
    }

    player.club = null;
    player.position = '';
    await player.save();

    const roster = await rosterForClub(clubId);

    res.json({ success: true, data: { roster } });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to remove player' });
  }
};

export const updatePlayerPosition = async (req, res) => {
  try {
    const { clubId, playerId } = req.params;
    const { position } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(clubId) ||
      !mongoose.Types.ObjectId.isValid(playerId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid identifiers' });
    }

    const trimmedPosition = typeof position === 'string' ? position.trim() : '';
    if (!POSITIONS.includes(trimmedPosition)) {
      return res.status(400).json({ success: false, message: 'Invalid position selection' });
    }

    const player = await User.findOne({
      _id: playerId,
      role: 'player',
      club: clubId,
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player is not assigned to this club',
      });
    }

    player.position = trimmedPosition;
    await player.save();

    const roster = await rosterForClub(clubId);

    res.json({ success: true, data: { roster } });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to update player position' });
  }
};

export const updateClubHomeVenue = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { homeVenue } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return res.status(400).json({ success: false, message: 'Invalid club identifier' });
    }

    if (typeof homeVenue !== 'string' || !homeVenue.trim()) {
      return res.status(400).json({ success: false, message: 'Home venue is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    club.homeVenue = homeVenue.trim();
    await club.save();

    const populated = await Club.findById(clubId).populate([
      { path: 'coach', select: 'name email' },
      { path: 'league', select: 'name' },
    ]);

    res.json({ success: true, data: { club: populated } });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to update home venue' });
  }
};

export const deleteClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return res.status(400).json({ success: false, message: 'Invalid club identifier' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const matches = await Match.find({
      $or: [{ homeClub: clubId }, { awayClub: clubId }],
    }).select('_id');
    const matchIds = matches.map((match) => match._id);

    await Promise.all([
      User.updateMany({ club: clubId }, { $set: { club: null, position: '' } }),
      Announcement.deleteMany({ club: clubId }),
      Feedback.deleteMany({ club: clubId }),
      matchIds.length ? PlayerStat.deleteMany({ match: { $in: matchIds } }) : Promise.resolve(),
      Match.deleteMany({ $or: [{ homeClub: clubId }, { awayClub: clubId }] }),
      Club.findByIdAndDelete(clubId),
    ]);

    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to delete club' });
  }
};
