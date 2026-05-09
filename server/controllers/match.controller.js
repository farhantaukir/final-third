import mongoose from 'mongoose';
import Match from '../models/match.model.js';
import Club from '../models/club.model.js';
import User from '../models/user.model.js';
import PlayerStat from '../models/playerStat.model.js';

function clubIdOf(user) {
  if (!user?.club) return null;
  return user.club._id ? user.club._id : user.club;
}

function uniqueObjectIds(ids = []) {
  const seen = new Set();
  const result = [];
  for (const id of ids) {
    const str = String(id);
    if (!seen.has(str)) {
      seen.add(str);
      result.push(id);
    }
  }
  return result;
}

function resolveMatchSide(match, clubId) {
  const clubStr = String(clubId);
  const homeId = String(match.homeClub?._id ?? match.homeClub);
  const awayId = String(match.awayClub?._id ?? match.awayClub);

  if (homeId === clubStr) {
    return { side: 'home', club: match.homeClub, opponent: match.awayClub };
  }

  if (awayId === clubStr) {
    return { side: 'away', club: match.awayClub, opponent: match.homeClub };
  }

  return null;
}

function mapScoreForSide(score, side) {
  if (!score || score.home === undefined || score.away === undefined) return null;

  return side === 'home'
    ? { own: score.home, opponent: score.away }
    : { own: score.away, opponent: score.home };
}

function mapLineupForSide(match, side) {
  return side === 'home'
    ? {
      startingLineup: match.homeLineup ?? [],
      substitutes: match.homeSubstitutes ?? [],
    }
    : {
      startingLineup: match.awayLineup ?? [],
      substitutes: match.awaySubstitutes ?? [],
    };
}

function normalizeMatchForClub(match, clubId) {
  const sideInfo = resolveMatchSide(match, clubId);
  if (!sideInfo) return null;

  const { side, club, opponent } = sideInfo;
  const { startingLineup, substitutes } = mapLineupForSide(match, side);

  return {
    _id: match._id,
    date: match.date,
    venue: match.venue,
    status: match.status,
    designation: side === 'home' ? 'Home' : 'Away',
    club,
    opponent: opponent?.name ?? 'Opponent',
    score: mapScoreForSide(match.score, side),
    startingLineup,
    substitutes,
  };
}

export const listAllMatches = async (_req, res) => {
  try {
    const matches = await Match.find()
      .sort({ date: -1 })
      .populate({ path: 'homeClub', select: 'name homeCity' })
      .populate({ path: 'awayClub', select: 'name homeCity' });

    const matchIds = matches.map((match) => match._id);
    const statsCounts = matchIds.length
      ? await PlayerStat.aggregate([
        { $match: { match: { $in: matchIds } } },
        { $group: { _id: '$match', count: { $sum: 1 } } },
      ])
      : [];
    const statsByMatch = new Map(
      statsCounts.map((row) => [String(row._id), Number(row.count) > 0]),
    );

    const withStatsFlag = matches.map((match) => {
      const asObj = match.toObject();
      asObj.statsLogged = statsByMatch.get(String(match._id)) || false;
      return asObj;
    });

    res.json({ success: true, data: withStatsFlag });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load matches' });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ success: false, message: 'Invalid match identifier' });
    }

    const removed = await Match.findByIdAndDelete(matchId);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    await PlayerStat.deleteMany({ match: matchId });
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to delete match' });
  }
};

