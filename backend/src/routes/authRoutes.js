import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../middlewares/validationMiddleware.js';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', registerLimiter, validateRegister, handleValidationErrors, registerUser);
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, loginUser);
router.post('/logout', logoutUser);

export default router;
