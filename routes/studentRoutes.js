import express from 'express';
import { 
  getDashboard, 
  postApply, 
  getProfile, 
  postUpdateProfile, 
  getTaskSubmission, 
  postSubmitTask,
  postDismissNotification
} from '../controllers/studentController.js';
import { isAuthenticated, hasRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(isAuthenticated, hasRole('Student'));

// Dashboard Landing
router.get('/dashboard', getDashboard);

// Apply to Internships
router.post('/apply', postApply);

// Manage Profiles with uploads
router.get('/profile', getProfile);
router.post('/profile/update', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), postUpdateProfile);

// Task Assignments
router.get('/tasks/:taskId', getTaskSubmission);
router.post('/tasks/:taskId/submit', upload.single('attachments'), postSubmitTask);

// Dismiss Notification Alerts
router.post('/notifications/:id/dismiss', postDismissNotification);

export default router;
