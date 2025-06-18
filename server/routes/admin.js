import express from 'express';
import { makeLibrarian } from '../controllers/authController.js';
import authProtect from '../middleware/authProtect.js';
const router = express.Router();

// Make a librarian (ADMIN ONLY)
router.post('/makelib', authProtect('admin'), makeLibrarian);

export default router;