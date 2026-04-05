import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', title, message, onClose, action }) => {
  const typeStyles = {
    error: 'bg-red-50 border border-red-200 text-red-800',
    success: 'bg-green-50 border border-green-200 text-green-800',
    warning: 'bg-amber-50 border border-amber-200 text-amber-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800',
  };

  const iconStyles = {
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div className={`rounded-lg p-4 flex items-start gap-3 ${typeStyles[type]}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconStyles[type]}`} />
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold text-sm mb-1">{title}</h3>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-semibold px-3 py-1 rounded hover:opacity-75 transition-opacity"
          >
            {action.label}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
