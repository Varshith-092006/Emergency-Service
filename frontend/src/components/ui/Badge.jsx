// src/components/ui/Badge.jsx
import React from 'react';
import { cn } from '../lib/utils'; // Assuming you're using a utility function for class merging

const Badge = ({ 
  children, 
  color = 'gray', 
  size = 'default',
  className,
  ...props 
}) => {
  const colorVariants = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  const sizeVariants = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colorVariants[color],
        sizeVariants[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;