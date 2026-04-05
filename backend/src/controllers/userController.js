import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all agents (for assignment dropdown)
// @route   GET /api/users/agents
// @access  Private (Admin or Agent)
export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'Agent' }).select('-passwordHash');
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   POST /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restrict user account
// @route   PUT /api/users/:id/restrict
// @access  Private (Admin only)
export const restrictUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.restricted = true;
    user.active = false;
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User restricted successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        restricted: updatedUser.restricted,
        active: updatedUser.active,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unrestrict user account
// @route   PUT /api/users/:id/unrestrict
// @access  Private (Admin only)
export const unrestrictUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.restricted = false;
    user.active = true;
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User unrestricted successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        restricted: updatedUser.restricted,
        active: updatedUser.active,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user status (active/inactive)
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res) => {
  try {
    const { active } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.active = active;
    const updatedUser = await user.save();

    res.status(200).json({
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        restricted: updatedUser.restricted,
        active: updatedUser.active,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get agent statistics
// @route   GET /api/users/agent-stats
// @access  Private (Agent or Admin)
export const getAgentStats = async (req, res) => {
  try {
    // Import Ticket model dynamically to avoid circular dependencies
    const { default: Ticket } = await import('../models/Ticket.js');

    const agentId = req.user._id;

    // Get all tickets assigned to agent
    const assignedTickets = await Ticket.find({ assignedAgentId: agentId });

    const activeTickets = assignedTickets.filter((t) => ['Open', 'In Progress'].includes(t.status));

    const resolvedTickets = assignedTickets.filter((t) => t.status === 'Resolved');

    const criticalTickets = assignedTickets.filter(
      (t) => t.aiPriority === 'Critical' && ['Open', 'In Progress'].includes(t.status)
    );

    res.status(200).json({
      totalAssigned: assignedTickets.length,
      activeTickets: activeTickets.length,
      resolvedTickets: resolvedTickets.length,
      criticalActive: criticalTickets.length,
      resolutionRate:
        assignedTickets.length > 0
          ? Math.round((resolvedTickets.length / assignedTickets.length) * 100)
          : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
