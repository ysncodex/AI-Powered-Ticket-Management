import React from 'react';

const Input = ({ label, type = 'text', placeholder, error, ...props }) => {
  return (
    <div className="w-full space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        className={`w-full rounded-lg border px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
        }`}
        placeholder={placeholder}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
