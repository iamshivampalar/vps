import express from 'express';
import { postRegister, postLogin, getLogout } from '../controllers/authController.js';
import { College } from '../models/index.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET auth register page
router.get('/register', optionalAuth, async (req, res) => {
  if (res.locals.user) {
    if (res.locals.user.role === 'Student') {
      return res.redirect('/student/dashboard');
    }
    return res.redirect('/admin/dashboard');
  }
  const colleges = await College.findAll({ where: { isVerified: true } });
  res.render('auth/register', { 
    title: 'Candidate Registration Portal',
    colleges,
    referredByCode: req.query.ref || ''
  });
});

// GET auth login page
router.get('/login', optionalAuth, (req, res) => {
  if (res.locals.user) {
    if (res.locals.user.role === 'Student') {
      return res.redirect('/student/dashboard');
    }
    return res.redirect('/admin/dashboard');
  }
  res.render('auth/login', { 
    title: 'Portal Credentials Gateway' 
  });
});

// POST register workflow processing
router.post('/register', postRegister);

// POST login credentials audit
router.post('/login', postLogin);

// GET logout cleanly
router.get('/logout', getLogout);

export default router;
