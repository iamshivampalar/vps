import express from 'express';
import { 
  getDashboard,
  getStudents,
  getExportStudentsCsv,
  postToggleStudentStatus,
  getColleges,
  postAddCollege,
  postVerifyCollege,
  getInternships,
  postCreateInternship,
  postUpdateInternshipStatus,
  getTasks,
  postAddUniversalTask,
  getApplications,
  postAuditApplication,
  getSubmissions,
  postReviewSubmission,
  postIssueCertificate,
  getSettings,
  postUpdateSettings,
  postUpdateCms
} from '../controllers/adminController.js';
import { isAuthenticated, hasRole } from '../middleware/auth.js';

const router = express.Router();

router.use(isAuthenticated, hasRole('Super Admin', 'Admin', 'Coordinator', 'College Representative'));

// Main Dashboard Widget
router.get('/dashboard', getDashboard);

// Students Directory Mapping
router.get('/students', getStudents);
router.get('/students/export', getExportStudentsCsv);
router.post('/students/toggle-status', postToggleStudentStatus);

// College Partner Institutes
router.get('/colleges', getColleges);
router.post('/colleges/add', postAddCollege);
router.post('/colleges/verify', postVerifyCollege);

// Internship Program Publisher
router.get('/internships', getInternships);
router.post('/internships/create', postCreateInternship);
router.post('/internships/toggle-status', postUpdateInternshipStatus);

// Academic Tasks Tracker
router.get('/tasks', getTasks);
router.post('/tasks/add', postAddUniversalTask);

// Applications Review Gate
router.get('/applications', getApplications);
router.post('/applications/audit', postAuditApplication);

// Homework Review Queue
router.get('/submissions', getSubmissions);
router.post('/submissions/review', postReviewSubmission);

// Digital Credentials Generating Service
router.post('/certificates/issue', postIssueCertificate);

// Core System Configurations
router.get('/settings', getSettings);
router.post('/settings/update', postUpdateSettings);
router.post('/settings/cms', postUpdateCms);

export default router;
