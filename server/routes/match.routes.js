import express from 'express';
import {
  createMatch,
  deleteMatch,
  getMatchLineupContext,
  lineupPlayersForCoach,
  listAllMatches,
  listClubMatchHistory,
  listClubUpcomingMatches,
  listPlayersForMatchStats,
  recordMatchResult,
  submitMatchPlayerStats,
  updateMatchLineup,
} from '../controllers/match.controller.js';
import { protectAdmin, protectMember, authorise } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protectAdmin, authorise('admin'), listAllMatches);
router.post('/', protectAdmin, authorise('admin'), createMatch);
router.delete('/:matchId', protectAdmin, authorise('admin'), deleteMatch);

router.get('/club/upcoming', protectMember, authorise('coach', 'player'), listClubUpcomingMatches);
router.get('/club/history', protectMember, authorise('coach', 'player'), listClubMatchHistory);

router.get('/coach/squad/options', protectMember, authorise('coach'), lineupPlayersForCoach);

router.patch('/:matchId/result', protectAdmin, authorise('admin'), recordMatchResult);
router.get('/:matchId/stats/roster', protectAdmin, authorise('admin'), listPlayersForMatchStats);
router.post('/:matchId/stats', protectAdmin, authorise('admin'), submitMatchPlayerStats);

router.patch('/:matchId/lineup', protectMember, authorise('coach'), updateMatchLineup);
router.get('/:matchId/lineup/context', protectMember, authorise('coach'), getMatchLineupContext);

export default router;
