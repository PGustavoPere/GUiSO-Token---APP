import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'dark' | 'terracotta' | 'cream';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

export function Card({ 
  className, 
  variant = 'glass', 
  padding = 'md',
  rounded = '2xl',
  children, 
  ...props 
}: CardProps) {
  const variants = {
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 shadow-sm',
    dark: 'bg-guiso-dark text-white border border-guiso-dark shadow-sm',
    terracotta: 'bg-guiso-terracotta text-white border border-guiso-terracotta shadow-sm',
    cream: 'bg-guiso-cream border border-guiso-orange/20 shadow-sm',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12',
    xl: 'p-10 md:p-16',
  };

  const roundings = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-[2rem] md:rounded-[3rem]',
    full: 'rounded-full',
  };

  return (
    <div 
      className={cn(
        variants[variant],
        paddings[padding],
        roundings[rounded],
        'relative overflow-hidden',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
