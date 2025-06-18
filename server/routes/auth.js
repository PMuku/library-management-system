import express from 'express';
import { userLogin, userRegister, handleLogout, handleRefreshToken } from '../controllers/authController.js';
const router = express.Router();

// Login, Register, Logout, Refresh
router.post('/login', userLogin);
router.post('/register', userRegister);
router.post('/logout', handleLogout);
router.post('/refresh', handleRefreshToken);

export default router;