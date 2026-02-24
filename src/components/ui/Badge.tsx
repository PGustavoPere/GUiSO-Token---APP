import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ 
  className, 
  variant = 'primary', 
  size = 'md',
  children, 
  ...props 
}: BadgeProps) {
  const variants = {
    primary: 'bg-guiso-orange/10 text-guiso-orange border-guiso-orange/20',
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    neutral: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center justify-center font-bold uppercase tracking-widest rounded-full border',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
}
