import express from 'express';
import {
  addPlayerToClub,
  assignCoach,
  assignLeague,
  createClub,
  createLeague,
  deleteClub,
  deleteLeague,
  getClubById,
  listClubs,
  listCoachOptions,
  listLeagues,
  removePlayerFromClub,
  updatePlayerPosition,
  updateClubHomeVenue,
} from '../controllers/club.controller.js';
import { protectAdmin, authorise } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protectAdmin, authorise('admin'));

router.get('/', listClubs);
router.post('/', createClub);
router.delete('/:clubId', deleteClub);
router.get('/coaches', listCoachOptions);
router.get('/leagues', listLeagues);
router.post('/leagues', createLeague);
router.delete('/leagues/:leagueId', deleteLeague);
router.get('/:clubId', getClubById);
router.patch('/:clubId/coach', assignCoach);
router.patch('/:clubId/league', assignLeague);
router.patch('/:clubId/home-venue', updateClubHomeVenue);
router.post('/:clubId/players', addPlayerToClub);
router.delete('/:clubId/players/:playerId', removePlayerFromClub);
router.patch('/:clubId/players/:playerId/position', updatePlayerPosition);

export default router;
