import express from 'express';
import {
  getUsers,
  getAgents,
  updateUserRole,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserById,
  restrictUser,
  unrestrictUser,
  toggleUserStatus,
  getAgentStats,
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes - must be logged in
router.use(protect);

// Public user routes (accessible to all authenticated users)
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/change-password', changePassword);

// Get agent stats (Agent or Admin)
router.get('/agent-stats', authorizeRoles('Agent', 'Admin'), getAgentStats);

// Get agents route - accessible to Admin and Agent
router.get('/agents', authorizeRoles('Admin', 'Agent'), getAgents);

// All remaining routes require Admin
router.use(authorizeRoles('Admin'));
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', toggleUserStatus);
router.put('/:id/restrict', restrictUser);
router.put('/:id/unrestrict', unrestrictUser);

export default router;
