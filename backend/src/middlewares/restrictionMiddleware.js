import User from '../models/User.js';

/**
 * Middleware to check if user is restricted
 * Restricted users can only:
 * - View their profile
 * - View their existing tickets
 * - Login/logout
 *
 * Restricted users CANNOT:
 * - Create new tickets
 * - Add comments/chat
 * - Perform other operations
 */
export const checkRestriction = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store restriction status in request for later checks
    req.user.restricted = user.restricted;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Check if a restricted user is trying to perform a restricted action
 * Used for creating tickets, adding comments, reassigning agents
 */
export const checkRestrictedAction = (req, res, next) => {
  if (req.user.restricted) {
    return res.status(403).json({
      message:
        'Your account has been restricted. You can only view your profile and existing tickets.',
    });
  }
  next();
};
