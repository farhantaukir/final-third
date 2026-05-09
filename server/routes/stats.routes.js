import express from 'express';
import {
  adminClubStandings,
  adminTopPerformers,
  coachSquadSummary,
  playerPersonalStats,
} from '../controllers/stats.controller.js';
import { protectAdmin, protectMember, authorise } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/player/me', protectMember, authorise('player'), playerPersonalStats);
router.get('/coach/squad', protectMember, authorise('coach'), coachSquadSummary);
router.get('/admin/leaderboard', protectAdmin, authorise('admin'), adminTopPerformers);
router.get('/admin/standings', protectAdmin, authorise('admin'), adminClubStandings);

export default router;
