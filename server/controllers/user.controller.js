import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import User, { POSITIONS } from '../models/user.model.js';
import Club from '../models/club.model.js';
import PlayerStat from '../models/playerStat.model.js';
import Feedback from '../models/feedback.model.js';
import Announcement from '../models/announcement.model.js';
import { uploadBufferToCloudinary } from '../utilities/upload.utility.js';

const MEMBER_COOKIE = 'memberToken';
const ADMIN_COOKIE = 'adminToken';

function assertValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
    return false;
  }
  return true;
}

function signToken(userId, role) {
  return jwt.sign({ id: String(userId), role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function populateUserSansPassword(userDoc) {
  return User.findById(userDoc._id).select('-password').populate('club', 'name');
}

export const registerUser = async (req, res) => {
  try {
    if (!assertValidation(req, res)) return;

    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email: email.trim().toLowerCase() });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      email,
      password,
      role,
    });

    const created = await populateUserSansPassword(user);
    res.status(201).json({ success: true, data: created });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to register' });
  }
};

export const loginCoachPlayer = async (req, res) => {
  try {
    if (!assertValidation(req, res)) return;

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Use the admin portal to log in as admin' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id, user.role);
    const full = await populateUserSansPassword(user);
    res.json({ success: true, data: full, token });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to log in' });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    if (!assertValidation(req, res)) return;

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = signToken(user._id, user.role);
    const full = await populateUserSansPassword(user);
    res.json({ success: true, data: full, token });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to log in as admin' });
  }
};

const clearAuthCookie = (res, name) => {
  res.cookie(name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
};

export const logoutMember = async (_req, res) => {
  try {
    clearAuthCookie(res, MEMBER_COOKIE);
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to log out' });
  }
};

export const logoutAdmin = async (_req, res) => {
  try {
    clearAuthCookie(res, ADMIN_COOKIE);
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to log out' });
  }
};

export const getOwnProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load profile' });
  }
};

export const updateOwnProfile = async (req, res) => {
  try {
    if (!assertValidation(req, res)) return;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body?.name?.trim()) {
      user.name = req.body.name.trim();
    }

    if (req.user.role === 'player' && typeof req.body?.position !== 'undefined') {
      const pos = String(req.body.position).trim();
      if (pos !== '' && !POSITIONS.includes(pos)) {
        return res.status(400).json({ success: false, message: 'Invalid position' });
      }
      user.position = pos;
    }

    if (req.file?.buffer?.length) {
      const url = await uploadBufferToCloudinary(req.file.buffer);
      user.profilePicture = url;
    }

    await user.save();
    const refreshed = await populateUserSansPassword(user);

    res.json({ success: true, data: refreshed });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to update profile' });
  }
};

export const listAdminManagedUsers = async (_req, res) => {
  try {
    const [coaches, players] = await Promise.all([
      User.find({ role: 'coach' })
        .sort({ name: 1 })
        .select('_id name email role club profilePicture')
        .populate({ path: 'club', select: 'name' }),
      User.find({ role: 'player' })
        .sort({ name: 1 })
        .select('_id name email role club position profilePicture')
        .populate({ path: 'club', select: 'name' }),
    ]);

    res.json({ success: true, data: { coaches, players } });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to load users' });
  }
};

export const deleteAdminManagedUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user identifier' });
    }

    const user = await User.findById(userId);
    if (!user || !['coach', 'player'].includes(user.role)) {
      return res.status(404).json({ success: false, message: 'Coach or player not found' });
    }

    const tasks = [User.findByIdAndDelete(userId)];

    if (user.role === 'coach') {
      tasks.push(
        Club.updateMany({ coach: userId }, { $set: { coach: null } }),
        Feedback.deleteMany({ coach: userId }),
        Announcement.deleteMany({ coach: userId }),
      );
    } else {
      tasks.push(
        PlayerStat.deleteMany({ player: userId }),
        Feedback.deleteMany({ player: userId }),
      );
    }

    await Promise.all(tasks);
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, message: 'Unable to delete user' });
  }
};
