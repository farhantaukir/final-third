import express from 'express';
import { body } from 'express-validator';
import {
  deleteAdminManagedUser,
  registerUser,
  loginCoachPlayer,
  loginAdmin,
  listAdminManagedUsers,
  logoutMember,
  logoutAdmin,
  getOwnProfile,
  updateOwnProfile,
} from '../controllers/user.controller.js';
import { protectAdmin, protectMember } from '../middleware/auth.middleware.js';
import { multerUpload } from '../utilities/upload.utility.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['coach', 'player']).withMessage('Role must be coach or player'),
  ],
  registerUser,
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginCoachPlayer,
);

router.post(
  '/admin/login',
  [
    body('email').trim().isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginAdmin,
);

router.post('/logout', protectMember, logoutMember);
router.post('/admin/logout', protectAdmin, logoutAdmin);

router.get('/profile', protectMember, getOwnProfile);
router.get('/admin/profile', protectAdmin, getOwnProfile);
router.patch(
  '/profile',
  protectMember,
  multerUpload.single('profilePicture'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('position')
      .optional()
      .custom((value) => {
        if (value === undefined || value === null) return true;
        const trimmed = String(value).trim();
        if (trimmed === '') return true;
        return ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].includes(trimmed);
      })
      .withMessage('Invalid position'),
  ],
  updateOwnProfile,
);

router.patch(
  '/admin/profile',
  protectAdmin,
  multerUpload.single('profilePicture'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('position')
      .optional()
      .custom((value) => {
        if (value === undefined || value === null) return true;
        const trimmed = String(value).trim();
        if (trimmed === '') return true;
        return ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].includes(trimmed);
      })
      .withMessage('Invalid position'),
  ],
  updateOwnProfile,
);

router.get('/admin/manage-users', protectAdmin, listAdminManagedUsers);
router.delete('/admin/manage-users/:userId', protectAdmin, deleteAdminManagedUser);

export default router;
