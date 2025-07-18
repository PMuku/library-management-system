import express from 'express';
import { issueBook, getCurrentIssues, getPastIssues, getOutstandingFines, payFine } from '../controllers/userController.js';
import authProtect from '../middleware/authProtect.js';

const router = express.Router();

router.post('/issue', authProtect(), issueBook);
router.get('/view-issued-current', authProtect(), getCurrentIssues);
router.get('/view-issued-past', authProtect(), getPastIssues);
router.get('/fines', authProtect(), getOutstandingFines);
router.post('/pay-fine', authProtect(), payFine);

export default router;