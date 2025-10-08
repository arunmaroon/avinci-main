import React from 'react';

const Card = ({ 
    children, 
    variant = 'default', 
    padding = 'md',
    className = '',
    ...props 
}) => {
    const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-100';
    
    const variants = {
        default: 'bg-white',
        elevated: 'bg-white shadow-lg',
        outlined: 'bg-white border-2 border-gray-200',
        filled: 'bg-gray-50'
    };
    
    const paddings = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
    };
    
    const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`;
    
    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

export default Card;
