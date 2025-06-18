import express from 'express';
import { viewPendingRequests, approveRequest, rejectRequest, markReturned, getIssuedBooks, getOverdueUsers } from '../controllers/libController.js';
import authProtect from '../middleware/authProtect.js';

const router = express.Router();

router.get('/pending-requests', authProtect('librarian'), viewPendingRequests);
router.put('/approve-request/:id', authProtect('librarian'), approveRequest);
router.put('/reject-request/:id', authProtect('librarian'), rejectRequest);
router.put('/mark-returned/:id', authProtect('librarian'), markReturned);
router.get('/current-issues', authProtect('librarian'), getIssuedBooks);
router.get('/overdue-users', authProtect('librarian'), getOverdueUsers);

export default router;