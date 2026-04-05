/* Professional UI Styling Utilities */

/* Base Styling Classes */
export const buttonStyles = {
  primary:
    'px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',

  secondary:
    'px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',

  danger:
    'px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50',

  success:
    'px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50',

  outline:
    'px-4 py-2.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50',
};

// Card Styles
export const cardStyles =
  'bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6';

// Input Styles
export const inputStyles =
  'w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-900';

// Badge Styles
export const badgeStyles = {
  primary: 'inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full',
  success: 'inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full',
  warning: 'inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full',
  danger: 'inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full',
};
