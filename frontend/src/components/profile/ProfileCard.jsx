import React from 'react';
import { Mail, User, Shield, Calendar } from 'lucide-react';

const ProfileCard = ({ user, role }) => {
  const roleColors = {
    Customer: 'bg-blue-100 text-blue-700',
    Agent: 'bg-purple-100 text-purple-700',
    Admin: 'bg-red-100 text-red-700',
  };

  const roleIcons = {
    Customer: User,
    Agent: Shield,
    Admin: Shield,
  };

  const RoleIcon = roleIcons[role] || User;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${roleColors[role]}`}
        >
          <RoleIcon className="w-4 h-4" />
          {role}
        </span>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-1">{user?.name || 'Unknown User'}</h2>
      <p className="text-slate-500 text-sm mb-4">{role} Account</p>

      <div className="space-y-3 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-slate-700">{user?.email || 'No email'}</span>
        </div>

        {user?.createdAt && (
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-slate-700">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
