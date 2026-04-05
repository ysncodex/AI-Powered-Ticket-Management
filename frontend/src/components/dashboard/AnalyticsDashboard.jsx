import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../features/auth/authStore';
import { getTickets } from '../../features/tickets/ticketApi';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const { user } = useAuthStore();

  // Fetch tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: getTickets,
  });

  // Calculate role-based analytics
  const analytics = useMemo(() => {
    const stats = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'Open').length,
      inProgress: tickets.filter((t) => t.status === 'In Progress').length,
      resolved: tickets.filter((t) => t.status === 'Resolved').length,
      closed: tickets.filter((t) => t.status === 'Closed').length,
      critical: tickets.filter((t) => t.aiPriority === 'Critical').length,
      high: tickets.filter((t) => t.aiPriority === 'High').length,
      medium: tickets.filter((t) => t.aiPriority === 'Medium').length,
      low: tickets.filter((t) => t.aiPriority === 'Low').length,
      avgResolutionTime: 0,
      customerCount: new Set(tickets.map((t) => t.customerId?._id)).size,
    };

    // Calculate average resolution time
    const resolvedTickets = tickets.filter((t) => t.status === 'Closed' || t.status === 'Resolved');
    if (resolvedTickets.length > 0) {
      const totalTime = resolvedTickets.reduce((sum, t) => {
        if (t.createdAt && t.updatedAt) {
          const ms = new Date(t.updatedAt) - new Date(t.createdAt);
          return sum + ms;
        }
        return sum;
      }, 0);
      stats.avgResolutionTime = Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60)); // hours
    }

    return stats;
  }, [tickets]);

  // Role-specific data
  const getRoleSpecificAnalytics = () => {
    if (user?.role === 'Customer') {
      return {
        myTickets: tickets.filter((t) => t.customerId?._id === user._id).length,
        myOpen: tickets.filter((t) => t.customerId?._id === user._id && t.status === 'Open').length,
        myResolved: tickets.filter((t) => t.customerId?._id === user._id && t.status !== 'Open')
          .length,
      };
    } else if (user?.role === 'Agent') {
      return {
        assignedToMe: tickets.filter((t) => t.assignedAgentId?._id === user._id).length,
        myActive: tickets.filter(
          (t) => t.assignedAgentId?._id === user._id && t.status !== 'Closed'
        ).length,
        myResolved: tickets.filter(
          (t) => t.assignedAgentId?._id === user._id && t.status === 'Closed'
        ).length,
        criticalAssigned: tickets.filter(
          (t) => t.assignedAgentId?._id === user._id && t.aiPriority === 'Critical'
        ).length,
      };
    } else if (user?.role === 'Admin') {
      const agents = new Set(
        tickets.filter((t) => t.assignedAgentId).map((t) => t.assignedAgentId?._id)
      ).size;
      return {
        totalAgents: agents,
        unassignedTickets: tickets.filter((t) => !t.assignedAgentId).length,
        overallOpenRate: Math.round((analytics.open / analytics.total) * 100),
        criticalTickets: analytics.critical,
      };
    }
  };

  const roleStats = getRoleSpecificAnalytics();

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase">Total Tickets</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{analytics.total}</p>
            </div>
            <Ticket className="w-12 h-12 text-blue-300 opacity-50" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold uppercase">Resolved</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {analytics.closed + analytics.resolved}
              </p>
              <p className="text-xs text-green-700 mt-1">
                {Math.round(((analytics.closed + analytics.resolved) / analytics.total) * 100) || 0}
                %
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-300 opacity-50" />
          </div>
        </div>

        {/* Critical */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-semibold uppercase">Critical/High</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {analytics.critical + analytics.high}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-300 opacity-50" />
          </div>
        </div>

        {/* Active/In Progress */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm border border-amber-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-semibold uppercase">In Progress</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">
                {analytics.inProgress + analytics.open}
              </p>
            </div>
            <Clock className="w-12 h-12 text-amber-300 opacity-50" />
          </div>
        </div>
      </div>

      {/* Role-Specific Stats */}
      {roleStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user?.role === 'Customer' && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <p className="text-slate-600 text-sm font-semibold mb-2">📋 My Tickets</p>
                <p className="text-4xl font-bold text-slate-900">{roleStats.myTickets}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-slate-600">
                    Open: <span className="font-semibold text-blue-600">{roleStats.myOpen}</span>
                  </p>
                  <p className="text-slate-600">
                    Resolved:{' '}
                    <span className="font-semibold text-green-600">{roleStats.myResolved}</span>
                  </p>
                </div>
              </div>
            </>
          )}

          {user?.role === 'Agent' && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <p className="text-slate-600 text-sm font-semibold mb-2">👤 Assigned to Me</p>
                <p className="text-4xl font-bold text-slate-900">{roleStats.assignedToMe}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-slate-600">
                    Active:{' '}
                    <span className="font-semibold text-amber-600">{roleStats.myActive}</span>
                  </p>
                  <p className="text-slate-600">
                    Resolved:{' '}
                    <span className="font-semibold text-green-600">{roleStats.myResolved}</span>
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <p className="text-slate-600 text-sm font-semibold mb-2">⚠️ Critical Tickets</p>
                <p className="text-4xl font-bold text-red-600">{roleStats.criticalAssigned}</p>
                <p className="text-xs text-slate-500 mt-4">Require immediate attention</p>
              </div>
            </>
          )}

          {user?.role === 'Admin' && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <p className="text-slate-600 text-sm font-semibold mb-2">👥 Active Agents</p>
                <p className="text-4xl font-bold text-slate-900">{roleStats.totalAgents}</p>
                <p className="text-xs text-slate-500 mt-4">Handling tickets</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <p className="text-slate-600 text-sm font-semibold mb-2">📭 Unassigned</p>
                <p className="text-4xl font-bold text-amber-600">{roleStats.unassignedTickets}</p>
                <p className="text-xs text-slate-500 mt-4">Waiting for assignment</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <p className="text-slate-600 text-sm font-semibold mb-2">📊 Open Rate</p>
                <p className="text-4xl font-bold text-blue-600">{roleStats.overallOpenRate}%</p>
                <p className="text-xs text-slate-500 mt-4">Of total tickets</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <p className="text-slate-600 text-sm font-semibold mb-2">🔴 Critical</p>
                <p className="text-4xl font-bold text-red-600">{roleStats.criticalTickets}</p>
                <p className="text-xs text-slate-500 mt-4">High priority tickets</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Status Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold mb-1">OPEN</p>
            <p className="text-2xl font-bold text-blue-900">{analytics.open}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-600 font-semibold mb-1">IN PROGRESS</p>
            <p className="text-2xl font-bold text-amber-900">{analytics.inProgress}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs text-purple-600 font-semibold mb-1">RESOLVED</p>
            <p className="text-2xl font-bold text-purple-900">{analytics.resolved}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-600 font-semibold mb-1">CLOSED</p>
            <p className="text-2xl font-bold text-slate-900">{analytics.closed}</p>
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-amber-600" />
          Priority Distribution
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs text-red-600 font-semibold mb-1">🔴 CRITICAL</p>
            <p className="text-2xl font-bold text-red-900">{analytics.critical}</p>
            <p className="text-xs text-red-600 mt-1">
              {Math.round((analytics.critical / analytics.total) * 100) || 0}%
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-xs text-orange-600 font-semibold mb-1">🟠 HIGH</p>
            <p className="text-2xl font-bold text-orange-900">{analytics.high}</p>
            <p className="text-xs text-orange-600 mt-1">
              {Math.round((analytics.high / analytics.total) * 100) || 0}%
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-600 font-semibold mb-1">🟡 MEDIUM</p>
            <p className="text-2xl font-bold text-amber-900">{analytics.medium}</p>
            <p className="text-xs text-amber-600 mt-1">
              {Math.round((analytics.medium / analytics.total) * 100) || 0}%
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-green-600 font-semibold mb-1">🟢 LOW</p>
            <p className="text-2xl font-bold text-green-900">{analytics.low}</p>
            <p className="text-xs text-green-600 mt-1">
              {Math.round((analytics.low / analytics.total) * 100) || 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
