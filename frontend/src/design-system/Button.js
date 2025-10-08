import React from 'react';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false,
    onClick,
    className = '',
    ...props 
}) => {
    const baseClasses = 'font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm focus:ring-blue-500',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full border border-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white rounded-full shadow-sm focus:ring-red-500',
        success: 'bg-green-600 hover:bg-green-700 text-white rounded-full shadow-sm focus:ring-green-500',
        outline: 'bg-transparent hover:bg-gray-50 text-gray-700 rounded-full border border-gray-300 focus:ring-gray-500'
    };
    
    const sizes = {
        sm: 'px-4 py-1.5 text-sm',
        md: 'px-6 py-2 text-base',
        lg: 'px-8 py-3 text-lg',
        xl: 'px-10 py-4 text-xl'
    };
    
    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
    
    return (
        <button
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
