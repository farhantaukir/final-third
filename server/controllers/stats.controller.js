import mongoose from 'mongoose';
import PlayerStat from '../models/playerStat.model.js';
import Match from '../models/match.model.js';
import Club from '../models/club.model.js';

function clubIdOf(user) {
  if (!user?.club) return null;
  return user.club._id ? user.club._id : user.club;
}

export const playerPersonalStats = async (req, res) => {
  try {
    if (req.user.role !== 'player') {
      return res.status(403).json({ success: false, message: 'Players only route' });
    }

    const playerId = req.user._id;

    const [totals] = await PlayerStat.aggregate([
      { $match: { player: new mongoose.Types.ObjectId(playerId) } },
      {
        $group: {
          _id: null,
          matchesPlayed: { $sum: 1 },
          goals: { $sum: '$goals' },
          assists: { $sum: '$assists' },
          yellowCards: { $sum: '$yellowCards' },
          redCards: { $sum: '$redCards' },
        },
      },
    ]);

    const perMatch = await PlayerStat.aggregate([
      { $match: { player: new mongoose.Types.ObjectId(playerId) } },
      {
        $lookup: {
          from: 'matches',
          localField: 'match',
          foreignField: '_id',
          as: 'fixture',
          pipeline: [
            {
              $project: {
                homeClub: 1,
                awayClub: 1,
                date: 1,
              },
            },
          ],
        },
      },
      { $unwind: '$fixture' },
      {
        $addFields: {
          opponentClub: {
            $cond: [
              { $eq: ['$club', '$fixture.homeClub'] },
              '$fixture.awayClub',
              '$fixture.homeClub',
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'clubs',
          localField: 'opponentClub',
          foreignField: '_id',
          as: 'opponentDoc',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $unwind: { path: '$opponentDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          opponent: { $ifNull: ['$opponentDoc.name', 'Opponent'] },
          date: '$fixture.date',
          goals: 1,
          assists: 1,
          yellowCards: 1,
          redCards: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    const summary =
      totals || {
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
      };

    delete summary._id;

    res.json({
      success: true,
      data: {
        summary: {
          matchesPlayed: summary.matchesPlayed || 0,
          goals: summary.goals || 0,
          assists: summary.assists || 0,
          yellowCards: summary.yellowCards || 0,
          redCards: summary.redCards || 0,
        },
        perMatch,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load player statistics' });
  }
};

export const coachSquadSummary = async (req, res) => {
  try {
    if (req.user.role !== 'coach') {
      return res.status(403).json({ success: false, message: 'Coach only route' });
    }

    const clubId = clubIdOf(req.user);
    if (!clubId) {
      return res.status(400).json({ success: false, message: 'No club assignment found' });
    }

    const clubObjectId = new mongoose.Types.ObjectId(clubId);

    const [recordAgg] = await Match.aggregate([
      {
        $match: {
          status: 'Completed',
          $or: [{ homeClub: clubObjectId }, { awayClub: clubObjectId }],
          'score.home': { $exists: true },
          'score.away': { $exists: true },
        },
      },
      {
        $addFields: {
          clubScore: {
            $cond: [
              { $eq: ['$homeClub', clubObjectId] },
              '$score.home',
              '$score.away',
            ],
          },
          opponentScore: {
            $cond: [
              { $eq: ['$homeClub', clubObjectId] },
              '$score.away',
              '$score.home',
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          played: { $sum: 1 },
          wins: {
            $sum: {
              $cond: [{ $gt: ['$clubScore', '$opponentScore'] }, 1, 0],
            },
          },
          draws: {
            $sum: {
              $cond: [{ $eq: ['$clubScore', '$opponentScore'] }, 1, 0],
            },
          },
          losses: {
            $sum: {
              $cond: [{ $lt: ['$clubScore', '$opponentScore'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const record = recordAgg || { played: 0, wins: 0, draws: 0, losses: 0 };

    delete record._id;

    let leaguePosition = null;
    let leagueSize = 0;
    const coachClub = await Club.findById(clubId).select('_id league');
    if (coachClub?.league) {
      const leagueObjectId = new mongoose.Types.ObjectId(coachClub.league);
      const standings = await Match.aggregate([
        {
          $match: {
            status: 'Completed',
            'score.home': { $exists: true },
            'score.away': { $exists: true },
          },
        },
        {
          $project: {
            homeClub: 1,
            awayClub: 1,
            scoreHome: '$score.home',
            scoreAway: '$score.away',
          },
        },
        {
          $project: {
            entries: [
              {
                club: '$homeClub',
                goalsFor: '$scoreHome',
                goalsAgainst: '$scoreAway',
                win: { $cond: [{ $gt: ['$scoreHome', '$scoreAway'] }, 1, 0] },
                draw: { $cond: [{ $eq: ['$scoreHome', '$scoreAway'] }, 1, 0] },
                loss: { $cond: [{ $lt: ['$scoreHome', '$scoreAway'] }, 1, 0] },
              },
              {
                club: '$awayClub',
                goalsFor: '$scoreAway',
                goalsAgainst: '$scoreHome',
                win: { $cond: [{ $gt: ['$scoreAway', '$scoreHome'] }, 1, 0] },
                draw: { $cond: [{ $eq: ['$scoreAway', '$scoreHome'] }, 1, 0] },
                loss: { $cond: [{ $lt: ['$scoreAway', '$scoreHome'] }, 1, 0] },
              },
            ],
          },
        },
        { $unwind: '$entries' },
        {
          $group: {
            _id: '$entries.club',
            played: { $sum: 1 },
            goalsFor: { $sum: '$entries.goalsFor' },
            goalsAgainst: { $sum: '$entries.goalsAgainst' },
            wins: { $sum: '$entries.win' },
            draws: { $sum: '$entries.draw' },
            losses: { $sum: '$entries.loss' },
          },
        },
        {
          $lookup: {
            from: 'clubs',
            localField: '_id',
            foreignField: '_id',
            as: 'clubDoc',
            pipeline: [{ $project: { league: 1 } }],
          },
        },
        { $unwind: '$clubDoc' },
        { $match: { 'clubDoc.league': leagueObjectId } },
        {
          $addFields: {
            goalDifference: { $subtract: ['$goalsFor', '$goalsAgainst'] },
            points: { $add: [{ $multiply: ['$wins', 3] }, '$draws'] },
          },
        },
        { $sort: { points: -1, goalDifference: -1, goalsFor: -1, _id: 1 } },
      ]);

      leagueSize = standings.length;
      const idx = standings.findIndex((row) => String(row._id) === String(clubId));
      if (idx >= 0) {
        leaguePosition = idx + 1;
      }
    }

    const leaderboard = await PlayerStat.aggregate([
      { $match: { club: new mongoose.Types.ObjectId(clubId) } },
      {
        $group: {
          _id: '$player',
          goals: { $sum: '$goals' },
          assists: { $sum: '$assists' },
          yellowCards: { $sum: '$yellowCards' },
          redCards: { $sum: '$redCards' },
        },
      },
      {
        $addFields: {
          cards: { $add: ['$yellowCards', '$redCards'] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'playerDoc',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $unwind: '$playerDoc' },
      {
        $project: {
          playerId: '$_id',
          name: '$playerDoc.name',
          goals: 1,
          assists: 1,
          yellowCards: 1,
          redCards: 1,
          cards: 1,
        },
      },
      { $sort: { goals: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        record,
        leaguePosition,
        leagueSize,
        leaderboard,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to compile squad analytics' });
  }
};

export const adminTopPerformers = async (_req, res) => {
  try {
    const [facet] = await PlayerStat.aggregate([
      {
        $group: {
          _id: '$player',
          goals: { $sum: '$goals' },
          assists: { $sum: '$assists' },
        },
      },
      {
        $facet: {
          topScorers: [
            { $sort: { goals: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'player',
                pipeline: [{ $project: { name: 1, club: 1 } }],
              },
            },
            { $unwind: '$player' },
            {
              $lookup: {
                from: 'clubs',
                localField: 'player.club',
                foreignField: '_id',
                as: 'clubDetails',
                pipeline: [{ $project: { name: 1 } }],
              },
            },
            {
              $project: {
                playerId: '$_id',
                playerName: '$player.name',
                clubName: { $first: '$clubDetails.name' },
                totalGoals: '$goals',
              },
            },
          ],
          topAssisters: [
            { $sort: { assists: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'player',
                pipeline: [{ $project: { name: 1, club: 1 } }],
              },
            },
            { $unwind: '$player' },
            {
              $lookup: {
                from: 'clubs',
                localField: 'player.club',
                foreignField: '_id',
                as: 'clubDetails',
                pipeline: [{ $project: { name: 1 } }],
              },
            },
            {
              $project: {
                playerId: '$_id',
                playerName: '$player.name',
                clubName: { $first: '$clubDetails.name' },
                totalAssists: '$assists',
              },
            },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        topScorers: facet?.topScorers ?? [],
        topAssisters: facet?.topAssisters ?? [],
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to compile leaderboards' });
  }
};

export const adminClubStandings = async (_req, res) => {
  try {
    const leagueId = _req.query.leagueId;
    if (leagueId && !mongoose.Types.ObjectId.isValid(leagueId)) {
      return res.status(400).json({ success: false, message: 'Invalid league identifier' });
    }

    const standings = await Match.aggregate([
      {
        $match: {
          status: 'Completed',
          'score.home': { $exists: true },
          'score.away': { $exists: true },
        },
      },
      {
        $project: {
          homeClub: 1,
          awayClub: 1,
          scoreHome: '$score.home',
          scoreAway: '$score.away',
        },
      },
      {
        $project: {
          entries: [
            {
              club: '$homeClub',
              goalsFor: '$scoreHome',
              goalsAgainst: '$scoreAway',
              win: {
                $cond: [{ $gt: ['$scoreHome', '$scoreAway'] }, 1, 0],
              },
              draw: {
                $cond: [{ $eq: ['$scoreHome', '$scoreAway'] }, 1, 0],
              },
              loss: {
                $cond: [{ $lt: ['$scoreHome', '$scoreAway'] }, 1, 0],
              },
            },
            {
              club: '$awayClub',
              goalsFor: '$scoreAway',
              goalsAgainst: '$scoreHome',
              win: {
                $cond: [{ $gt: ['$scoreAway', '$scoreHome'] }, 1, 0],
              },
              draw: {
                $cond: [{ $eq: ['$scoreAway', '$scoreHome'] }, 1, 0],
              },
              loss: {
                $cond: [{ $lt: ['$scoreAway', '$scoreHome'] }, 1, 0],
              },
            },
          ],
        },
      },
      { $unwind: '$entries' },
      {
        $group: {
          _id: '$entries.club',
          played: { $sum: 1 },
          goalsFor: { $sum: '$entries.goalsFor' },
          goalsAgainst: { $sum: '$entries.goalsAgainst' },
          wins: { $sum: '$entries.win' },
          draws: { $sum: '$entries.draw' },
          losses: { $sum: '$entries.loss' },
        },
      },
      {
        $addFields: {
          goalDifference: { $subtract: ['$goalsFor', '$goalsAgainst'] },
        },
      },
      {
        $lookup: {
          from: 'clubs',
          localField: '_id',
          foreignField: '_id',
          as: 'clubDoc',
          pipeline: [{ $project: { name: 1, league: 1 } }],
        },
      },
      { $unwind: '$clubDoc' },
      ...(leagueId
        ? [{ $match: { 'clubDoc.league': new mongoose.Types.ObjectId(leagueId) } }]
        : []),
      {
        $lookup: {
          from: 'leagues',
          localField: 'clubDoc.league',
          foreignField: '_id',
          as: 'leagueDoc',
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      {
        $project: {
          clubId: '$_id',
          clubName: '$clubDoc.name',
          leagueId: '$clubDoc.league',
          leagueName: { $ifNull: [{ $first: '$leagueDoc.name' }, 'Unassigned'] },
          played: 1,
          wins: 1,
          draws: 1,
          losses: 1,
          goalsFor: 1,
          goalsAgainst: 1,
          goalDifference: 1,
        },
      },
      { $sort: { wins: -1, goalDifference: -1, goalsFor: -1, clubName: 1 } },
    ]);

    res.json({ success: true, data: standings });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to compile standings table' });
  }
};
