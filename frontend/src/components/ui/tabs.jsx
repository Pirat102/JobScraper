import React from 'react';

export const Tabs = ({ defaultValue, children, className, onValueChange }) => {
  return (
    <div className={`w-full ${className}`}>
      {React.Children.map(children, child => {
        if (child) {
          return React.cloneElement(child, { defaultValue, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-2 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, onClick }) => {
  return (
    <button
      onClick={() => onClick?.(value)}
      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 focus:outline-none focus:border-primary"
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '' }) => {
  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};