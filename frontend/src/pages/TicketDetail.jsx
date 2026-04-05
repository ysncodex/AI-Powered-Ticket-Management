import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../features/auth/authStore';
import {
  getTicketById,
  addComment,
  updateTicket,
  deleteTicket,
} from '../features/tickets/ticketApi';
import api from '../lib/axios';
import {
  ArrowLeft,
  Send,
  Bot,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  Edit2,
  Check,
  X,
  Lock,
  Trash2,
} from 'lucide-react';
import { io } from 'socket.io-client';

// Get token from cookies
const getTokenFromCookie = () => {
  const name = 'jwt=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

// Initialize the socket connection with authentication
let socket = null;

const initializeSocket = () => {
  const token = getTokenFromCookie();

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    withCredentials: true,
    autoConnect: false,
    auth: {
      token: token,
    },
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [editedCategory, setEditedCategory] = useState('');
  const [editedPriority, setEditedPriority] = useState('');
  const [isSelectingAgent, setIsSelectingAgent] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [sendStatus, setSendStatus] = useState(null); // 'sending' | 'sent' | 'error' | null

  // Refs for auto-scroll and focus
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 1. Fetch Initial Ticket Data
  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicketById(id),
  });

  // Auto-scroll to last message when comments change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.comments]);

  // Auto-focus on textarea when entering the conversation area
  useEffect(() => {
    if (ticket?.status !== 'Closed' && !user?.restricted) {
      textareaRef.current?.focus();
    }
  }, [ticket?.status, user?.restricted]);

  // Clear send status after 3 seconds
  useEffect(() => {
    if (sendStatus) {
      const timer = setTimeout(() => setSendStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [sendStatus]);

  // 1b. Fetch all agents for assignment dropdown (only if user is Agent or Admin)
  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await api.get('/users/agents');
      return response.data;
    },
    enabled: user?.role === 'Agent' || user?.role === 'Admin', // Only fetch if authorized
  });

  // 2. 🔥 WebSockets Integration with Authentication 🔥
  useEffect(() => {
    if (!socket) {
      socket = initializeSocket();
    }

    socket.connect();

    socket.on('connect', () => {
      console.log('✅ Connected:', socket.id);
      socket.emit('join_ticket', id); // ✅ emit AFTER connect
    });

    socket.on('ticket_updated', (updatedTicket) => {
      console.log('📨 Real-time ticket update received:', updatedTicket);

      queryClient.setQueryData(['ticket', id], updatedTicket);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      socket.off('connect');
      socket.off('ticket_updated');
      socket.off('error');
      socket.disconnect();
    };
  }, [id, queryClient]);

  // 3. Mutation for adding a comment
  const commentMutation = useMutation({
    mutationFn: addComment,
    onMutate: async () => {
      setSendStatus('sending');
      // Cancel any ongoing queries
      await queryClient.cancelQueries({ queryKey: ['ticket', id] });
    },
    onSuccess: (newCommentData) => {
      setNewComment('');
      setSendStatus('sent');
      // Immediately update the local cache with the new comment
      queryClient.setQueryData(['ticket', id], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          comments: [
            ...(oldData.comments || []),
            newCommentData.comment || newCommentData.comments?.[newCommentData.comments.length - 1],
          ],
        };
      });
      // Refetch ticket to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      // Auto-focus back to textarea after sending
      textareaRef.current?.focus();
    },
    onError: (error) => {
      setSendStatus('error');
      console.error('Error adding comment:', error);
      // Error is handled, form will unfreeze
    },
  });

  // 4. Mutation for updating status and AI fields
  const updateMutation = useMutation({
    mutationFn: updateTicket,
    onMutate: async (variables) => {
      // Cancel outgoing queries so they don't override optimistic update
      await queryClient.cancelQueries({ queryKey: ['ticket', id] });

      // Capture the previous data
      const previousTicket = queryClient.getQueryData(['ticket', id]);

      // Perform optimistic update
      queryClient.setQueryData(['ticket', id], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          ...variables.updateData,
        };
      });

      return { previousTicket };
    },
    onSuccess: (responseData) => {
      // Update cache with full response data from server (includes populated fields)
      queryClient.setQueryData(['ticket', id], responseData);
      // Mark edit mode as closed immediately
      setIsEditingAI(false);
      // Also invalidate dashboard cache for status changes
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTicket) {
        queryClient.setQueryData(['ticket', id], context.previousTicket);
      }
    },
  });

  // 5. Mutation for deleting a ticket
  const deleteMutation = useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      // Invalidate tickets list to reflect deletion
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      // Navigate back to dashboard after successful deletion
      setTimeout(() => navigate('/'), 500);
    },
    onError: (error) => {
      console.error('Error deleting ticket:', error);
    },
  });

  if (isLoading)
    return <div className="p-10 text-center text-slate-500">Loading ticket details...</div>;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load ticket.</div>;

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    updateMutation.mutate({ id, updateData: { status: newStatus } });
  };

  const handleEditAI = () => {
    setEditedCategory(ticket?.aiCategory || 'Unclassified');
    setEditedPriority(ticket?.aiPriority || 'Unassigned');
    setIsEditingAI(true);
  };

  const handleSaveAI = () => {
    updateMutation.mutate({
      id,
      updateData: {
        aiCategory: editedCategory,
        aiPriority: editedPriority,
      },
    });
    // Close edit mode immediately (setIsEditingAI handled in onSuccess)
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate({ id, message: newComment });
  };

  const handleKeyPress = (e) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (newComment.trim()) {
        commentMutation.mutate({ id, message: newComment });
      }
    }
    // Allow Shift+Enter for new lines
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Content & Comments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{ticket?.title}</h1>
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold">
                {ticket?.customerId?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {ticket?.customerId?.name || 'Unknown'}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(ticket?.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {ticket?.description}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Conversation</h2>

            {!ticket?.comments || ticket?.comments.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">
                No replies yet. Start the conversation!
              </p>
            ) : (
              <div className="max-h-96 overflow-y-auto mb-6 bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-4">
                {(ticket?.comments || [])
                  .filter((c) => c?.senderId)
                  .map((comment, index) => {
                    const isOwnComment = comment.senderId?._id === user?._id;
                    const isAgent = comment.senderId?.role !== 'Customer';

                    return (
                      <div
                        key={index}
                        className={`flex gap-3 ${isOwnComment ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isAgent ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}
                        >
                          {isAgent ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`p-3 rounded-lg break-words text-sm ${isOwnComment ? 'bg-blue-600 text-white ml-auto max-w-xs' : 'bg-white border border-slate-300 text-slate-800'}`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <span
                                className={`text-xs font-bold ${isOwnComment ? 'text-blue-100' : 'text-slate-900'}`}
                              >
                                {comment.senderId?.name || 'Unknown'}
                                {isAgent && <span className="text-xs ml-1">(Agent)</span>}
                              </span>
                              <span
                                className={`text-xs ${isOwnComment ? 'text-blue-200' : 'text-slate-500'}`}
                              >
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {comment.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>
            )}

            {user?.restricted ? (
              <div className="bg-red-50 text-red-700 text-center p-4 rounded-lg font-medium flex items-center justify-center gap-2 border border-red-200 mt-6">
                <Lock className="w-5 h-5" />
                <span>Your account has been restricted. You cannot send messages.</span>
              </div>
            ) : ticket?.status !== 'Closed' ? (
              <form onSubmit={submitComment} className="mt-6">
                <div className="flex flex-col gap-2 relative">
                  <textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your reply... (Ctrl+Enter to send, Shift+Enter for new line)"
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                    rows="2"
                    disabled={commentMutation.isPending}
                  />
                  <div className="flex gap-2 justify-between items-center">
                    <div>
                      {sendStatus === 'sending' && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <span className="animate-spin">⏳</span> Sending...
                        </div>
                      )}
                      {sendStatus === 'sent' && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Check className="w-4 h-4" /> Message sent!
                        </div>
                      )}
                      {sendStatus === 'error' && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" /> Failed to send message
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={commentMutation.isPending || !newComment.trim()}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-emerald-50 text-emerald-700 text-center p-4 rounded-lg font-medium flex items-center justify-center gap-2 border border-emerald-200 mt-6">
                <CheckCircle2 className="w-5 h-5" />
                <span>This ticket is closed to new comments.</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Metadata */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Ticket Status
            </h3>

            {user?.role === 'Customer' ? (
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                  ticket?.status === 'Open'
                    ? 'bg-blue-100 text-blue-700'
                    : ticket?.status === 'In Progress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {ticket?.status}
              </span>
            ) : (
              <select
                value={ticket?.status || ''}
                onChange={handleStatusChange}
                disabled={updateMutation.isPending}
                className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            )}
          </div>

          {/* Assignment Section - For Agents/Admins */}
          {['Agent', 'Admin'].includes(user?.role) && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6">
              <h3 className="text-sm font-bold text-green-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Assignment
              </h3>
              <div className="space-y-3">
                {isSelectingAgent ? (
                  <div className="space-y-2">
                    <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-2">
                      Select Agent
                    </p>
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option value="">-- Choose an Agent --</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          if (selectedAgentId) {
                            updateMutation.mutate({
                              id,
                              updateData: { assignedAgentId: selectedAgentId },
                            });
                            setIsSelectingAgent(false);
                          }
                        }}
                        disabled={updateMutation.isPending || !selectedAgentId}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateMutation.isPending ? 'Assigning...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setIsSelectingAgent(false)}
                        className="flex-1 px-3 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 text-xs rounded-lg font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : ticket?.assignedAgentId ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-2">
                        Assigned To
                      </p>
                      <p className="font-semibold text-green-900 bg-white px-4 py-2 rounded-lg border border-green-200 inline-block shadow-sm">
                        👤 {ticket?.assignedAgentId?.name || 'Unknown'}
                      </p>
                    </div>
                    {ticket?.assignedAgentId?._id === user?._id && (
                      <span className="text-xs bg-green-200 text-green-900 px-3 py-2 rounded-lg font-bold uppercase tracking-wide">
                        ✓ Your Ticket
                      </span>
                    )}
                    {user?.role === 'Admin' && (
                      <button
                        onClick={() => setIsSelectingAgent(true)}
                        className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        🔄 Change Agent
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">
                      No Agent Assigned Yet
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateMutation.mutate({
                            id,
                            updateData: { assignedAgentId: user?._id },
                          });
                        }}
                        disabled={updateMutation.isPending}
                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {updateMutation.isPending ? '⏳ Assigning...' : '👤 Assign to Me'}
                      </button>
                      <button
                        onClick={() => setIsSelectingAgent(true)}
                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
                      >
                        👥 Assign to Other
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {['Agent', 'Admin'].includes(user?.role) && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">
                    AI Triage
                  </h3>
                </div>
                {!isEditingAI && (
                  <button
                    onClick={handleEditAI}
                    disabled={updateMutation.isPending}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white px-2 py-1 rounded border border-indigo-200 hover:border-indigo-300 transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-indigo-400 font-semibold mb-1">Category</p>
                  {isEditingAI ? (
                    <select
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value)}
                      disabled={updateMutation.isPending}
                      className="w-full p-2 border border-indigo-300 rounded font-medium text-indigo-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Billing">Billing</option>
                      <option value="Technical">Technical</option>
                      <option value="Sales">Sales</option>
                      <option value="General">General</option>
                      <option value="Unclassified">Unclassified</option>
                    </select>
                  ) : (
                    <span className="font-medium text-indigo-900 bg-white px-3 py-1.5 rounded border border-indigo-100 inline-block transition-colors">
                      {ticket?.aiCategory || 'Unclassified'}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs text-indigo-400 font-semibold mb-1">Priority Alert</p>
                  {isEditingAI ? (
                    <select
                      value={editedPriority}
                      onChange={(e) => setEditedPriority(e.target.value)}
                      disabled={updateMutation.isPending}
                      className="w-full p-2 border border-indigo-300 rounded font-bold text-indigo-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  ) : (
                    <div
                      className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded border inline-block transition-colors ${
                        ticket?.aiPriority === 'Critical'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : ticket?.aiPriority === 'High'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : ticket?.aiPriority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : ticket?.aiPriority === 'Low'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {ticket?.aiPriority === 'Critical' && (
                        <AlertCircle className="w-4 h-4 mr-1" />
                      )}
                      {ticket?.aiPriority || 'Unassigned'}
                    </div>
                  )}
                </div>

                {(ticket?.aiConfidenceScore ?? null) !== null && ticket?.aiConfidenceScore > 0 && (
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold mb-1">Confidence Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
                          style={{ width: `${ticket?.aiConfidenceScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-indigo-900 min-w-fit">
                        {ticket?.aiConfidenceScore}%
                      </span>
                    </div>
                  </div>
                )}

                {isEditingAI && (
                  <div className="flex gap-2 pt-2 border-t border-indigo-100">
                    <button
                      onClick={() => setIsEditingAI(false)}
                      disabled={updateMutation.isPending}
                      className="flex-1 px-3 py-2 bg-white text-indigo-600 border border-indigo-300 rounded font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAI}
                      disabled={updateMutation.isPending}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DELETE SECTION - For Admin and Ticket Owner (Customer) */}
          {(user?.role === 'Admin' || user?._id === ticket?.customerId?._id) && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">
                  Delete Ticket
                </h3>
              </div>
              <p className="text-sm text-red-700 mb-4">
                {user?.role === 'Admin'
                  ? 'As an admin, you can permanently delete this ticket.'
                  : 'You can permanently delete this ticket.'}
              </p>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to delete this ticket? This action cannot be undone.'
                    )
                  ) {
                    deleteMutation.mutate(id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteMutation.isPending ? 'Deleting...' : 'Delete Ticket'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
