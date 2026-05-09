import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const buildProtect = (role) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('club', 'name');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const protectMember = buildProtect(null);
export const protectAdmin = buildProtect('admin');

export const authorise =
  (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      next();
    };
