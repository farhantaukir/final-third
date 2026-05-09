import express from 'express';
import {
  coachPlayerProfile,
  createAnnouncement,
  listClubAnnouncements,
  listFeedbackForPlayer,
  sendFeedback,
} from '../controllers/communication.controller.js';
import { protectMember, authorise } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/announcements', protectMember, authorise('coach'), createAnnouncement);
router.get('/announcements', protectMember, authorise('coach', 'player'), listClubAnnouncements);

router.post('/feedback', protectMember, authorise('coach'), sendFeedback);
router.get('/feedback/me', protectMember, authorise('player'), listFeedbackForPlayer);

router.get('/coach/player/:playerId', protectMember, authorise('coach'), coachPlayerProfile);

export default router;