export const createMatch = async (req, res) => {
  try {
    const { homeClubId, awayClubId, date, venue } = req.body;

    if (!mongoose.Types.ObjectId.isValid(homeClubId)) {
      return res.status(400).json({ success: false, message: 'Invalid home club identifier' });
    }

    if (!mongoose.Types.ObjectId.isValid(awayClubId)) {
      return res.status(400).json({ success: false, message: 'Invalid away club identifier' });
    }

    if (String(homeClubId) === String(awayClubId)) {
      return res.status(400).json({ success: false, message: 'Home and away clubs must differ' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Match date is required' });
    }

    const [homeClub, awayClub] = await Promise.all([
      Club.findById(homeClubId).select('_id homeVenue'),
      Club.findById(awayClubId).select('_id'),
    ]);

    if (!homeClub || !awayClub) {
      return res.status(400).json({ success: false, message: 'Club not found' });
    }

    const resolvedVenue =
      typeof venue === 'string' && venue.trim() ? venue.trim() : homeClub.homeVenue;
    if (!resolvedVenue) {
      return res.status(400).json({ success: false, message: 'Venue is required' });
    }

    const match = await Match.create({
      homeClub: homeClubId,
      awayClub: awayClubId,
      date: new Date(date),
      venue: resolvedVenue,
      status: 'Upcoming',
      homeLineup: [],
      awayLineup: [],
      homeSubstitutes: [],
      awaySubstitutes: [],
    });

    const populated = await Match.findById(match._id)
      .populate({ path: 'homeClub', select: 'name homeCity' })
      .populate({ path: 'awayClub', select: 'name homeCity' });

    res.status(201).json({ success: true, data: populated });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to schedule match' });
  }
};

export const recordMatchResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    const rawHomeScore = req.body.homeScore ?? req.body.ownScore;
    const rawAwayScore = req.body.awayScore ?? req.body.opponentScore;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ success: false, message: 'Invalid match identifier' });
    }

    if (
      rawHomeScore === undefined ||
      rawAwayScore === undefined ||
      Number.isNaN(Number(rawHomeScore)) ||
      Number.isNaN(Number(rawAwayScore)) ||
      Number(rawHomeScore) < 0 ||
      Number(rawAwayScore) < 0
    ) {
      return res.status(400).json({ success: false, message: 'Valid scores are required' });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (match.status !== 'Upcoming') {
      return res
        .status(400)
        .json({ success: false, message: 'Result already recorded for this match' });
    }

    match.score = {
      home: Number(rawHomeScore),
      away: Number(rawAwayScore),
    };
    match.status = 'Completed';
    await match.save();

    const populated = await Match.findById(match._id)
      .populate({ path: 'homeClub', select: 'name homeCity' })
      .populate({ path: 'awayClub', select: 'name homeCity' });

    res.json({ success: true, data: populated });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to record match result' });
  }
};

export const updateMatchLineup = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { startingLineup = [], substitutes = [] } = req.body;

    const coachClub = clubIdOf(req.user);

    if (!coachClub) {
      return res
        .status(400)
        .json({ success: false, message: 'Coach is not assigned to a club yet' });
    }

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ success: false, message: 'Invalid match identifier' });
    }

    const match = await Match.findById(matchId);
    const sideInfo = match ? resolveMatchSide(match, coachClub) : null;
    if (!match || !sideInfo) {
      return res.status(404).json({ success: false, message: 'Match not found for your club' });
    }

    if (match.status !== 'Upcoming') {
      return res
        .status(400)
        .json({ success: false, message: 'Lineups are locked after completion' });
    }

    const starters = uniqueObjectIds(startingLineup);
    const subs = uniqueObjectIds(substitutes);

    if (starters.some((id) => subs.map(String).includes(String(id)))) {
      return res.status(400).json({
        success: false,
        message: 'A player cannot appear in both lineups',
      });
    }

    if (starters.length > 11) {
      return res
        .status(400)
        .json({ success: false, message: 'Starting lineup limited to eleven players' });
    }

    const combined = [...starters, ...subs];
    if (!combined.length) {
      return res.status(400).json({ success: false, message: 'Select at least one player' });
    }

    const rosterCount = await User.countDocuments({
      _id: { $in: combined },
      role: 'player',
      club: coachClub,
    });

    if (rosterCount !== combined.length) {
      return res.status(400).json({
        success: false,
        message: 'Players must belong to your club roster',
      });
    }

    if (sideInfo.side === 'home') {
      match.homeLineup = starters;
      match.homeSubstitutes = subs;
    } else {
      match.awayLineup = starters;
      match.awaySubstitutes = subs;
    }
    await match.save();

    const populated = await Match.findById(match._id)
      .populate({ path: 'homeClub', select: 'name homeCity' })
      .populate({ path: 'awayClub', select: 'name homeCity' })
      .populate({ path: 'homeLineup', select: 'name position profilePicture' })
      .populate({ path: 'awayLineup', select: 'name position profilePicture' })
      .populate({ path: 'homeSubstitutes', select: 'name position profilePicture' })
      .populate({ path: 'awaySubstitutes', select: 'name position profilePicture' });

    const normalized = normalizeMatchForClub(populated, coachClub) || populated;

    res.json({ success: true, data: normalized });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to update lineup' });
  }
};

export const lineupPlayersForCoach = async (req, res) => {
  try {
    const coachClub = clubIdOf(req.user);
    if (!coachClub || req.user.role !== 'coach') {
      return res.status(400).json({ success: false, message: 'Coach club not found' });
    }

    const players = await User.find({ club: coachClub, role: 'player' })
      .sort({ name: 1 })
      .select('_id name email position profilePicture');

    res.json({ success: true, data: players });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load squad roster' });
  }
};

