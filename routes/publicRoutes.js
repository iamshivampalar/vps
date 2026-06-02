import express from 'express';
import { 
  getHome, 
  getAbout, 
  getPrograms, 
  getProgramDetails, 
  getContact, 
  postContact, 
  getVerifyCertificate,
  getPrivacy,
  getTerms,
  getFaq
} from '../controllers/publicController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(optionalAuth);

router.get('/', getHome);
router.get('/about', getAbout);
router.get('/programs', getPrograms);
router.get('/programs/:id', getProgramDetails);

router.get('/contact', getContact);
router.post('/contact', postContact);

router.get('/verify', getVerifyCertificate);
router.get('/privacy', getPrivacy);
router.get('/terms', getTerms);
router.get('/faq', getFaq);

export default router;
