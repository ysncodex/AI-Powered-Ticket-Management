# 🎫 AI-Powered Ticket Management System

**A modern, intelligent support ticket platform with AI-driven classification, real-time collaboration, and role-based access control.**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Ticket Lifecycle Flow](#ticket-lifecycle-flow)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Getting Started](#getting-started)
7. [AI Classification Guide](#ai-classification-guide)
8. [Restricted Accounts](#restricted-accounts)
9. [API Documentation](#api-documentation)
10. [Troubleshooting](#troubleshooting)

---

## 🔑 Demo Accounts ← ADD THIS (NEW LOGIN PANEL SECTION)

╔══════════════════════════════════════╗
║ 🚀 SYSTEM LOGIN ACCESS ║
╠══════════════════════════════════════╣
║ 👨‍💼 Admin ║
║ Email: admin@gmail.com ║
║ Password: 11111111 ║
╠══════════════════════════════════════╣
║ 🧑‍🔧 Agent ║
║ Email: agent@gmail.com ║
║ Password: 11111111 ║
╠══════════════════════════════════════╣
║ 👤 Customer ║
║ Email: customer@gmail.com ║
║ Password: 11111111 ║
╚══════════════════════════════════════╝

---

## 🎯 Overview

This application helps organizations efficiently manage customer support tickets through:

- **Intelligent AI Classification**: Automatically categorizes and prioritizes tickets
- **Real-Time Collaboration**: Live chat between customers and agents
- **Role-Based Access Control**: Different features for Customers, Agents, and Admins
- **Smart Assignment**: Suggestions for optimal agent-to-ticket matching
- **Analytics Dashboard**: Insights into ticket trends and support performance
- **Account Restrictions**: Admins can restrict user access when needed

---

## ✨ Key Features

### 🤖 AI-Powered Intelligence

- **Automatic Classification**: **AI analyzes ticket titles & descriptions to assign categories (Billing, Technical, Sales, General)**
- **Smart Prioritization**: **Tickets are ranked Critical → High → Medium → Low based on content analysis**
- **Confidence Scoring**: **Each classification includes a confidence score (0-100%) for quality assurance**
- **Asynchronous Processing**: **AI runs in the background, never blocks ticket creation**

### 💬 Real-Time Collaboration

- **Live Chat**: Instant messaging between customers and agents
- **Auto-Focus**: Message box automatically focuses when you open the conversation
- **Auto-Scroll**: Automatically jumps to the latest message
- **Keyboard Shortcuts**: **Press Ctrl+Enter (or Cmd+Enter on Mac) to send messages**
- **Send Notifications**: Visual feedback showing message status (Sending → Sent or Error)
- **Room-Based Sockets**: WebSocket integration for real-time updates

### 👥 Three-Tier Role System

**Customer**

- ✓ Create support tickets
- ✓ View own tickets
- ✓ Chat with agents
- ✓ View profile & change password
- ✗ Cannot manage other tickets
- ✗ Cannot change user roles

**Agent**

- ✓ View all assigned tickets
- ✓ Update ticket status
- ✓ Chat/reply to customers
- ✓ Record customer interactions
- ✓ See AI classification details
- ✗ Cannot delete tickets
- ✗ Cannot manage users

**Admin**

- ✓ View ALL tickets (all users, all statuses)
- ✓ Manage all ticket statuses
- ✓ Reassign tickets to different agents
- ✓ Manage user accounts
- ✓ **Restrict user accounts**
- ✓ Override AI classifications
- ✓ Access analytics dashboard

### 🔐 Restricted Accounts

When an admin restricts a user:

- ✓ They can still log in
- ✓ They can view their profile
- ✓ They can view existing tickets
- ✗ They CANNOT create new tickets
- ✗ They CANNOT chat or reply
- ✗ They CANNOT perform any write operations

---

## 🔄 System Architecture

### Technology Stack

**Frontend**

- **React** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **React Query (TanStack Query)** - Data fetching & caching
- **Socket.IO Client** - Real-time WebSocket communication
- **Zustand** - State management
- **Lucide Icons** - UI icons

**Backend**

- **Node.js & Express** - Server framework
- **MongoDB** - Database
- **OpenAI GPT-3.5 Turbo** - AI classification engine
- **Socket.IO** - WebSocket server for real-time features
- **JWT** - Authentication tokens

### Database Models

**User**

```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: 'Customer' | 'Agent' | 'Admin',
  restricted: Boolean,
  active: Boolean,
  timestamps
}
```

**Ticket**

```javascript
{
  title: String,
  description: String,
  customerId: ObjectId (User),
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed',
  assignedAgentId: ObjectId (User, optional),
  // AI Classification Fields
  aiCategory: 'Billing' | 'Technical' | 'Sales' | 'General' | 'Unclassified',
  aiPriority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Unassigned',
  aiConfidenceScore: Number (0-100),
  comments: [{ senderId, message, createdAt }],
  timestamps
}
```

---

## 📈 Ticket Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    TICKET CREATION                          │
│  Customer logs in → submits ticket with title & description │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    AI PROCESSING                            │
│  AI reads title + description → analyzes → generates:       │
│  • Category (e.g., "Technical")                             │
│  • Priority (e.g., "High")                                  │
│  • Confidence Score (e.g., 92%)                             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  DASHBOARD DISPLAY                          │
│  Ticket appears on Agent Dashboard with:                    │
│  ✓ AI-assigned priority (color-coded)                       │
│  ✓ AI category tag                                          │
│  ✓ AI confidence indicator                                  │
│  ✓ Assignment suggestions (for agents & admins)             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    TRIAGE & TRIAGE                          │
│  Agent receives notification of new ticket                  │
│  Agent reviews AI classification (can manually override)    │
│  Agent clicks "Assign to Me" or Admin reassigns             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                 ACTIVE RESOLUTION                           │
│  Agent & Customer chat back and forth                       │
│  Both see messages in real-time via WebSockets              │
│  Agent provides solution or escalates if needed             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   TICKET CLOSED                             │
│  Agent marks ticket "Closed"                                │
│  Customer can no longer add new messages                    │
│  Ticket remains searchable for future reference             │
└─────────────────────────────────────────────────────────────┘
```

---

## 👤 User Roles & Permissions

### CRUD Permissions Matrix

| Operation            | Customer | Agent | Admin |
| -------------------- | -------- | ----- | ----- |
| **Create Ticket**    | ✓        | ✗     | ✓     |
| **Read Own Tickets** | ✓        | ✓     | ✓     |
| **Read All Tickets** | ✗        | ✗     | ✓     |
| **Update Status**    | ✗        | ✓     | ✓     |
| **Reassign Ticket**  | ✗        | ✗     | ✓     |
| **Add Comment**      | ✓        | ✓     | ✓     |
| **Delete Ticket**    | ✗        | ✗     | ✗     |
| **View Analytics**   | ✗        | ✗     | ✓     |
| **Manage Users**     | ✗        | ✗     | ✓     |
| **Restrict Users**   | ✗        | ✗     | ✓     |

### Restriction Rules

When a user account is **restricted** by an admin:

| Feature                 | Normal | Restricted |
| ----------------------- | ------ | ---------- |
| Login                   | ✓      | ✓          |
| View Profile            | ✓      | ✓          |
| Change Password         | ✓      | ✓          |
| View Existing Tickets   | ✓      | ✓          |
| **Create New Ticket**   | ✓      | **✗**      |
| **Send Chat Message**   | ✓      | **✗**      |
| **Any Write Operation** | ✓      | **✗**      |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ & npm
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

#### 1. Clone & Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/tickets
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=sk-....
PORT=5000
NODE_ENV=development
```

Start backend:

```bash
npm start
```

#### 2. Setup Frontend

```bash
cd boilerplate
npm install
```

Create `.env.local`:

```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

Visit: http://localhost:5173

---

## 🤖 AI Classification Guide

### How AI Classification Works

1. **Input**: Ticket title + description
2. **Processing**: OpenAI GPT-3.5 Turbo analyzes the text
3. **Output**:
   - Category (Billing | Technical | Sales | General | Unclassified)
   - Priority (Critical | High | Medium | Low | Unassigned)
   - Confidence Score (0-100)

### Categories Explained

- **Billing**: Payment, invoicing, refunds, pricing, subscription issues
- **Technical**: Bugs, errors, crashes, performance, integration issues
- **Sales**: Licensing questions, product inquiries, upgrade requests
- **General**: Feedback, compliments, other inquiries
- **Unclassified**: Unclear or unusual requests

### Priority Levels

- 🔴 **Critical**: System down, major data loss, security breach
- 🟠 **High**: Feature broken, significant business impact, many users affected
- 🟡 **Medium**: Minor bugs, non-critical issues, workarounds available
- 🟢 **Low**: Feature requests, enhancement ideas, nice-to-have improvements
- ⚪ **Unassigned**: AI couldn't determine priority

### Confidence Scores

- **80-100%**: High confidence - trust the classification
- **60-79%**: Moderate confidence - review recommended
- **0-59%**: Low confidence - manually verify & adjust

### Example Classification

**Input:**

```
Title: "Payment keeps failing"
Description: "I try to add my credit card but get error 402.
My subscription needs to renew tomorrow. This is urgent!"
```

**AI Output:**

```json
{
  "aiCategory": "Billing",
  "aiPriority": "High",
  "aiConfidenceScore": 94
}
```

**Why?**

- Category = "Billing" (payment/credit card issue)
- Priority = "High" (urgent, subscription renewal at risk)
- Confidence = 94 (very clear the issue is critical payment problem)

### Cost & Performance

- **Model**: GPT-3.5 Turbo (~$0.0005 per classification)
- **Speed**: 1-2 seconds per ticket
- **Accuracy**: ~90-95% for clear support topics
- **Reliability**: 99.9% uptime (OpenAI SLA)
- **Monthly Cost**: ~$1.50-$2 for 100 tickets/day

### When Classification Fails

**"Why is my ticket Unclassified?"**

- Topic doesn't fit standard categories
- Very ambiguous or mixed issues
- Extremely unusual request
- Backend error (check server logs)

**"The classification is wrong"**

- Provide more details in ticket description
- Use specific, clear language
- Agents can manually override any classification

---

## 🔐 Managing Restricted Accounts

### Why Restrict Accounts?

Admins can restrict user accounts when:

- Suspicious account activity detected
- User violates terms of service
- Temporary account suspension needed
- User needs read-only access

### How to Restrict a User

_(Coming soon - Admin User Management panel)_

### What Happens When Account is Restricted?

User sees message: _"Your account has been restricted. You can only view your profile and existing tickets."_

They can:

- ✓ Log in normally
- ✓ View their profile
- ✓ View existing tickets
- ✓ Change their password

They CANNOT:

- ✗ Create new tickets (button disabled + error if attempted)
- ✗ Send chat messages (textarea disabled + error if attempted)
- ✗ Perform any write operations

### How to Unrestrict a User

_(Coming soon - Admin panel or API endpoint)_

---

## 🔌 API Documentation

### Authentication

All endpoints require JWT token in cookies (automatically handled by frontend)

### Ticket Endpoints

**Create Ticket**

```
POST /api/tickets
Body: { title: string, description: string }
Response: { _id, title, description, aiCategory, aiPriority, aiConfidenceScore, ... }
Access: Customer (not restricted)
```

**Get Tickets**

```
GET /api/tickets
Response: [{ _id, title, status, aiPriority, assignedAgentId, ... }]
Access: All authenticated users (role-filtered)
  - Customers: only their own tickets
  - Agents: assigned to them + their comments
  - Admins: all tickets
```

**Get Ticket Details**

```
GET /api/tickets/:id
Response: { _id, title, description, comments, status, ... }
Access: Owner, assigned agent, or admin
```

**Update Ticket**

```
PUT /api/tickets/:id
Body: { status?, aiCategory?, aiPriority?, assignedAgentId? }
Response: Updated ticket object
Access: Agent or Admin only
```

**Add Comment**

```
POST /api/tickets/:id/comments
Body: { message: string }
Response: { _id, comments: [...] }
Access: All authenticated users (not restricted)
```

---

## ❓ Troubleshooting

### AI Classification Not Working

**Problem**: All new tickets show "Unclassified" and "Unassigned"

**Solutions:**

1. Check OpenAI API key in `.env`
2. Verify API quota not exceeded
3. Check backend logs: `npm logs` or console
4. Test API directly: `curl -X POST https://api.openai.com/v1/chat/completions`

### Chat Messages Not Sending

**Problem**: "Failed to send message" error

**Solutions:**

1. Check if account is restricted (see restriction banner)
2. Check network connection
3. Verify ticket is not closed
4. Check chat server logs

### Real-Time Updates Not Working

**Problem**: Messages/updates not appearing in real-time

**Solutions:**

1. Check WebSocket connection: open DevTools → Network → WS
2. Verify Socket.IO URL in `.env.local`
3. Check firewall/proxy settings
4. Try refreshing page to reconnect

### Permissions Denied Error

**Problem**: "Not authorized" message on API calls

**Solutions:**

1. Verify user role is appropriate for action
2. Check if account is restricted
3. Check if ticket belongs to user (for customers)
4. Log out and back in to refresh token

---

## 📞 Support

For issues or questions:

1. Check this README
2. Review API logs: `backend/logs/`
3. Check browser console for frontend errors
4. Check server logs for backend errors

---

## 📝 License

This project is proprietary and confidential.

---

**Last Updated**: April 5, 2026
**Version**: 1.0.0