export const listClubUpcomingMatches = async (req, res) => {
  try {
    const activeClubId = clubIdOf(req.user);
    if (!activeClubId) {
      return res.status(400).json({ success: false, message: 'No club assigned to this account' });
    }

    const matches = await Match.find({
      status: 'Upcoming',
      $or: [{ homeClub: activeClubId }, { awayClub: activeClubId }],
    })
      .sort({ date: 1 })
      .populate({ path: 'homeClub', select: 'name homeCity' })
      .populate({ path: 'awayClub', select: 'name homeCity' })
      .populate({ path: 'homeLineup', select: 'name position' })
      .populate({ path: 'awayLineup', select: 'name position' })
      .populate({ path: 'homeSubstitutes', select: 'name position' })
      .populate({ path: 'awaySubstitutes', select: 'name position' });

    const normalized = matches
      .map((match) => normalizeMatchForClub(match, activeClubId))
      .filter(Boolean);

    res.json({ success: true, data: normalized });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load upcoming matches' });
  }
};

export const listClubMatchHistory = async (req, res) => {
  try {
    const activeClubId = clubIdOf(req.user);
    if (!activeClubId) {
      return res.status(400).json({ success: false, message: 'No club assigned to this account' });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {
      status: 'Completed',
      $or: [{ homeClub: activeClubId }, { awayClub: activeClubId }],
    };

    const total = await Match.countDocuments(filter);

    const matches = await Match.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'homeClub', select: 'name homeCity' })
      .populate({ path: 'awayClub', select: 'name homeCity' })
      .populate({ path: 'homeLineup', select: 'name position' })
      .populate({ path: 'awayLineup', select: 'name position' })
      .populate({ path: 'homeSubstitutes', select: 'name position' })
      .populate({ path: 'awaySubstitutes', select: 'name position' });

    const normalized = matches
      .map((match) => normalizeMatchForClub(match, activeClubId))
      .filter(Boolean);

    res.json({
      success: true,
      data: {
        matches: normalized,
        total,
        page,
        limit,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load match history' });
  }
};

export const getMatchLineupContext = async (req, res) => {
  try {
    const { matchId } = req.params;
    const coachClub = clubIdOf(req.user);

    if (!coachClub || req.user.role !== 'coach') {
      return res.status(400).json({ success: false, message: 'Coach club not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ success: false, message: 'Invalid match identifier' });
    }

    const match = await Match.findOne({
      _id: matchId,
      status: 'Upcoming',
      $or: [{ homeClub: coachClub }, { awayClub: coachClub }],
    })
      .populate({ path: 'homeClub', select: 'name homeCity' })
      .populate({ path: 'awayClub', select: 'name homeCity' })
      .populate({ path: 'homeLineup', select: 'name position profilePicture' })
      .populate({ path: 'awayLineup', select: 'name position profilePicture' })
      .populate({ path: 'homeSubstitutes', select: 'name position profilePicture' })
      .populate({ path: 'awaySubstitutes', select: 'name position profilePicture' });

    const normalized = match ? normalizeMatchForClub(match, coachClub) : null;

    if (!match || !normalized) {
      return res.status(404).json({ success: false, message: 'Upcoming match not found' });
    }

    const squad = await User.find({ club: coachClub, role: 'player' })
      .sort({ name: 1 })
      .select('_id name email position profilePicture');

    res.json({ success: true, data: { match: normalized, squad } });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load lineup editor' });
  }
};

export const listPlayersForMatchStats = async (req, res) => {
  try {
    const { matchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ success: false, message: 'Invalid match identifier' });
    }

    const match = await Match.findById(matchId)
      .populate({ path: 'homeClub', select: 'name homeCity' })
      .populate({ path: 'awayClub', select: 'name homeCity' })
      .populate({ path: 'homeLineup', select: 'name profilePicture position' })
      .populate({ path: 'awayLineup', select: 'name profilePicture position' })
      .populate({ path: 'homeSubstitutes', select: 'name profilePicture position' })
      .populate({ path: 'awaySubstitutes', select: 'name profilePicture position' });

    if (!match || match.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Statistics can only be logged for completed matches',
      });
    }

    let playerIds = uniqueObjectIds([
      ...(match.homeLineup?.map((p) => p._id) ?? []),
      ...(match.homeSubstitutes?.map((p) => p._id) ?? []),
      ...(match.awayLineup?.map((p) => p._id) ?? []),
      ...(match.awaySubstitutes?.map((p) => p._id) ?? []),
    ]);

    const existingStatsCount = await PlayerStat.countDocuments({ match: matchId });
    if (existingStatsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Statistics have already been logged for this match',
      });
    }

    let playersBlueprint = [];
    if (playerIds.length) {
      const seen = new Set();
      const roster = [
        ...(match.homeLineup ?? []),
        ...(match.homeSubstitutes ?? []),
        ...(match.awayLineup ?? []),
        ...(match.awaySubstitutes ?? []),
      ];

      for (const player of roster) {
        const id = String(player._id ?? player);
        if (!seen.has(id)) {
          seen.add(id);
          playersBlueprint.push(player);
        }
      }
    }

    if (!playerIds.length) {
      const fallbackRoster = await User.find({
        role: 'player',
        club: { $in: [match.homeClub?._id ?? match.homeClub, match.awayClub?._id ?? match.awayClub] },
      })
        .sort({ name: 1 })
        .select('_id name profilePicture position club')
        .populate({ path: 'club', select: 'name' });

      playerIds = uniqueObjectIds(fallbackRoster.map((player) => player._id));
      playersBlueprint = fallbackRoster;
    }

    if (!playerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'No eligible roster players found for this match',
      });
    }

    res.json({
      success: true,
      data: {
        match: {
          _id: match._id,
          homeClub: match.homeClub,
          awayClub: match.awayClub,
          date: match.date,
        },
        players: playersBlueprint,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load match players' });
  }
};

export const submitMatchPlayerStats = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { stats = [] } = req.body;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ success: false, message: 'Invalid match identifier' });
    }

    if (!Array.isArray(stats) || !stats.length) {
      return res.status(400).json({ success: false, message: 'Stats payload is required' });
    }

    const match = await Match.findById(matchId);
    if (!match || match.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Stats can only be submitted for completed matches',
      });
    }

    const existingStatsCount = await PlayerStat.countDocuments({ match: matchId });
    if (existingStatsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Stats are locked for this match',
      });
    }

    const lineupClubMap = new Map();
    const registerPlayers = (players = [], clubId) => {
      for (const player of players) {
        const id = String(player);
        if (!lineupClubMap.has(id)) {
          lineupClubMap.set(id, clubId);
        }
      }
    };

    registerPlayers(match.homeLineup ?? [], match.homeClub);
    registerPlayers(match.homeSubstitutes ?? [], match.homeClub);
    registerPlayers(match.awayLineup ?? [], match.awayClub);
    registerPlayers(match.awaySubstitutes ?? [], match.awayClub);

    let allowedIds = uniqueObjectIds([...lineupClubMap.keys()]);

    if (!allowedIds.length) {
      const fallbackPlayers = await User.find({
        role: 'player',
        club: { $in: [match.homeClub, match.awayClub] },
      }).select('_id club');

      for (const player of fallbackPlayers) {
        const id = String(player._id);
        if (!lineupClubMap.has(id)) {
          lineupClubMap.set(id, player.club);
        }
      }
      allowedIds = uniqueObjectIds([...lineupClubMap.keys()]);
    }

    if (!allowedIds.length) {
      return res.status(400).json({ success: false, message: 'Match roster is empty' });
    }

    const upsertOps = [];

    for (const row of stats) {
      const playerId = row.playerId;
      if (!mongoose.Types.ObjectId.isValid(playerId)) {
        return res.status(400).json({ success: false, message: 'Invalid player reference' });
      }
      if (!allowedIds.includes(String(playerId))) {
        return res.status(400).json({
          success: false,
          message: 'Submitted stats include players outside this match roster',
        });
      }

      const goals = Number(row.goals ?? 0);
      const assists = Number(row.assists ?? 0);
      const yellowCards = Number(row.yellowCards ?? 0);
      const redCards = Number(row.redCards ?? 0);

      if ([goals, assists, yellowCards, redCards].some((value) => Number.isNaN(value) || value < 0)) {
        return res.status(400).json({ success: false, message: 'Stat values must be valid numbers' });
      }

      const clubId = lineupClubMap.get(String(playerId));

      upsertOps.push(
        PlayerStat.updateOne(
          { match: matchId, player: playerId },
          {
            $set: {
              club: clubId,
              goals,
              assists,
              yellowCards,
              redCards,
            },
          },
          { upsert: true },
        ),
      );
    }

    await Promise.all(upsertOps);

    const persisted = await PlayerStat.find({ match: matchId })
      .populate({ path: 'player', select: 'name profilePicture position' })
      .sort({ 'player.name': 1 });

    res.status(201).json({ success: true, data: persisted });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to save player statistics' });
  }
};
