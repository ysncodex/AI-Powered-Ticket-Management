import express from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  addComment,
  updateTicket,
  deleteTicket,
} from '../controllers/ticketController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { checkRestriction, checkRestrictedAction } from '../middlewares/restrictionMiddleware.js';
import {
  validateCreateTicket,
  handleValidationErrors,
} from '../middlewares/validationMiddleware.js';
import { createTicketLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// All ticket routes require authentication
router.use(protect);
router.use(checkRestriction); // Check if user is restricted

// Route: /api/tickets
router
  .route('/')
  .post(
    authorizeRoles('Customer'),
    checkRestrictedAction, // Restricted users cannot create tickets
    createTicketLimiter,
    validateCreateTicket,
    handleValidationErrors,
    createTicket
  ) // Only Customers can create tickets
  .get(getTickets); // Everyone can get tickets (filtered by role in controller)

// Route: /api/tickets/:id
router
  .route('/:id')
  .get(getTicketById)
  .put(authorizeRoles('Agent', 'Admin'), updateTicket)
  .delete(deleteTicket); // Admin or ticket owner (Customer) can delete

// Route: /api/tickets/:id/comments
router.route('/:id/comments').post(checkRestrictedAction, addComment); // Restricted users cannot add comments

export default router;
