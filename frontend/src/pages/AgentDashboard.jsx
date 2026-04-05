import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../features/auth/authStore';
import { getTickets } from '../features/tickets/ticketApi';
import { getAgentStats } from '../features/users/userApi';
import {
  Plus,
  AlertCircle,
  Clock,
  Bot,
  Filter,
  X,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import Pagination from '../components/ui/Pagination';

const getTimeWaiting = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  return `${Math.floor(diffMins / 1440)}d`;
};

const AgentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Fetch tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  });

  // Fetch agent stats
  const { data: stats = {} } = useQuery({
    queryKey: ['agentStats'],
    queryFn: getAgentStats,
    enabled: ['Agent', 'Admin'].includes(user?.role),
  });

  // Check if user has permission to access this dashboard
  if (!['Agent', 'Admin'].includes(user?.role)) {
    return (
      <div className="p-10 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">Only Agents and Admins can access this dashboard.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Filter tickets assigned to current agent
  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter((t) => t.assignedAgentId?._id === user?._id);

    if (filterStatus !== 'All') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }

    if (filterPriority !== 'All') {
      filtered = filtered.filter((t) => t.aiPriority === filterPriority);
    }

    // Sort by priority by default
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3, Unassigned: 4 };
    filtered.sort(
      (a, b) => (priorityOrder[a.aiPriority] || 5) - (priorityOrder[b.aiPriority] || 5)
    );

    return filtered;
  }, [tickets, filterStatus, filterPriority, user?._id]);

  const hasFilters = filterStatus !== 'All' || filterPriority !== 'All';

  if (ticketsLoading) {
    return <div className="p-10 text-center text-slate-500">Loading your workspace...</div>;
  }

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      {/* Analytics Dashboard */}
      <div className="mb-8">
        <AnalyticsDashboard tickets={filteredTickets} role={user?.role} />
      </div>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agent Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.name} — {filteredTickets.length} ticket
            {filteredTickets.length !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase">Active Tickets</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {filteredTickets.filter((t) => t.status !== 'Closed').length}
              </p>
            </div>
            <Briefcase className="w-12 h-12 text-blue-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-semibold uppercase">Critical/High</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {filteredTickets.filter((t) => ['Critical', 'High'].includes(t.aiPriority)).length}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold uppercase">Resolved</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {filteredTickets.filter((t) => t.status === 'Closed').length}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-300" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <span className="font-semibold text-slate-900">Filters</span>
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                setFilterStatus('All');
                setFilterPriority('All');
              }}
              className="sm:ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors font-medium"
            >
              <X className="w-3 h-3" />
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">🔴 Critical</option>
              <option value="High">🟠 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-lg">
            {tickets.length === 0
              ? 'No tickets assigned to you.'
              : 'No tickets match your filters.'}
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
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {ticket.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">{ticket.description}</p>

                  <div className="text-xs text-slate-600 mb-2">
                    Customer:{' '}
                    <span className="font-semibold">{ticket.customerId?.name || 'Unknown'}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-current border-opacity-10">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>⏱️ {getTimeWaiting(ticket.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>

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

export default AgentDashboard;
