import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-guiso-orange hover:bg-guiso-terracotta text-white shadow-md hover:shadow-lg',
      secondary: 'bg-white/10 hover:bg-white/20 text-white',
      outline: 'border-2 border-guiso-orange text-guiso-orange hover:bg-guiso-orange/10',
      ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    };

    const sizes = {
      sm: 'py-1.5 px-4 text-xs',
      md: 'py-2 px-6 text-sm',
      lg: 'py-3 px-8 text-base md:text-lg',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
