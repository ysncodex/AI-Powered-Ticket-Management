import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../features/auth/authStore';
import { getTickets } from '../features/tickets/ticketApi';
import { Plus, AlertCircle, Clock, Bot, Filter, X, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import Pagination from '../components/ui/Pagination';

// Helper: Calculate time waiting
const getTimeWaiting = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  return `${Math.floor(diffMins / 1440)}d`;
};

const DashboardHome = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterAssigned, setFilterAssigned] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  const {
    data: tickets = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  });

  // Apply filters and sorting
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    // Priority filter (for Agents/Admins)
    if (filterPriority !== 'All' && ['Agent', 'Admin'].includes(user.role)) {
      filtered = filtered.filter((t) => t.aiPriority === filterPriority);
    }

    // Assigned filter (for Agents/Admins)
    if (filterAssigned !== 'All' && ['Agent', 'Admin'].includes(user.role)) {
      if (filterAssigned === 'me') {
        filtered = filtered.filter((t) => t.assignedAgentId && t.assignedAgentId._id === user._id);
      } else if (filterAssigned === 'unassigned') {
        filtered = filtered.filter((t) => !t.assignedAgentId);
      }
    }

    // Sorting
    if (sortBy === 'priority') {
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3, Unassigned: 4 };
      filtered.sort(
        (a, b) => (priorityOrder[a.aiPriority] || 5) - (priorityOrder[b.aiPriority] || 5)
      );
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // newest (default)
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [tickets, filterStatus, filterPriority, filterAssigned, sortBy, user._id, user.role]);

  if (isLoading)
    return <div className="p-10 text-center text-slate-500">Loading your workspace...</div>;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load tickets.</div>;

  const hasFilters = filterStatus !== 'All' || filterPriority !== 'All' || filterAssigned !== 'All';

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      {/* Analytics Dashboard */}
      <div className="mb-8">
        <AnalyticsDashboard tickets={tickets} role={user.role} />
      </div>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user.role === 'Customer' ? 'My Tickets' : 'Ticket Triage'}
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user.name} — {filteredTickets.length} ticket
            {filteredTickets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {user.role === 'Customer' && (
          <button
            onClick={() => navigate('/tickets/new')}
            disabled={user.restricted}
            title={user.restricted ? 'Your account has been restricted' : ''}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            New Ticket
          </button>
        )}
      </div>

      {/* Filters & Sorting - Only for Agents/Admins */}
      {['Agent', 'Admin'].includes(user.role) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500 flex-shrink-0" />
              <span className="font-semibold text-slate-900">Filters & Sorting</span>
            </div>
            {hasFilters && (
              <button
                onClick={() => {
                  setFilterStatus('All');
                  setFilterPriority('All');
                  setFilterAssigned('All');
                }}
                className="sm:ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors font-medium"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">🔴 Critical</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>

            {/* Assigned Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Assigned To</label>
              <select
                value={filterAssigned}
                onChange={(e) => setFilterAssigned(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors"
              >
                <option value="All">All Tickets</option>
                <option value="me">👤 My Tickets</option>
                <option value="unassigned">🔓 Unassigned</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-slate-400 transition-colors"
              >
                <option value="newest">⬇️ Newest First</option>
                <option value="oldest">⏱️ Oldest First (Time Waiting)</option>
                <option value="priority">⚠️ By Priority</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Grid */}
      {filteredTickets.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-lg">
            {tickets.length === 0 ? 'No tickets found.' : 'No tickets match your filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => navigate(`/tickets/${ticket._id}`)}
                className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                  ticket.aiPriority === 'Critical'
                    ? 'bg-red-50 border-2 border-red-300'
                    : ticket.aiPriority === 'High'
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-white border border-slate-200'
                }`}
              >
                <div>
                  {/* Customer Name - For Agents/Admins */}
                  {['Agent', 'Admin'].includes(user.role) && (
                    <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider truncate">
                      {ticket.customerId?.name || 'Unknown Customer'}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4 gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        ticket.status === 'Open'
                          ? 'bg-blue-100 text-blue-700'
                          : ticket.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {ticket.status}
                    </span>

                    {/* AI Priority Badge - Highly visible for Agents */}
                    {['Agent', 'Admin'].includes(user.role) && (
                      <span
                        className={`flex items-center gap-1 text-xs font-bold whitespace-nowrap ml-auto px-2 py-1 rounded-md ${
                          ticket.aiPriority === 'Critical'
                            ? 'text-red-700 bg-red-50 border border-red-200'
                            : ticket.aiPriority === 'High'
                              ? 'text-orange-700 bg-orange-50 border border-orange-200'
                              : ticket.aiPriority === 'Medium'
                                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                                : ticket.aiPriority === 'Low'
                                  ? 'text-green-700 bg-green-50 border border-green-200'
                                  : 'text-slate-600 bg-slate-50 border border-slate-200'
                        }`}
                      >
                        {(ticket.aiPriority === 'Critical' || ticket.aiPriority === 'High') && (
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        )}
                        {ticket.aiPriority || 'Unassigned'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {ticket.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">{ticket.description}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-current border-opacity-10">
                  {/* Time Waiting & Assigned Agent - For Agents */}
                  {['Agent', 'Admin'].includes(user.role) && (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1 min-w-0">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">⏱️ {getTimeWaiting(ticket.createdAt)}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 text-right ml-1 truncate">
                        {ticket.assignedAgentId?.name
                          ? `@${ticket.assignedAgentId.name}`
                          : '🔓 Unassigned'}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 flex items-center gap-1 min-w-0">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      Created: {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Last Updated - For Agents */}
                  {['Agent', 'Admin'].includes(user.role) && ticket.updatedAt && (
                    <div className="text-xs text-slate-400 flex items-center gap-1 min-w-0">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* AI Classification Tag */}
                  <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-md w-fit">
                    <Bot className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                    <span className="font-medium text-indigo-700 text-xs truncate">
                      {ticket.aiCategory}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredTickets.length}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardHome;
