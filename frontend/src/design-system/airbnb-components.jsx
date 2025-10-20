/**
 * Airbnb-Style Components for Avinci
 * Clean, modern components with consistent design language
 */

import React from 'react';
import { motion } from 'framer-motion';
import { colors } from './colors';

// Button Component
export const AirbnbButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'text-white shadow-sm hover:shadow-md',
    secondary: 'text-white shadow-sm hover:shadow-md',
    outline: 'border-2 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
    danger: 'text-white shadow-sm hover:shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary[500] };
      case 'secondary':
        return { backgroundColor: colors.secondary[500] };
      case 'outline':
        return { 
          borderColor: colors.neutral[300],
          color: colors.neutral[700]
        };
      case 'ghost':
        return { color: colors.neutral[700] };
      case 'danger':
        return { backgroundColor: colors.error[500] };
      default:
        return { backgroundColor: colors.primary[500] };
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      style={getVariantStyles()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

// Card Component
export const AirbnbCard = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 shadow-sm';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  
  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <div className={`${baseClasses} ${hoverClasses} ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};

// Input Component
export const AirbnbInput = ({ 
  className = '', 
  error = false,
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';
  const errorClasses = error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500';
  
  return (
    <input
      className={`${baseClasses} ${errorClasses} ${className}`}
      style={{ '--tw-ring-color': colors.primary[500] }}
      {...props}
    />
  );
};

// Textarea Component
export const AirbnbTextarea = ({ 
  className = '', 
  error = false,
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 resize-none';
  const errorClasses = error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500';
  
  return (
    <textarea
      className={`${baseClasses} ${errorClasses} ${className}`}
      style={{ '--tw-ring-color': colors.primary[500] }}
      {...props}
    />
  );
};

// Badge Component
export const AirbnbBadge = ({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'text-white',
    secondary: 'text-white',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary[500] };
      case 'secondary':
        return { backgroundColor: colors.secondary[500] };
      default:
        return {};
    }
  };

  return (
    <span
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      style={getVariantStyles()}
      {...props}
    >
      {children}
    </span>
  );
};

// Avatar Component
export const AirbnbAvatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden ${className}`} {...props}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center text-white font-medium"
          style={{ backgroundColor: colors.primary[500] }}
        >
          {alt?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
};

// Loading Spinner Component
export const AirbnbSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors_map = {
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    white: '#FFFFFF',
    gray: colors.neutral[500],
  };

  return (
    <div
      className={`${sizes[size]} border-2 border-transparent rounded-full animate-spin ${className}`}
      style={{ borderTopColor: colors_map[color] }}
      {...props}
    />
  );
};

// Divider Component
export const AirbnbDivider = ({ 
  className = '',
  ...props 
}) => {
  return (
    <hr className={`border-gray-200 ${className}`} {...props} />
  );
};

// Empty State Component
export const AirbnbEmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '',
  ...props 
}) => {
  return (
    <div className={`text-center py-12 ${className}`} {...props}>
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.neutral[100] }}>
          <Icon className="w-8 h-8" style={{ color: colors.neutral[400] }} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
};

export default {
  AirbnbButton,
  AirbnbCard,
  AirbnbInput,
  AirbnbTextarea,
  AirbnbBadge,
  AirbnbAvatar,
  AirbnbSpinner,
  AirbnbDivider,
  AirbnbEmptyState,
};



