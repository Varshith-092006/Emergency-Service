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
  const colorVariants = {
    gray: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--text-muted)]/20',
    red: 'bg-[var(--error-color)]/10 text-[var(--error-color)] border-[var(--error-color)]/20',
    yellow: 'bg-[var(--warning-color)]/10 text-[var(--warning-color)] border-[var(--warning-color)]/20',
    green: 'bg-[var(--success-color)]/10 text-[var(--success-color)] border-[var(--success-color)]/20',
    blue: 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border-[var(--primary-color)]/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20', // Custom for orange
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-1 text-sm',
  };

  // Combine all classes
  const classes = [
    'inline-flex items-center rounded-lg font-bold border',
    colorVariants[color] || colorVariants.gray,
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