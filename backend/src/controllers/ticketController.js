import Ticket from '../models/Ticket.js';
import { classifyTicket } from '../services/aiService.js';

// Note: We completely removed the `import { io } from '../server.js'`

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private (Customer)
export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      customerId: req.user._id,
      status: 'Open',
    });

    res.status(201).json(ticket);

    // Trigger AI classification asynchronously
    classifyTicket(title, description)
      .then(async (aiResult) => {
        // ✅ Capture the result into the updatedTicket variable
        const updatedTicket = await Ticket.findByIdAndUpdate(
          ticket._id,
          {
            aiCategory: aiResult.aiCategory,
            aiPriority: aiResult.aiPriority,
            aiConfidenceScore: aiResult.aiConfidenceScore,
          },
          { new: true }
        ).populate('customerId', 'name email');

        // ✅ Use req.io to emit to the frontend dashboard
        req.io.emit('ticketUpdated', updatedTicket);
      })
      .catch((err) => console.error('Async AI classification failed:', err));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tickets (Role-based filtering)
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Customer') {
      // Customers only see their own tickets
      query.customerId = req.user._id;
    } else if (req.user.role === 'Agent') {
      // Agents see tickets assigned to them + all tickets they commented on
      query = {
        $or: [{ assignedAgentId: req.user._id }, { 'comments.senderId': req.user._id }],
      };
    }
    // Admins see all tickets (no query filter needed)

    const tickets = await Ticket.find(query)
      .populate('customerId', 'name email')
      .populate('assignedAgentId', 'name')
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('assignedAgentId', 'name')
      .populate('comments.senderId', 'name role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Security check: If Customer, ensure they own the ticket
    if (
      req.user.role === 'Customer' &&
      ticket.customerId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment to a ticket thread
// @route   POST /api/tickets/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (req.user.role === 'Customer' && ticket.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to comment on this ticket' });
    }

    const newComment = {
      senderId: req.user._id,
      message,
    };

    ticket.comments.push(newComment);
    await ticket.save();

    // ✅ Populate the sender data so the frontend immediately knows the name/role of who commented
    await ticket.populate('comments.senderId', 'name role');

    // ✅ Emit the new data to ALL users in this ticket room (including the sender)
    console.log(`📤 Broadcasting ticket_updated event to room: ${req.params.id}`);
    req.io.to(req.params.id).emit('ticket_updated', ticket);

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status/assignment (Agent/Admin only)
// @route   PUT /api/tickets/:id
// @access  Private (Agent, Admin)
export const updateTicket = async (req, res) => {
  try {
    const { status, assignedAgentId, aiCategory, aiPriority } = req.body;

    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (status) ticket.status = status;
    if (assignedAgentId) ticket.assignedAgentId = assignedAgentId;
    if (aiCategory) ticket.aiCategory = aiCategory;
    if (aiPriority) ticket.aiPriority = aiPriority;

    const updatedTicket = await ticket.save();

    // Ensure data is populated before sending it back
    await updatedTicket.populate('customerId', 'name email');
    await updatedTicket.populate('assignedAgentId', 'name');
    await updatedTicket.populate('comments.senderId', 'name role');

    // ✅ Broadcast the update to the ticket room so the UI updates instantly
    req.io.to(req.params.id).emit('ticket_updated', updatedTicket);

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete ticket (Admin or Ticket Owner/Customer)
// @route   DELETE /api/tickets/:id
// @access  Private (Admin, Customer/Owner)
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check authorization: Only Admin or the ticket owner (Customer) can delete
    if (req.user.role !== 'Admin' && ticket.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this ticket' });
    }

    // Delete the ticket
    await Ticket.findByIdAndDelete(req.params.id);

    // ✅ Broadcast deletion to all connected clients
    req.io.emit('ticketDeleted', { ticketId: req.params.id });

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
