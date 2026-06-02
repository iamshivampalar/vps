import jwt from 'jsonwebtoken';
import { User, Student, College, Notification } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_AMBITION_INTELLIGENT_SECRET_2026';

// 1. Fully Authenticate and force login for Dashboard portals
export async function isAuthenticated(req, res, next) {
  const token = req.cookies.jwt_token;

  if (!token) {
    if (req.xhr) {
       return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.redirect('/auth/login?error=Session expired. Please log in.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: College, as: 'college' }] },
        { model: College, as: 'managedCollege' }
      ]
    });

    if (!user || user.status !== 'active') {
      res.clearCookie('jwt_token');
      if (req.xhr) return res.status(401).json({ error: 'User is inactive or suspended.' });
      return res.redirect('/auth/login?error=Your account is suspended or inactive.');
    }

    // Fetch unread notifications
    const unreadCount = await Notification.count({
      where: { userId: user.id, status: 'unread' }
    });

    req.user = user;
    res.locals.user = user;
    res.locals.unreadCount = unreadCount;
    next();
  } catch (error) {
    console.error('Auth Middleware error:', error);
    res.clearCookie('jwt_token');
    if (req.xhr) return res.status(401).json({ error: 'Invalid authentication session.' });
    return res.redirect('/auth/login?error=Session invalid. Please login again.');
  }
}

// 2. Allow checking user cookies optionally for static public navbar displays
export async function optionalAuth(req, res, next) {
  const token = req.cookies.jwt_token;
  res.locals.user = null;
  res.locals.unreadCount = 0;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        include: [
          { model: Student, as: 'student' }
        ]
      });
      if (user && user.status === 'active') {
        const unreadCount = await Notification.count({
          where: { userId: user.id, status: 'unread' }
        });
        req.user = user;
        res.locals.user = user;
        res.locals.unreadCount = unreadCount;
      }
    } catch (e) {
      // ignore invalid tokens and render page as guest
    }
  }
  next();
}

// 3. Simple Middleware to Restrict Pages by Roles
export function hasRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).redirect('/auth/login?error=Unauthenticated.');
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).render('error', { 
        title: 'Access Denied', 
        message: 'You are not authorized to view this resource.' 
      });
    }
    next();
  };
}
