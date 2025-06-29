// src/components/ui/Badge.jsx
import React from 'react';

const Badge = ({ 
  children, 
  color = 'gray', 
  size = 'default',
  className = '',
  ...props 
}) => {
  // Color variants
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
  };

  // Combine all classes
  const classes = [
    'inline-flex items-center rounded-full font-medium',
    colorClasses[color] || colorClasses.gray,
    sizeClasses[size] || sizeClasses.default,
    className
  ].join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;