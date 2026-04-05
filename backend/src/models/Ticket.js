import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    // --- AI Metadata Fields ---
    aiCategory: {
      type: String,
      enum: ['Billing', 'Technical', 'Sales', 'General', 'Unclassified'],
      default: 'Unclassified',
    },
    aiPriority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical', 'Unassigned'],
      default: 'Unassigned',
    },
    aiConfidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    // ---------------------------
    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Ticket', ticketSchema);
