import jwt from 'jsonwebtoken';
import { User, Student, College, ActivityLog, Notification } from '../models/index.js';
import { sendEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_AMBITION_INTELLIGENT_SECRET_2026';

// Register Student account
export async function postRegister(req, res) {
  const { name, email, mobile, password, collegeId, degree, semester, referredByCode } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Generate unique referral code for the student
    const referralCode = 'IS-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Find referrer if any
    let referredByUserId = null;
    if (referredByCode) {
      const referrer = await Student.findOne({ where: { referralCode } });
      if (referrer) {
         referredByUserId = referrer.userId;
      }
    }

    // Create Base User
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role: 'Student'
    });

    // Create Student profile
    const student = await Student.create({
      userId: user.id,
      collegeId: collegeId || null,
      degree,
      semester,
      referralCode,
      referredByUserId
    });

    // Handle Referral action tracking if referrer is present
    if (referredByUserId) {
      const referrerUser = await User.findByPk(referredByUserId);
      if (referrerUser) {
        await Notification.create({
          userId: referredByUserId,
          title: 'Referral Sign Up!',
          message: `${name} registered using your invitation code ${referredByCode}. You will receive bonuses once they get approved.`,
          type: 'success'
        });
      }
    }

    // Log Activity
    await ActivityLog.create({
      userId: user.id,
      action: 'Account Registration',
      details: 'Registered a new Student profile successfully.',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Sign JWT Token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('jwt_token', token, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });

    // Send Welcome Email
    await sendEmail({
      to: email,
      subject: 'Welcome to InternSpace Fellowship!',
      html: `
        <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 10px;">Welcome to InternSpace, ${name}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your professional training and internship tracking application is officially set up.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #0f172a;"><strong>Your Invitation Referral Code:</strong> ${referralCode}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Share this with university classmates to build cooperative points!</p>
          </div>
          <p style="color: #475569; font-size: 13px;">Warm regards,<br>The InternSpace Academic Committee</p>
        </div>
      `
    });

    return res.status(201).json({ success: true, redirect: '/student/dashboard' });
  } catch (error) {
    console.error('Registration processing error:', error);
    return res.status(500).json({ error: error.message || 'Server error during registration.' });
  }
}

// User Sign-In Action
export async function postLogin(req, res) {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Incorrect email or password details.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your portal access is suspended. Contact programs oversight.' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect email or password details.' });
    }

    // Update metadata
    user.lastLogin = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    // Log Activity
    await ActivityLog.create({
      userId: user.id,
      action: 'Authorization Sign In',
      details: `Successful login from browser agent. Checked IP: ${req.ip}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Create JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: rememberMe ? '30d' : '7d' });
    res.cookie('jwt_token', token, { 
      httpOnly: true, 
      maxAge: rememberMe ? 30 * 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000 
    });

    // Determine redirect flow based on Privilege role
    let redirect = '/student/dashboard';
    if (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'Coordinator') {
      redirect = '/admin/dashboard';
    } else if (user.role === 'College Representative') {
      redirect = '/admin/dashboard'; // Both use enterprise panels
    }

    return res.status(200).json({ success: true, redirect });
  } catch (error) {
    console.error('Login action error:', error);
    return res.status(500).json({ error: 'Credentials review experienced a backend failure.' });
  }
}

// User Logout Action
export async function getLogout(req, res) {
  if (req.user) {
    await ActivityLog.create({
      userId: req.user.id,
      action: 'Authorization Sign Out',
      details: 'User logged out cleanly.',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  }
  res.clearCookie('jwt_token');
  return res.redirect('/auth/login?success=Logged out successfully.');
}
